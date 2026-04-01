# Project Scaffold — Agent Skills Plugin

This repository contains an Agent Skill that generates AI-agent configuration files
for full-stack web projects.

## Available Skills

| Skill | Description | Path |
|-------|-------------|------|
| project-scaffold | Generate all agent config files (CLAUDE.md, rules, agents, skills, commands, progress tracking) for any full-stack project | `skills/project-scaffold/` |

## Install

Copy the skill folder to your agent's skills directory:

- **Claude Code**: `~/.claude/skills/project-scaffold/`
- **Codex CLI**: `~/.codex/skills/project-scaffold/`
- **Antigravity**: `~/.gemini/antigravity/skills/project-scaffold/`
- **Cursor / VS Code / Copilot**: `.agents/skills/project-scaffold/`

Or symlink for multi-tool usage:

```bash
ln -s /path/to/skills/project-scaffold ~/.claude/skills/project-scaffold
ln -s /path/to/skills/project-scaffold ~/.codex/skills/project-scaffold
```

## Usage

Describe your project and ask the agent to generate the docs. The skill interviews
you first, then generates everything in one batch.

Trigger phrases: "scaffold the project", "generate the docs", "set up agent config",
"create the MD files", or just describe a project and say "go".

## Standard

This skill follows the [Agent Skills open standard](https://agentskills.io).
