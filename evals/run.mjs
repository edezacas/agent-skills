#!/usr/bin/env node
// Eval runner for the edezacas skills.
//
// Runs every case in <skill>/evals/evals.json twice — with the skill and
// without it — grades each assertion with an LLM judge, and writes the
// workspace described in AGENTS.md:
//
//   evals/workspace/iteration-N/<skill>/eval-<id>-<slug>/
//     with_skill/{outputs,transcript.md,timing.json,grading.json}
//     without_skill/{...}
//   evals/workspace/iteration-N/benchmark.json
//
// Usage:
//   node evals/run.mjs                        # every skill, both configs
//   node evals/run.mjs --only tdd             # one skill
//   node evals/run.mjs --only tdd --cases 1   # smoke test
//   node evals/run.mjs --configs with         # skip the baseline
//   node evals/run.mjs --jobs 1 --iteration 3

import { spawn } from 'node:child_process';
import { mkdir, cp, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const REPO = path.resolve(import.meta.dirname, '..');
const WORKSPACE = path.join(REPO, 'evals', 'workspace');
const RUN_TIMEOUT_MS = 300_000;
const GRADE_TIMEOUT_MS = 180_000;

// ---------------------------------------------------------------- args

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const only = opt('only', null);
const caseLimit = Number(opt('cases', 0)) || Infinity;
const jobs = Number(opt('jobs', 3));
const configs = opt('configs', 'with,without').split(',');
const iteration = opt('iteration', null);
const regrade = args.includes('--regrade');

// ------------------------------------------------------------- helpers

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

// stdin must be closed when there is no prompt: pi -p blocks forever on a pipe
// that never ends. Prompts travel through stdin because argv hits E2BIG with long
// transcripts.
function pi(argv, { cwd, timeout, input }) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn('pi', argv, {
      cwd,
      stdio: [input === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let timer = null;
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    if (input !== undefined) child.stdin.end(input);
    const done = (err) => {
      if (timer) clearTimeout(timer);
      resolve({ err, stdout, stderr, durationMs: Date.now() - started, timedOut: child.killed });
    };
    timer = setTimeout(() => child.kill('SIGKILL'), timeout);
    child.on('error', done);
    child.on('close', (code) => done(code === 0 ? null : new Error(`exit ${code}`)));
  });
}

function parseEvents(stdout) {
  const events = [];
  for (const line of stdout.split('\n')) {
    if (!line.startsWith('{')) continue;
    try {
      events.push(JSON.parse(line));
    } catch {}
  }
  return events;
}

// Assistant text of the last turn, plus token and duration totals.
function summarize(events) {
  let text = '';
  let turns = 0;
  let tokens = 0;
  for (const e of events) {
    if (e.type === 'turn_end') {
      turns++;
      const m = e.message ?? {};
      tokens += m.usage?.totalTokens ?? 0;
      text = (m.content ?? [])
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('\n');
    }
  }
  return { text, turns, tokens };
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.angular', 'coverage']);

async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else out.push({ full, rel: path.relative(base, full) });
  }
  return out;
}

const FIXTURE = {
  'package.json': JSON.stringify(
    {
      name: 'acme-app',
      version: '1.0.0',
      private: true,
      scripts: { build: 'tsc', dev: 'tsc --watch', test: 'vitest', lint: 'eslint .' },
      devDependencies: { typescript: '^5.4.0', vitest: '^1.6.0', eslint: '^9.0.0', prettier: '^3.2.0' },
    },
    null,
    2,
  ) + '\n',
  '.prettierrc.json': '{ "semi": false, "singleQuote": true, "printWidth": 100 }\n',
  'tsconfig.json': '{ "compilerOptions": { "strict": true, "target": "ES2022", "module": "ESNext" } }\n',
  'README.md': '# acme-app\n\nInternal order management service.\n',
  'src/index.ts': "export const start = () => console.log('acme-app')\n",
};

async function prepareWorkdir(dir) {
  await mkdir(dir, { recursive: true });
  const expected = new Map();
  for (const [name, content] of Object.entries(FIXTURE)) {
    const target = path.join(dir, name);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
    expected.set(name, content);
  }
  return expected;
}

// Files the agent created or changed, with their content, relative to the workdir.
async function collectOutputs(workdir, outputsDir, expected) {
  const changed = [];
  for (const { full, rel } of await walk(workdir)) {
    const content = await readFile(full, 'utf8');
    if (expected.get(rel) === content) continue;
    if (content.length > 200_000) continue;
    const target = path.join(outputsDir, rel);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
    changed.push({ rel, content });
  }
  return changed;
}

