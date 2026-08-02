# edezacas Skills

edezacas shared AI skills in the [agentskills.io](https://agentskills.io) format. Work with Claude Code, OpenAI Codex, VS Code Copilot, and any compatible agent.

## Skills

| Skill | Trigger | Description |
|---|---|---|
| `angular-conventions` | automatic | Core Angular conventions: `inject()`, signals, `takeUntilDestroyed`, NgModule |
| `init-project` | automatic | Guide for creating and editing `CLAUDE.md` in any project |
| `spdd-canvas` | `/spdd-canvas` | Generates a REASONS canvas before writing code |
| `spdd-implement` | `/spdd-implement` | Implements a feature from its SPDD canvas |

## Installation

```bash
npx skills add edezacas/agent-skills
```

Restart Claude Code to pick up the new skills.

<details>
<summary>Manual installation</summary>

```bash
git clone git@github.com:edezacas/agent-skills.git ~/projects/agent-skills
mkdir -p ~/.claude/skills
ln -s ~/projects/agent-skills/angular-conventions ~/.claude/skills/angular-conventions
ln -s ~/projects/agent-skills/init-project ~/.claude/skills/init-project
ln -s ~/projects/agent-skills/spdd-canvas ~/.claude/skills/spdd-canvas
ln -s ~/projects/agent-skills/spdd-implement ~/.claude/skills/spdd-implement
```

</details>

## SPDD workflow

> Based on [Structured Prompt-Driven Development](https://martinfowler.com/articles/structured-prompt-driven/) by Martin Fowler.

```
/spdd-canvas magic link authentication
```

Generates a REASONS canvas at `docs/prompts/SPDD-YYYY-MM-DD-slug.md`. Once reviewed:

```
/spdd-implement
```

Reads the canvas, checks for unresolved `⚠️ Confirm:` items, implements step by step, and updates the canvas if anything diverges.

## Other agents

Skills follow the agentskills.io format (`SKILL.md` + standard frontmatter). Place or symlink skill folders into `.agents/skills/` and any compatible agent discovers them automatically. For agents without native support (Cursor, Windsurf), paste the `SKILL.md` contents into the agent's rules file.

## Adding a skill

1. Create a folder: lowercase, hyphens only.
2. Add `SKILL.md` with `name` and `description` frontmatter.
3. Run `npx skills add edezacas/agent-skills` on each machine to install.

## License

[MIT](LICENSE)
