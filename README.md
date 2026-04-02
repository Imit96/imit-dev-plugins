# 🏗️ Imit Dev Plugins Hub

**High-performance AI agent tools for developers and entrepreneurs.**

A collection of cross-platform AI agent plugins designed to streamline development and business intelligence. Register once, install any plugin from the suite, and get more out of your agent-based workflows.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-blueviolet)](https://code.claude.com/docs/en/skills)
[![Agent Skills Standard](https://img.shields.io/badge/Agent_Skills-Open_Standard-green)](https://agentskills.io)

---

## Featured Plugins

| Plugin | Description | Documentation |
|--------|-------------|---------------|
| `project-scaffold` | **Full-Stack Project Initialization.** Interviews you about your project, then generates a complete set of `CLAUDE.md`, rules, agents, skills, and progress tracking. | [README](plugins/project-scaffold/README.md) |
| `trade-launch-intelligence` | **Professional Multi-Agent Team.** Professional business launch advisory (Analyst, Finance, Compliance, Strategy) for traders and exporters. | [README](plugins/trade-launch-intelligence/README.md) |

---

## Installation

### 🔴 Quick Start (Claude Code)

To install from the **Imit Dev Plugins** hub, first register it as a marketplace in your agent CLI:

```bash
/plugin marketplace add Imit96/imit-dev-plugins
```

Then install any plugin:

```bash
# To scaffold a project
/plugin install project-scaffold@imit-dev-plugins

# For trade/business advisory
/plugin install trade-launch-intelligence@imit-dev-plugins
```

### ⚡ Cursor Agent & Agent Skills CLI
Use the universal installer for any plugin in the hub:

```bash
npx skills add Imit96/imit-dev-plugins/[plugin-name]
```

---

## Hub Architecture

The hub is designed for modularity and cross-platform compatibility. Each plugin contains its own manifests, reference library, and orchestration skills.

```
imit-dev-plugins/
├── .claude-plugin/                     # Central Hub Manifest
│   └── marketplace.json                # Global Catalog
├── plugins/
│   ├── project-scaffold/               # Plugin 1: Project Scaffolding
│   │   ├── .claude-plugin/plugin.json  # Specific Manifest
│   │   ├── skills/                     # Skill Logic
│   │   └── README.md
│   └── trade-launch-intelligence/      # Plugin 2: Global Trade Advisory
│       ├── .claude-plugin/plugin.json  # Specific Manifest
│       ├── skills/                     # Reference Library & Logic
│       └── README.md
└── README.md                           # This Hub Landing Page
```

---

## Platform Support

Following the [Agent Skills open standard](https://agentskills.io), these plugins work across all major AI agent platforms.

| Platform | Support |
|----------|---------|
| **Claude Code** | ✅ Full marketplace + auto-update support |
| **Claude.ai** | ✅ Upload skill via zip/folder |
| **Cursor Agent** | ✅ Marketplace discovery |
| **VS Code (Agent)** | ✅ Native skill support |
| **Gemini CLI** | ✅ Native extension support |
| **GitHub Copilot** | ✅ Full compatibility |

---

## Author 

Built by **Imit** ([Imit96](https://github.com/Imit96))

**Issues & Requests:** [github.com/Imit96/imit-dev-plugins/issues](https://github.com/Imit96/imit-dev-plugins/issues)

---

## License

[MIT](LICENSE)
