# edezacas Skills

## Overview
edezacas shared AI coding skills. Each skill is a directory with a `SKILL.md` file following the agentskills.io format.

## Stack
- Skills: Markdown (`SKILL.md`) — no build step, agentskills.io format

## Evaluating skills

Each skill can have an `evals/evals.json` following the [agentskills.io evaluation format](https://agentskills.io/skill-creation/evaluating-skills). The file defines test cases with prompts, expected outputs, and verifiable assertions.

To run evals, load the `evals.json`, execute each prompt against your project (with and without the skill), grade the assertions, and record results in `evals/workspace/` (gitignored). See the agentskills.io docs for the full workspace structure and grading format.

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
init-project/SKILL.md                 # CLAUDE.md / AGENTS.md creation guide — triggers automatically
init-project/evals/evals.json         # bloated/section-mixing guardrail cases
tdd/SKILL.md                          # Red → green loop and test quality — triggers automatically
tdd/evals/evals.json                  # test quality guardrail cases
web-performance/SKILL.md              # Measure-first perf loop, auto-triggered
web-performance/evals/evals.json      # method and guardrail eval cases
evals/workspace/                      # gitignored — local eval results go here
```

## Conventions
- `SKILL.md` files are pure Markdown — no agent-specific syntax
- `CLAUDE.md` is a symlink to `AGENTS.md`; edit `AGENTS.md` only

## Gotchas
- `evals/workspace/` is gitignored; eval results stay local