// Extra input files for a case, copied into the workdir by basename.
async function copyCaseFiles(testCase, workdir, skillDir, expected) {
  for (const file of testCase.files ?? []) {
    const source = path.join(skillDir, file);
    if (!existsSync(source)) throw new Error(`missing eval file: ${file}`);
    // evals/files/src/user.ts lands at src/user.ts, so a case can supply files
    // where the prompt expects them.
    const rel = file.includes('/files/') ? file.slice(file.indexOf('/files/') + 7) : path.basename(file);
    const target = path.join(workdir, rel);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(source, target, { force: true });
    expected.set(rel, await readFile(source, 'utf8'));
  }
}

// -------------------------------------------------------------- grading

// An assertion is either a string or { text, guardrail: true }. Guardrails encode a
// rule the current model already follows; they are reported apart from the
// assertions that can actually fail because of the skill.
const assertionText = (a) => (typeof a === 'string' ? a : a.text);
const isGuardrail = (a) => typeof a === 'object' && a.guardrail === true;

function gradingPrompt(testCase, response, files, baseline = []) {
  const fileBlock = files.length
    ? files
        .map((f) => `--- ${f.rel} ---\n${f.content.slice(0, 4000)}${f.content.length > 4000 ? '\n[truncated]' : ''}`)
        .join('\n\n')
        .slice(0, 24_000)
    : '(none)';
  // Input files the agent did not touch, so "leaves X unchanged" and "keeps the old
  // records" are verifiable instead of failing for lack of a baseline.
  const label = {
    deleted: 'DELETED by the agent',
    modified: 'ORIGINAL INPUT, NOW MODIFIED',
    unchanged: 'UNCHANGED from the input',
  };
  const baselineBlock = baseline.length
    ? baseline
        .map((b) =>
          b.state === 'deleted'
            ? `--- ${b.rel} --- ${label.deleted}`
            : `--- ${b.rel} --- ${label[b.state]}\n${b.content.slice(0, 2000)}${
                b.content.length > 2000 ? '\n[truncated]' : ''
              }`,
        )
        .join('\n\n')
        .slice(0, 16_000)
    : '(none)';
  return [
    'You are grading one agent response against a list of assertions.',
    '',
    `TASK GIVEN TO THE AGENT:\n${testCase.prompt}`,
    '',
    `WHAT A GOOD RESULT LOOKS LIKE:\n${testCase.expected_output}`,
    '',
    `AGENT RESPONSE:\n${response || '(the agent produced no text)'}`,
    '',
    `FILES THE AGENT CREATED OR MODIFIED, WITH THEIR CONTENT:\n${fileBlock}`,
    '',
    `FILES PROVIDED AS INPUT, WITH THEIR ORIGINAL CONTENT:\n${baselineBlock}`,
    '',
    'ASSERTIONS:',
    ...testCase.assertions.map((a, i) => `${i + 1}. ${assertionText(a)}`),
    '',
    'Rules: a PASS needs concrete evidence quoted from the response or from a file.',
    'If the evidence is missing, ambiguous, or only implied, it is a FAIL. Do not give',
    'the benefit of the doubt. For assertions phrased as "does not do X", pass only when',
    'the response and the files can be checked and X is absent.',
    'A file marked UNCHANGED from the input is evidence that the agent left it alone, a file',
    'marked DELETED was removed, and a file marked ORIGINAL INPUT, NOW MODIFIED states how it',
    'read before the agent worked, for comparison with its current content.',
    '',
    'Answer with ONLY this JSON, no prose and no code fences:',
    '{"assertion_results":[{"text":"<assertion>","passed":true,"evidence":"<quote or reference>"}],"summary":{"passed":0,"failed":0,"total":0,"pass_rate":0}}',
  ].join('\n');
}

