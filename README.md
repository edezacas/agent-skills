# edezacas Skills

edezacas shared AI skills in the [agentskills.io](https://agentskills.io) format. Work with Claude Code, opencode, pi, OpenAI Codex, VS Code Copilot, and any compatible agent.

## Skills

| Skill | Trigger | Description |
|---|---|---|
| `angular-conventions` | automatic | Core Angular conventions: standalone components, `input()`/`output()`, signals, `inject()`, `takeUntilDestroyed`, `@if`/`@for` |
| `code-design` | automatic | A few clean-code rules for software architecture, to avoid over-engineering |
| `decision-records` | automatic | ADR limits: one decision in 20 lines, the user's reason and nothing invented, no code and no history, in the shape the repo already uses |
| `init-project` | automatic | Guide for creating and editing `CLAUDE.md` and `AGENTS.md` in any project, for any agent |
| `tdd` | automatic | Test-driven development: the red → green loop, seams, and what makes a test worthless |
| `web-performance` | automatic | Measure-first web performance loop: renders, bundle, requests and caching, slow queries and N+1, images/fonts/scripts |

## Installation

```bash
npx skills add edezacas/agent-skills
```

Restart your agent to pick up the new skills.

## Adding a skill

1. Create a folder: lowercase, hyphens only.
2. Add `SKILL.md` with `name`, `description` and the repo's `license` frontmatter.
3. Add `evals/evals.json` with the test cases for the skill, following the agentskills.io evaluation format.

See [AGENTS.md](AGENTS.md) for the eval workflow and where each agent reads the skills from.

## License

[Apache-2.0](LICENSE) © 2026 edezacas. Redistribution must keep the [NOTICE](NOTICE) file.
