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

## Adding a skill

1. Create a folder: lowercase, hyphens only.
2. Add `SKILL.md` with `name` and `description` frontmatter.
3. Add `evals/evals.json` with the test cases for the skill, following the agentskills.io evaluation format.

See [AGENTS.md](AGENTS.md) for the eval workflow and where each agent reads the skills from.

## License

[MIT](LICENSE)
