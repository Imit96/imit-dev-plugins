# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-31

### Added

- **Phase 1: Discovery Interview** — Tiered question system (Must Know → Should Know → Nice to Know) that blocks file generation until core project info is gathered
- **Phase 2: File Generation** — Creates CLAUDE.md, rules, agents, skills, commands, and reference docs in one batch
- **Phase 3: Self-Updating Docs** — `<!-- UPDATE_WHEN -->` markers and changelog tables in every generated file
- **Phase 4: Sub-Agent Definitions** — Code-reviewer, test-writer, debugger, and architect agents with customizable tool access
- **Phase 5: Ask-Don't-Assume** — Clarification protocol baked into every agent and the generated CLAUDE.md
- **Phase 6: Next Step Engine** — Suggests 2-3 prioritized next steps after every task completion
- **Phase 7: Progress Tracking** — Living `progress.md` with milestones (6 project-type patterns), task log, decisions, open questions, and tech debt
- **Phase 8: Best Practices & Completion Awareness** — 20+ contextual suggestions with trigger conditions; task/feature/project-level completion signals with anti-overbuilding rules
- **Phase 9: Status & Review Commands** — `/status` for instant project health, `/review` for checkpoints, health-monitor agent for deeper analysis

### Reference files included

- `claude-md-template.md` — CLAUDE.md template with all behavioral blocks
- `rules-templates.md` — code-style, testing, security, git-conventions
- `agent-templates.md` — 4 agent templates with YAML frontmatter
- `skills-templates.md` — new-feature, new-endpoint, new-component workflows
- `commands-templates.md` — 6 slash command templates including /status and /review
- `docs-agent-templates.md` — architecture, database, API, workflows, testing, deployment
- `progress-template.md` — Progress tracker with milestone patterns for SaaS, e-commerce, API, content platform, portfolio, and mobile backend
- `best-practices-catalog.md` — 20+ suggestions across Security, Performance, Quality, Reliability, and DX
- `bake-in-blocks.md` — Exact markdown blocks to embed in generated files

### Agents included

- `interviewer.md` — Discovery phase sub-agent
- `doc-updater.md` — Automatic doc update sub-agent
- `health-monitor.md` — Project health analysis sub-agent
