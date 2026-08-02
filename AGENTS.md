# edezacas Skills

## Overview
edezacas shared AI coding skills. Each skill is a directory with a `SKILL.md` file following the agentskills.io format.

## Stack
- Skills: Markdown (`SKILL.md`) — no build step, agentskills.io format

## Structure
```
angular-conventions/SKILL.md          # Core Angular patterns — triggers automatically
init-project/SKILL.md                 # AGENTS.md creation guide — triggers automatically
spdd-canvas/SKILL.md                  # REASONS canvas generator — /spdd-canvas
spdd-canvas/assets/template-reasons.md
spdd-canvas/evals/evals.json          # evals 1–3: guard, generation quality, hook installation
spdd-implement/SKILL.md               # Canvas-driven implementer — /spdd-implement
spdd-implement/evals/evals.json       # evals 4–8: unresolved items, proceed, divergence, doc, final state
evals/workspace/                      # gitignored — local eval results go here
```

## Conventions
- `SKILL.md` files are pure Markdown — no agent-specific syntax
- Canvas files follow the naming pattern `SPDD-YYYY-MM-DD-slug.md`
- Unresolved canvas items are marked `⚠️ Confirm:` and must be resolved before implementation

## Gotchas
- `evals/workspace/` is gitignored; eval results stay local
- `docs/prompts/` canvases with `Status: Draft` or `Status: Confirmed` are works in progress
