# Install Project Scaffold for OpenCode

## Quick Install

```bash
git clone https://github.com/Imit96/project-scaffold-plugin.git /tmp/project-scaffold-plugin
mkdir -p ~/.opencode/skills
cp -r /tmp/project-scaffold-plugin/skills/project-scaffold ~/.opencode/skills/
rm -rf /tmp/project-scaffold-plugin
```

## Verify

```bash
ls ~/.opencode/skills/project-scaffold/SKILL.md
```

## Usage

Start a new OpenCode session and say:

> "I'm building a new project. Scaffold the docs."

Or describe your project and ask the agent to generate the config files.
