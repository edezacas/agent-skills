# edezacas Skills

edezacas shared AI skills in the [agentskills.io](https://agentskills.io) format. Work with Claude Code, opencode, pi, OpenAI Codex, VS Code Copilot, and any compatible agent.

## Skills

| Skill | Trigger | Description |
|---|---|---|
| `angular-conventions` | automatic | Core Angular conventions: `inject()`, signals, `takeUntilDestroyed`, NgModule |
| `code-design` | automatic | A few clean-code rules for software architecture, to avoid over-engineering |
| `init-project` | automatic | Guide for creating and editing `CLAUDE.md` in any project |
| `tdd` | automatic | Test-driven development: the red → green loop, seams, and what makes a test worthless |
| `web-performance` | automatic | Measure-first web performance loop: renders, bundle, requests and caching, slow queries and N+1, images/fonts/scripts |

## Installation

```bash
npx skills add edezacas/agent-skills
```

Restart your agent to pick up the new skills.

## Agents

Skills follow the agentskills.io format (`SKILL.md` + standard frontmatter), so the same folders work everywhere. Place or symlink them into your agent's skills directory — `~/.claude/skills/` for Claude Code, `~/.pi/agent/skills/` for pi, `.agents/skills/` for agents that read the shared location. For agents without native support (Cursor, Windsurf), paste the `SKILL.md` contents into the agent's rules file.

## Adding a skill

1. Create a folder: lowercase, hyphens only.
2. Add `SKILL.md` with `name` and `description` frontmatter.
3. Run `npx skills add edezacas/agent-skills` on each machine to install — it symlinks into every detected agent's skills directory (`-a '*'` for all of them).

## License

[MIT](LICENSE)
