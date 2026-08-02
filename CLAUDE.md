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
spdd-canvas/SKILL.md                  # REASONS canvas generator — /spdd-canvas
spdd-canvas/assets/template-reasons.md
spdd-canvas/evals/evals.json          # evals 1–3: guard, generation quality, hook installation
spdd-implement/SKILL.md               # canvas-driven implementer — /spdd-implement
spdd-implement/evals/evals.json       # evals 4–8: unresolved items, proceed, divergence, doc, final state
evals/workspace/                      # gitignored — local eval results go here
```

## Gotchas
- `evals/workspace/` is gitignored; results stay local.

## Claude Code Integration

### Auto-triggers

| Skill | When to activate |
|-------|-----------------|
| `angular-conventions` | Any Angular file (`.ts`, `.html`, `.scss`) or mention of NgModule, inject(), signal, takeUntilDestroyed, SharedModule |
| `init-project` | Running `/init`, creating or updating a CLAUDE.md file |
| `spdd-canvas` | User mentions a new feature, asks for a canvas, or requests a structured prompt before coding |
| `spdd-implement` | User wants to start coding a feature that has a SPDD canvas |

### Tool permissions per skill

| Skill | Tools |
|-------|-------|
| `spdd-canvas` | Read, Write, Edit, Bash, AskUserQuestion |
| `spdd-implement` | Read, Write, Edit, Bash, AskUserQuestion |

### SPDD guard hook

Configured in `.claude/settings.local.json`. Runs before every `Edit` or `Write` and warns if any canvas in `docs/prompts/` has unresolved `⚠️ Confirm:` items.

To install it in a new project, invoke `/spdd-canvas` or `/spdd-implement` — both skills offer to add it automatically.
