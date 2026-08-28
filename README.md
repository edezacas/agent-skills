# edezacas Skills

edezacas shared AI skills in the [agentskills.io](https://agentskills.io) format. Work with Claude Code, OpenAI Codex, VS Code Copilot, and any compatible agent.

## Skills

| Skill | Trigger | Description |
|---|---|---|
| `angular-conventions` | automatic | Core Angular conventions: `inject()`, signals, `takeUntilDestroyed`, NgModule |
| `init-project` | automatic | Guide for creating and editing `CLAUDE.md` in any project |

> Looking for the SPDD skills (`spdd-canvas`, `spdd-design`, `spdd-implement`, `spdd-verify`, `spdd-sync`, `spdd-migrate`)? They moved to [edezacas/open-spdd](https://github.com/edezacas/open-spdd).

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
```

</details>

## Other agents

Skills follow the agentskills.io format (`SKILL.md` + standard frontmatter). Place or symlink skill folders into `.agents/skills/` and any compatible agent discovers them automatically. For agents without native support (Cursor, Windsurf), paste the `SKILL.md` contents into the agent's rules file.

## Adding a skill

1. Create a folder: lowercase, hyphens only.
2. Add `SKILL.md` with `name` and `description` frontmatter.
3. Run `npx skills add edezacas/agent-skills` on each machine to install.

## Related

[open-spdd](https://github.com/edezacas/open-spdd) — Structured Prompt-Driven Development skills (canvas → design → implement → verify), split out from this repo.

## License

[MIT](LICENSE)
