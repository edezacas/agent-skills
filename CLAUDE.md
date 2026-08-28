# edezacas Skills

## Overview
edezacas shared Claude Code skills. Provides automatic and slash-command skills loaded via symlinks into `~/.claude/skills/`.

## Stack
- Skills: Markdown (`SKILL.md`) — no build step, agentskills.io format

## Evaluating skills

Each skill has an `evals/evals.json` following the [agentskills.io evaluation format](https://agentskills.io/skill-creation/evaluating-skills). The file defines test cases with prompts, expected outputs, and verifiable assertions.

To run evals, load the `evals.json`, execute each prompt against your project (with and without the skill), grade the assertions, and record results in `evals/workspace/` (gitignored). See the agentskills.io docs for the full workspace structure and grading format.

## Structure
```
angular-conventions/SKILL.md          # Core Angular patterns (auto-triggered)
init-project/SKILL.md                 # CLAUDE.md creation guide (auto-triggered)
evals/workspace/                      # gitignored — local eval results go here
```

> SPDD skills (`spdd-canvas`, `spdd-design`, `spdd-implement`, `spdd-verify`, `spdd-sync`, `spdd-migrate`) moved to a dedicated repo, [open-spdd](https://github.com/edezacas/open-spdd).

## Gotchas
- `evals/workspace/` is gitignored; results stay local.

## Claude Code Integration

### Auto-triggers

| Skill | When to activate |
|-------|-----------------|
| `angular-conventions` | Any Angular file (`.ts`, `.html`, `.scss`) or mention of NgModule, inject(), signal, takeUntilDestroyed, SharedModule |
| `init-project` | Running `/init`, creating or updating a CLAUDE.md file |
