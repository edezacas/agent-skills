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
spdd-canvas/evals/evals.json          # evals 1–3, 9–10: guard, generation quality, hook, applicability guard, spec read
spdd-design/SKILL.md                  # canvas → independent implementation plans — /spdd-design
spdd-design/assets/template-plan.md
spdd-design/evals/evals.json          # evals 11–14, 29: single plan, split plans, dependencies, shared touchpoints, existing-plan guard
spdd-implement/SKILL.md               # canvas/plan-driven implementer — /spdd-implement
spdd-implement/evals/evals.json       # evals 4–8: unresolved items, missing-plan guard, divergence, unmet dependency, final state
spdd-verify/SKILL.md                  # verifies, tests, folds into spec, archives — /spdd-verify
spdd-verify/evals/evals.json          # evals 15–19, 30: missing op, untested safeguard, single-plan archive, partial-plan hold, norm violation, spec dedup on fold-back
spdd-sync/SKILL.md                    # code → living spec sync, behavior-preserving only — /spdd-sync
spdd-sync/evals/evals.json            # evals 20–23: clean refactor sync, behavior-change rejection, ambiguous case, missing spec
spdd-migrate/SKILL.md                 # one-time docs/prompts/ → spdd/ migration — /spdd-migrate
spdd-migrate/evals/evals.json         # evals 24–28: draft migration, implemented preserved, idempotency, hook rewrite, nothing to migrate
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
| `spdd-design` | Required step after every `spdd-canvas` run, before `spdd-implement`; decides whether the canvas needs one plan or several |
| `spdd-implement` | User wants to start coding a feature that already has a plan from `spdd-design` |
| `spdd-verify` | User wants to verify/review an implementation against its canvas or plan, typically right after `spdd-implement` |
| `spdd-sync` | User refactored code that already has a living spec, outside the SPDD flow, and the spec no longer matches the code's shape |
| `spdd-migrate` | Project still has canvases under the old `docs/prompts/` layout and needs a one-time move to `spdd/` |

### Tool permissions per skill

| Skill | Tools |
|-------|-------|
| `spdd-canvas` | Read, Write, Edit, Bash, AskUserQuestion |
| `spdd-design` | Read, Write, Edit, Bash, AskUserQuestion |
| `spdd-implement` | Read, Write, Edit, Bash, AskUserQuestion |
| `spdd-verify` | Read, Write, Edit, Bash, AskUserQuestion |
| `spdd-sync` | Read, Write, Edit, Bash, AskUserQuestion |
| `spdd-migrate` | Read, Write, Edit, Bash, AskUserQuestion |

### SPDD guard hook

Configured in `.claude/settings.local.json`. Runs before every `Edit` or `Write` and warns if any canvas or plan under `spdd/changes/` has unresolved `⚠️ Confirm:` items.

To install it in a new project, invoke `spdd-canvas`, `spdd-implement`, or `spdd-verify` — all three offer to add it automatically. `spdd-design` doesn't check or install it — by the time it runs, `spdd-canvas` has already offered it. `spdd-sync` never touches `spdd/changes/`, so it doesn't install or check this hook either. `spdd-migrate` rewrites an existing hook that still points at the old `docs/prompts/` path, but doesn't install one from scratch.
