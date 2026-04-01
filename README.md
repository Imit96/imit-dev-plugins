# 🏗️ Project Scaffold

**Generate all AI-agent config files for any full-stack project — in one go.**

A cross-platform AI agent plugin that interviews you about your project, then generates a complete set of CLAUDE.md, rules, agents, skills, commands, progress tracking, and reference docs. Every file is self-updating, every agent asks before assuming, and the system tracks what's done, what's next, and when to stop.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-blueviolet)](https://code.claude.com/docs/en/skills)
[![Agent Skills Standard](https://img.shields.io/badge/Agent_Skills-Open_Standard-green)](https://agentskills.io)

---

## Installation

> [!IMPORTANT]
> **Where to run commands:** Commands starting with `/` (like `/plugin`) must be typed directly into your **Agent's CLI Chat interface**, not your computer's terminal (zsh/bash).

### Installation (Marketplace Method)

To install this plugin from the custom marketplace, first register this repository as a source in your agent CLI:

```
/plugin marketplace add Imit96/project-scaffold-plugin
```

Then install the plugin from this marketplace:

```
/plugin install project-scaffold@project-scaffold-marketplace
```

To update:

```
/plugin update project-scaffold
```

### Cursor (via Plugin Marketplace)

In Cursor Agent chat, install from marketplace:

```
/add-plugin project-scaffold
```

Or search for "project-scaffold" in the plugin marketplace.

### OpenAI Codex

Tell Codex:

```
Fetch and follow instructions from https://raw.githubusercontent.com/Imit96/project-scaffold-plugin/main/.codex/INSTALL.md
```

### OpenCode

Tell OpenCode:

```
Fetch and follow instructions from https://raw.githubusercontent.com/Imit96/project-scaffold-plugin/main/.opencode/INSTALL.md
```

### GitHub Copilot CLI

```
copilot plugin marketplace add Imit96/project-scaffold-plugin
copilot plugin install project-scaffold@project-scaffold-marketplace
```

### Gemini CLI

```
gemini extensions install https://github.com/Imit96/project-scaffold-plugin
```

To update:

```
gemini extensions update project-scaffold
```

### Google Antigravity

```bash
git clone https://github.com/Imit96/project-scaffold-plugin.git /tmp/psp
mkdir -p ~/.gemini/antigravity/skills
cp -r /tmp/psp/skills/project-scaffold ~/.gemini/antigravity/skills/
rm -rf /tmp/psp
```

### Claude.ai / Cowork

Download the `skills/project-scaffold/` folder, zip it, and upload via **Settings → Customize → Skills**.

### Manual Install (any platform)

```bash
git clone https://github.com/Imit96/project-scaffold-plugin.git /tmp/psp

# Claude Code
mkdir -p ~/.claude/skills
cp -r /tmp/psp/skills/project-scaffold ~/.claude/skills/

# OpenAI Codex CLI
mkdir -p ~/.codex/skills
cp -r /tmp/psp/skills/project-scaffold ~/.codex/skills/

# Cursor / VS Code / GitHub Copilot
mkdir -p .agents/skills
cp -r /tmp/psp/skills/project-scaffold .agents/skills/

# Clean up
rm -rf /tmp/psp
```

### Symlink for Multi-Tool Usage

Install once, use everywhere:

```bash
# Install to Claude Code first
mkdir -p ~/.claude/skills
cp -r skills/project-scaffold ~/.claude/skills/

# Then symlink to other tools
ln -s ~/.claude/skills/project-scaffold ~/.codex/skills/project-scaffold
ln -s ~/.claude/skills/project-scaffold .agents/skills/project-scaffold
```

### Using skills.sh (Universal Package Manager)

```bash
npx skills add Imit96/project-scaffold-plugin
```

---

## Supported Platforms

This skill follows the [Agent Skills open standard](https://agentskills.io) — write once, use everywhere.

| Platform | Status |
|----------|--------|
| Claude Code | ✅ Full plugin + marketplace support |
| Claude.ai / Cowork | ✅ Upload as custom skill |
| OpenAI Codex CLI | ✅ Native Agent Skills support |
| Cursor | ✅ Native plugin support |
| VS Code | ✅ Agent Skills extension |
| GitHub Copilot | ✅ Native support |
| Google Antigravity | ✅ Native Agent Skills support |
| Gemini CLI | ✅ Native support |
| JetBrains Junie | ✅ Native support |
| Windsurf | ✅ Compatible |
| Amp | ✅ Compatible |
| OpenCode | ✅ Compatible |
| Goose (Block) | ✅ Compatible |
| Roo Code | ✅ Compatible |
| Mistral Vibe | ✅ Compatible |

---

## What It Does

Describe your project → the skill interviews you → generates everything:

```
.claude/
├── rules/           # code-style, testing, security, git-conventions
├── agents/          # code-reviewer, test-writer, debugger, architect
├── skills/          # new-feature, new-endpoint, new-component
└── commands/        # /new-feature, /fix-bug, /deploy-check, /status, /review
docs/agent/
├── architecture.md, database-schema.md, api-patterns.md
├── workflows.md, testing-strategy.md, deployment.md
└── progress.md      # living progress tracker
CLAUDE.md            # core memory — lean, <300 lines, self-updating
```

---

## The 9 Phases

| Phase | What Happens |
|-------|-------------|
| **1. Discovery Interview** | Asks structured questions — never assumes stack or conventions |
| **2. File Generation** | Creates all config files in one batch |
| **3. Self-Updating Docs** | Every file has `<!-- UPDATE_WHEN -->` markers and changelogs |
| **4. Sub-Agents** | Code-reviewer, test-writer, debugger, architect — with tool access |
| **5. Ask-Don't-Assume** | Clarification protocol baked into every agent and CLAUDE.md |
| **6. Next Step Engine** | Suggests 2-3 prioritized next actions after every task |
| **7. Progress Tracking** | Milestones, task log, decisions, tech debt, open questions |
| **8. Best Practices & Completion** | Contextual coaching + knows when to stop |
| **9. /status & /review** | Instant project health check and review checkpoints |

---

## Key Features

### 🎯 Interview First, Generate Second
The skill never assumes your stack. It asks tiered questions (Must Know → Should Know → Nice to Know) and blocks file generation until the essentials are gathered. If you've already described your project in conversation, it extracts what it can and confirms.

### 📊 Progress Tracking
A living `docs/agent/progress.md` tracks milestones customized to your project type:

| Project Type | Example Milestones |
|-------------|-------------------|
| SaaS / Dashboard | Auth, core API, user management, billing, testing, deploy |
| E-commerce | Product catalog, cart, checkout, payment, order management |
| API-only | Resource endpoints, validation, rate limiting, API docs |
| Content Platform | CMS, media upload, publishing workflow, search |
| Portfolio Site | Layout, content sections, contact form, SEO, analytics |
| Mobile Backend | Auth with device management, push notifications, real-time |

Updated after every task. Read at the start of every session.

### 💡 Best Practices Coaching
20+ contextual suggestions across Security, Performance, Quality, Reliability, and Developer Experience — each with a specific trigger condition. Maximum one per task. Always skippable.

```
💡 Suggestion: Add rate limiting to auth endpoints
   Why now: Auth endpoints are the #1 target for automated attacks
   Effort: Low
   Skip?: Totally fine to defer. Say "skip" and I'll log it as tech debt.
```

### ✅ Completion Awareness
Three levels of "done":
- **Task-level** → Stop, confirm, offer enhancements as options (not defaults)
- **Feature-level** → Suggest review checkpoint before next feature
- **Project-level** → Launch readiness summary when all milestones are complete

Anti-overbuilding rules prevent gold-plating, premature optimization, and feature creep.

### 🔄 Self-Updating Documents
Every generated file includes:
- `<!-- UPDATE_WHEN: condition -->` markers at key decision points
- Changelog table at the bottom
- Instructions in CLAUDE.md for the agent to scan for affected docs after every task

---

## Usage

### Trigger Phrases

Just describe your project naturally:

> "I'm building a SaaS dashboard with Next.js, Prisma, and PostgreSQL. Generate the docs."

Or be explicit:

> "Use the project-scaffold skill to set up agent config."

Other triggers: "scaffold the project", "create the MD files", "set up Claude Code config", "generate the docs"

### After Setup

| Command | What It Does |
|---------|-------------|
| `/status` | Project health: milestones, last task, next step, tech debt |
| `/review` | Feature/milestone review checkpoint with code-reviewer agent |
| `/new-feature` | Full implementation workflow with planning and testing |
| `/fix-bug` | Structured debugging protocol |
| `/deploy-check` | Pre-deployment verification checklist |

Skills update automatically when you update the plugin:

```
/plugin update project-scaffold
```

---

## Plugin Structure

```
project-scaffold-plugin/
├── .claude-plugin/
│   ├── marketplace.json                  # Marketplace catalog
│   └── plugin.json                       # Plugin manifest
├── .codex/
│   └── INSTALL.md                        # Codex install instructions
├── .opencode/
│   └── INSTALL.md                        # OpenCode install instructions
├── skills/
│   └── project-scaffold/
│       ├── SKILL.md                      # Main skill (9 phases)
│       ├── references/
│       │   ├── claude-md-template.md     # CLAUDE.md template
│       │   ├── rules-templates.md        # .claude/rules/ templates
│       │   ├── agent-templates.md        # .claude/agents/ templates
│       │   ├── skills-templates.md       # .claude/skills/ templates
│       │   ├── commands-templates.md     # .claude/commands/ templates
│       │   ├── docs-agent-templates.md   # docs/agent/ templates
│       │   ├── bake-in-blocks.md         # Exact blocks to embed in files
│       │   ├── progress-template.md      # Progress tracker + 6 milestone patterns
│       │   └── best-practices-catalog.md # 20+ trigger-based suggestions
│       └── agents/
│           ├── interviewer.md            # Discovery phase sub-agent
│           ├── doc-updater.md            # Auto doc update sub-agent
│           └── health-monitor.md         # Project health sub-agent
├── AGENTS.md                             # Cross-platform discovery file
├── CHANGELOG.md
├── LICENSE
├── .gitignore
└── README.md
```

---

## Contributing

Contributions welcome! Some ideas:

- **New milestone patterns** — Add patterns for game dev, ML pipelines, browser extensions, etc.
- **New best practice triggers** — Add suggestions for frameworks you use
- **Stack-specific templates** — Add specialized templates for Django, Rails, Flutter, etc.
- **Translations** — Localize templates for non-English teams

Please open an issue first to discuss what you'd like to change.

---

## License

[MIT](LICENSE)

---

Built by [Imit](https://github.com/Imit96) · Issues: [github.com/Imit96/project-scaffold-plugin/issues](https://github.com/Imit96/project-scaffold-plugin/issues)
