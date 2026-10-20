# edezacas Skills

## Overview
edezacas shared AI coding skills. Each skill is a directory with a `SKILL.md` file following the agentskills.io format.

## Stack
- Skills: Markdown (`SKILL.md`) — no build step, agentskills.io format

## Evaluating skills

Each skill can have an `evals/evals.json` following the [agentskills.io evaluation format](https://agentskills.io/skill-creation/evaluating-skills). The file defines test cases with prompts, expected outputs, and verifiable assertions.

To run evals, load the `evals.json`, execute each prompt against your project (with and without the skill), grade the assertions, and record results in `evals/workspace/` (gitignored). See the agentskills.io docs for the full workspace structure and grading format.

## Structure
```
angular-conventions/SKILL.md          # Core Angular patterns — triggers automatically
init-project/SKILL.md                 # AGENTS.md creation guide — triggers automatically
web-performance/SKILL.md              # Measure-first perf loop, auto-triggered
web-performance/evals/evals.json      # method and guardrail eval cases
evals/workspace/                      # gitignored — local eval results go here
```

> SPDD skills (`spdd-canvas`, `spdd-design`, `spdd-implement`, `spdd-verify`, `spdd-sync`, `spdd-migrate`) moved to [edezacas/open-spdd](https://github.com/edezacas/open-spdd).

## Conventions
- `SKILL.md` files are pure Markdown — no agent-specific syntax
- `CLAUDE.md` is a symlink to `AGENTS.md`; edit `AGENTS.md` only

## Gotchas
- `evals/workspace/` is gitignored; eval results stay local