function parseGrading(raw) {
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function summarizeGrading(grading, testCase) {
  const results = grading?.assertion_results ?? [];
  const guardrailTexts = new Set((testCase?.assertions ?? []).filter(isGuardrail).map(assertionText));
  const signal = results.filter((r) => !guardrailTexts.has(r.text));
  const guardrail = results.filter((r) => guardrailTexts.has(r.text));
  const passed = results.filter((r) => r.passed).length;
  return {
    assertion_results: results,
    summary: {
      passed,
      failed: results.length - passed,
      total: results.length,
      pass_rate: results.length ? passed / results.length : 0,
      skill_signal: {
        passed: signal.filter((r) => r.passed).length,
        total: signal.length,
      },
      guardrail: {
        passed: guardrail.filter((r) => r.passed).length,
        total: guardrail.length,
      },
    },
  };
}

// ---------------------------------------------------------------- stats

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const stddev = (xs) =>
  xs.length < 2 ? 0 : Math.sqrt(xs.reduce((a, b) => a + (b - mean(xs)) ** 2, 0) / (xs.length - 1));

function configStats(runs) {
  const rates = runs.map((r) => r.grading?.summary.pass_rate ?? 0);
  return {
    pass_rate: { mean: +mean(rates).toFixed(3), stddev: +stddev(rates).toFixed(3) },
    time_seconds: {
      mean: +mean(runs.map((r) => r.timing.duration_ms / 1000)).toFixed(1),
      stddev: +stddev(runs.map((r) => r.timing.duration_ms / 1000)).toFixed(1),
    },
    tokens: {
      mean: Math.round(mean(runs.map((r) => r.timing.total_tokens))),
      stddev: Math.round(stddev(runs.map((r) => r.timing.total_tokens))),
    },
    assertions: {
      passed: runs.reduce((n, r) => n + (r.grading?.summary.passed ?? 0), 0),
      total: runs.reduce((n, r) => n + (r.grading?.summary.total ?? 0), 0),
    },
    skill_signal: {
      pass_rate: rate(
        runs.map((r) => r.grading?.summary.skill_signal?.passed ?? 0),
        runs.map((r) => r.grading?.summary.skill_signal?.total ?? 0),
      ),
      passed: runs.reduce((n, r) => n + (r.grading?.summary.skill_signal?.passed ?? 0), 0),
      total: runs.reduce((n, r) => n + (r.grading?.summary.skill_signal?.total ?? 0), 0),
    },
    guardrail: {
      pass_rate: rate(
        runs.map((r) => r.grading?.summary.guardrail?.passed ?? 0),
        runs.map((r) => r.grading?.summary.guardrail?.total ?? 0),
      ),
      passed: runs.reduce((n, r) => n + (r.grading?.summary.guardrail?.passed ?? 0), 0),
      total: runs.reduce((n, r) => n + (r.grading?.summary.guardrail?.total ?? 0), 0),
    },
  };
}

// Pass rate over a set of runs, weighted by assertions (not by run).
function rate(passed, total) {
  const t = total.reduce((a, b) => a + b, 0);
  return +((t ? passed.reduce((a, b) => a + b, 0) / t : 0)).toFixed(3);
}

function benchmark(runs) {
  const withSkill = runs.filter((r) => r.config === 'with_skill');
  const without = runs.filter((r) => r.config === 'without_skill');
  const w = configStats(withSkill);
  const wo = configStats(without);
  const graded = runs.filter((r) => r.grading && !r.grading.error).length;
  return {
    run_summary: {
      with_skill: w,
      without_skill: wo,
      delta: {
        pass_rate: +(w.pass_rate.mean - wo.pass_rate.mean).toFixed(3),
        skill_signal: +(w.skill_signal.pass_rate - wo.skill_signal.pass_rate).toFixed(3),
        time_seconds: +(w.time_seconds.mean - wo.time_seconds.mean).toFixed(1),
        tokens: w.tokens.mean - wo.tokens.mean,
      },
    },
    graded_runs: graded,
    total_runs: runs.length,
  };
}

// ------------------------------------------------------------------ run

async function nextIteration() {
  const existing = existsSync(WORKSPACE) ? await readdir(WORKSPACE) : [];
  const used = existing.map((d) => Number(String(d).match(/^iteration-(\d+)$/)?.[1] ?? 0));
  return iteration ? Number(iteration) : Math.max(0, ...used) + 1;
}

async function gradeCase(testCase, config, response, files, dir, baseline) {
  let raw = '';
  let parsed = null;
  for (const attempt of [1, 2]) {
    const {
      stdout,
      stderr,
      timedOut,
    } = await pi(
      ['-p', '--no-session', '--no-context-files', '--no-skills', '--no-tools', '--mode', 'json'],
      {
        cwd: dir,
        timeout: GRADE_TIMEOUT_MS,
        input:
          gradingPrompt(testCase, response, files, baseline) +
          (attempt === 2 ? '\n\nPrevious answer was not valid JSON. Answer with the JSON object only.' : ''),
      },
    );
    raw = summarize(parseEvents(stdout)).text;
    if (stderr.trim()) await writeFile(path.join(dir, `grading_stderr_${attempt}.log`), stderr);
    if (timedOut) continue;
    parsed = parseGrading(raw);
    if (parsed?.assertion_results?.length) break;
  }

  await writeFile(path.join(dir, 'grading_raw.md'), raw + '\n');
  const grading = parsed?.assertion_results?.length
    ? summarizeGrading(parsed, testCase)
    : {
        assertion_results: [],
        summary: { passed: 0, failed: 0, total: 0, pass_rate: 0, skill_signal: { passed: 0, total: 0 }, guardrail: { passed: 0, total: 0 } },
        error: 'unparseable',
      };
  await writeFile(path.join(dir, 'grading.json'), JSON.stringify(grading, null, 2) + '\n');
  return grading;
}

async function runCase(skill, testCase, itDir) {
  const caseDir = path.join(itDir, slug(skill.name), `eval-${testCase.id}-${slug(testCase.prompt)}`);
  const skillCopy = path.join(itDir, 'skills', skill.name);

  const runs = [];
  for (const config of configs) {
    const name = config === 'with' ? 'with_skill' : 'without_skill';
    const dir = path.join(caseDir, name);
    const workdir = path.join(dir, 'work');
    const outputsDir = path.join(dir, 'outputs');
    const expected = await prepareWorkdir(workdir);
    await copyCaseFiles(testCase, workdir, skill.dir, expected);
    await mkdir(outputsDir, { recursive: true });

    const argv = [
      '-p',
      '--no-session',
      '--no-context-files',
      '--no-skills',
      '--mode',
      'json',
      ...(config === 'with' ? ['--skill', skillCopy] : []),
    ];
    const started = Date.now();
    const { stdout, stderr, timedOut } = await pi(argv, {
      cwd: workdir,
      timeout: RUN_TIMEOUT_MS,
      input: testCase.prompt,
    });
    const { text, tokens, turns } = summarize(parseEvents(stdout));
    if (stderr.trim()) await writeFile(path.join(dir, 'stderr.log'), stderr);

    const timing = { total_tokens: tokens, duration_ms: Date.now() - started, turns, timed_out: timedOut };
    await writeFile(path.join(dir, 'transcript.md'), text + '\n');
    await writeFile(path.join(dir, 'timing.json'), JSON.stringify(timing, null, 2) + '\n');
    const files = await collectOutputs(workdir, outputsDir, expected);
    const changed = new Set(files.map((f) => f.rel));
    const baseline = [...expected].map(([rel, content]) => ({
      rel,
      content,
      state: changed.has(rel)
        ? 'modified'
        : existsSync(path.join(workdir, rel))
          ? 'unchanged'
          : 'deleted',
    }));
    // The agent may npm-install into workdir; keep only outputs/ after grading.
    await rm(workdir, { recursive: true, force: true });

    const grading = await gradeCase(testCase, config, text, files, dir, baseline);
    runs.push({ skill: skill.name, id: testCase.id, config: name, timing, grading });

    const s = grading.summary;
    console.log(
      `  ${skill.name} #${testCase.id} ${name.padEnd(13)} ${s.passed}/${s.total} pass  ` +
        `${(timing.duration_ms / 1000).toFixed(1)}s  ${timing.total_tokens} tok`,
    );
  }
  return runs;
}

// Rebuild the run list of an existing iteration from disk.
async function loadRuns(itDir) {
  const runs = [];
  for (const skill of await readdir(itDir, { withFileTypes: true })) {
    if (!skill.isDirectory() || skill.name === 'skills') continue;
    for (const dir of await readdir(path.join(itDir, skill.name), { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      for (const config of ['with_skill', 'without_skill']) {
        const runDir = path.join(itDir, skill.name, dir.name, config);
        if (!existsSync(path.join(runDir, 'timing.json'))) continue;
        runs.push({
          skill: skill.name,
          id: Number(dir.name.split('-')[1]),
          config,
          timing: JSON.parse(await readFile(path.join(runDir, 'timing.json'), 'utf8')),
          grading: existsSync(path.join(runDir, 'grading.json'))
            ? JSON.parse(await readFile(path.join(runDir, 'grading.json'), 'utf8'))
            : null,
          runDir,
          caseDir: path.join(itDir, skill.name, dir.name),
        });
      }
    }
  }
  return runs;
}

async function writeBenchmark(runs, itDir, meta) {
  const perSkill = {};
  for (const name of new Set(runs.map((r) => r.skill))) {
    perSkill[name] = benchmark(runs.filter((r) => r.skill === name));
  }
  await writeFile(
    path.join(itDir, 'benchmark.json'),
    JSON.stringify(
      { ...meta, overall: benchmark(runs), per_skill: perSkill },
      null,
      2,
    ) + '\n',
  );
}

async function regradeIteration(itDir) {
  const runs = await loadRuns(itDir);
  const broken = runs.filter((r) => !r.grading?.summary?.total);
  console.log(`iteration ${path.basename(itDir)}: ${broken.length} run(s) to re-grade`);
  for (const run of broken) {
    const skill = { name: run.skill, dir: path.join(REPO, run.skill) };
    const { evals } = JSON.parse(await readFile(path.join(skill.dir, 'evals', 'evals.json'), 'utf8'));
    const testCase = evals.find((e) => e.id === run.id);
    const transcript = await readFile(path.join(run.runDir, 'transcript.md'), 'utf8');
    const outputsDir = path.join(run.runDir, 'outputs');
    const files = existsSync(outputsDir)
      ? await Promise.all(
          (await walk(outputsDir)).map(async (f) => ({
            rel: f.rel,
            content: await readFile(f.full, 'utf8'),
          })),
        )
      : [];
    run.grading = await gradeCase(testCase, run.config, transcript.trim(), files, run.runDir);
    console.log(`  re-graded ${run.skill} #${run.id} ${run.config}: ${run.grading.summary.passed}/${run.grading.summary.total}`);
  }
  const meta = JSON.parse(await readFile(path.join(itDir, 'benchmark.json'), 'utf8'));
  await writeBenchmark(runs, itDir, {
    iteration: meta.iteration,
    created_at: meta.created_at,
    model: meta.model,
    configs: meta.configs,
    cases: meta.cases,
    regraded_at: new Date().toISOString(),
  });
  console.log('benchmark rebuilt');
}

async function main() {
  if (regrade) {
    const it = iteration ?? (await nextIteration()) - 1;
    return regradeIteration(path.join(WORKSPACE, `iteration-${it}`));
  }
  const skills = (await readdir(REPO, { withFileTypes: true }))
    .filter((d) => d.isDirectory() && existsSync(path.join(REPO, d.name, 'SKILL.md')))
    .filter((d) => !only || d.name === only)
    .map((d) => ({ name: d.name, dir: path.join(REPO, d.name) }));

  if (!skills.length) throw new Error(`no skill matches --only ${only}`);

  const it = await nextIteration();
  const itDir = path.join(WORKSPACE, `iteration-${it}`);
  await mkdir(itDir, { recursive: true });
  for (const skill of skills) await cp(skill.dir, path.join(itDir, 'skills', skill.name), { recursive: true });

  console.log(`iteration-${it} · configs: ${configs.join(',')} · jobs: ${jobs}`);

  const queue = [];
  for (const skill of skills) {
    const evalsFile = path.join(skill.dir, 'evals', 'evals.json');
    if (!existsSync(evalsFile)) {
      console.log(`- ${skill.name}: no evals.json, skipped`);
      continue;
    }
    const { evals } = JSON.parse(await readFile(evalsFile, 'utf8'));
    for (const testCase of evals.slice(0, caseLimit)) queue.push({ skill, testCase });
  }

  const runs = [];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(jobs, queue.length) }, async () => {
      while (cursor < queue.length) {
        const { skill, testCase } = queue[cursor++];
        console.log(`> ${skill.name} #${testCase.id}`);
        runs.push(...(await runCase(skill, testCase, itDir)));
      }
    }),
  );

  const perSkill = {};
  for (const skill of skills) {
    const own = runs.filter((r) => r.skill === skill.name);
    if (own.length) perSkill[skill.name] = benchmark(own);
  }
  const overall = benchmark(runs);
  const meta = {
    iteration: it,
    created_at: new Date().toISOString(),
    model: process.env.PI_MODEL ?? null,
    configs,
    cases: runs.length / configs.length,
  };
  await writeFile(
    path.join(itDir, 'benchmark.json'),
    JSON.stringify({ ...meta, overall, per_skill: perSkill }, null, 2) + '\n',
  );
  console.log(`\nwrote ${path.relative(REPO, itDir)}/benchmark.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
