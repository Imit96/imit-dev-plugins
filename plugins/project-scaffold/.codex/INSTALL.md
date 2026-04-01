# Install Project Scaffold for Codex

## Quick Install

```bash
git clone https://github.com/Imit96/project-scaffold-plugin.git /tmp/project-scaffold-plugin
mkdir -p ~/.codex/skills
cp -r /tmp/project-scaffold-plugin/skills/project-scaffold ~/.codex/skills/
rm -rf /tmp/project-scaffold-plugin
```

## Verify

```bash
ls ~/.codex/skills/project-scaffold/SKILL.md
```

## Usage

Start a new Codex session and say:

> "I'm building a new project. Scaffold the docs."

Or describe your project and ask Codex to generate the agent config files.
