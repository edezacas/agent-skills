# edezacas Skills

## Overview
edezacas shared AI coding skills. Each skill is a directory with a `SKILL.md` file following the agentskills.io format.

## Stack
- Skills: Markdown (`SKILL.md`) — no build step, agentskills.io format

## Evaluating skills

Each skill can have an `evals/evals.json` following the [agentskills.io evaluation format](https://agentskills.io/skill-creation/evaluating-skills). The file defines test cases with prompts, expected outputs, and verifiable assertions.

To run evals, use `node evals/run.mjs` (no dependencies). Each case runs twice through `pi -p` — with the skill and without it — so the baseline shows what the skill actually adds; the output is graded against the assertions and results land in `evals/workspace/iteration-N/` (gitignored): `transcript.md`, `timing.json`, `grading.json` and `grading_raw.md` per run, plus `benchmark.json` per iteration.

```bash
node evals/run.mjs                            # every skill, both configs
node evals/run.mjs --only tdd --cases 1       # smoke test
node evals/run.mjs --jobs 1 --iteration 5     # serial, fixed iteration
node evals/run.mjs --regrade --iteration 5    # re-grade without re-running
```

A case can declare `files` (paths relative to the skill, copied into the workdir by basename) to give the agent something to read.

An assertion is a string, or `{ "text": "...", "guardrail": true }`. Use `guardrail` for a rule the current model already follows and that should never regress — the point of the case is elsewhere. `benchmark.json` reports the two apart: `skill_signal` (assertions that can fail because of the skill) and `guardrail` (expected at 1.0). A guardrail assertion that starts failing is a real regression, not a signal.

## Agents

Skills follow the agentskills.io format (`SKILL.md` + standard frontmatter), so the same folders work everywhere. `npx skills add edezacas/agent-skills` symlinks them into every detected agent. To place them by hand, use the agent's skills directory:

- `~/.claude/skills/` — Claude Code
- `~/.pi/agent/skills/` — pi
- `.agents/skills/` — agents that read the shared location

For agents without native support (Cursor, Windsurf), paste the `SKILL.md` contents into the agent's rules file.

## Structure
```
angular-conventions/SKILL.md          # Core Angular patterns — triggers automatically
angular-conventions/evals/evals.json  # convention violation cases
code-design/SKILL.md                  # Architecture judgement, no over-engineering — triggers automatically
code-design/evals/evals.json          # over-engineering guardrail cases
decision-records/SKILL.md             # ADR limits: one decision, 20 lines, no code, no history
decision-records/evals/evals.json     # budget, history, code-leak and invented-reason cases
init-project/SKILL.md                 # CLAUDE.md / AGENTS.md creation guide — triggers automatically
init-project/evals/evals.json         # bloated/section-mixing guardrail cases
tdd/SKILL.md                          # Red → green loop and test quality — triggers automatically
tdd/evals/evals.json                  # test quality guardrail cases
web-performance/SKILL.md              # Measure-first perf loop, auto-triggered
web-performance/evals/evals.json      # method and guardrail eval cases
evals/run.mjs                         # eval runner — with/without skill, grading, benchmark
evals/workspace/                      # gitignored — local eval results go here
```

## Conventions
- `SKILL.md` files are pure Markdown — no agent-specific syntax
- `CLAUDE.md` is a symlink to `AGENTS.md`; edit `AGENTS.md` only
- Every change to a `SKILL.md` bumps `metadata.version`: patch for wording, minor for new or changed guidance, major for a rule that inverts or removes guidance
- The `license` frontmatter of every `SKILL.md` matches `LICENSE` (Apache-2.0); attribution changes go in `NOTICE`, and reusing the content means keeping both files

## Gotchas
- `evals/workspace/` is gitignored; eval results stay local
- One run per case is noisy: the same assertion can flip between iterations, so repeat before trusting a small delta
- `pi -p` needs stdin closed or it hangs; the runner handles this
