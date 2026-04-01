---
name: project-scaffold
description: >
  Generates all AI-agent configuration files (CLAUDE.md, rules, agents, skills, commands, and reference docs)
  for a full-stack web project. Use this skill whenever the user discusses a new project, describes an app idea,
  asks to "set up docs", "scaffold the project", "generate agent files", "create the MD files", "set up Claude Code config",
  or anything related to preparing a codebase for AI-assisted development. Also trigger when the user says
  "generate the docs", "create project structure", "set up the agent docs", or references CLAUDE.md, AGENTS.md,
  rules, skills, or commands in the context of a new or existing project. Even if the user just describes a project
  and says "go", this skill should activate. This skill asks questions first — it never assumes stack, conventions,
  or architecture. It produces self-updating documents with changelog sections and revision hooks.
license: MIT
compatibility: >
  Works with any AI coding agent that supports the Agent Skills open standard (agentskills.io).
  Requires file read/write access to generate config files. No external dependencies.
  Tested on: Claude Code, Claude.ai, OpenAI Codex CLI, Cursor, VS Code, GitHub Copilot,
  Google Antigravity, Gemini CLI, Windsurf, Amp, OpenCode, Roo Code, JetBrains Junie.
metadata:
  author: Imit
  version: 1.0.0
  tags:
    - scaffold
    - project-setup
    - claude-md
    - agent-config
    - full-stack
    - cross-platform
allowed-tools: read write edit glob grep ls bash
---

# Project Scaffold Skill

Generate a complete, production-ready set of AI-agent configuration files for any full-stack web project.
Every document is structured to evolve with the project — not a static snapshot.

---

## CRITICAL: Interview First, Generate Second

**Never assume. Always ask.**

Before generating a single file, conduct a structured interview with the user. The quality of the output
depends entirely on the quality of the input. A wrong assumption baked into CLAUDE.md will poison every
future session.

### Phase 1: Discovery Interview

Ask these questions in a natural conversational flow. Group related questions together — don't overwhelm
with a 20-question survey. Adapt based on what the user has already shared in the conversation.

**Tier 1 — Must Know (block generation until answered):**

1. **Project name and one-liner** — What is this project called and what does it do in one sentence?
2. **Tech stack** — Frontend framework, backend framework, database, ORM, auth approach
3. **Architecture pattern** — Monorepo or separate repos? SSR/SSG/SPA? Microservices or monolith?
4. **Who is building this?** — Solo dev, small team, or org? (Affects rules and agent complexity)

**Tier 2 — Should Know (ask if not volunteered):**

5. **Deployment target** — Where will this run? (Vercel, AWS, Railway, Docker, etc.)
6. **Testing approach** — Unit tests? Integration tests? E2E? What runner? (Jest, Vitest, Playwright, etc.)
7. **Package manager** — npm, pnpm, yarn, bun?
8. **Key conventions** — Any strong opinions on file naming, export style, state management?
9. **Existing codebase?** — Starting fresh or adding to existing code? If existing, what's already there?

**Tier 3 — Nice to Know (ask if the conversation allows):**

10. **CI/CD pipeline** — GitHub Actions, GitLab CI, etc.?
11. **External services** — Payment (Stripe), email (Resend), storage (S3), etc.?
12. **Multi-tool usage** — Using Cursor, Copilot, or other AI tools alongside Claude Code?

### How to Ask

- Present questions as a concise checklist, not a wall of text
- If the user already described the project, extract what you can and confirm: "Based on what you've shared, here's what I've gathered: [summary]. A few things I still need to know: [remaining questions]"
- If the user says "just go with sensible defaults", confirm what those defaults are before proceeding
- Group Tier 1 questions into a single message. Only move to Tier 2 after Tier 1 is resolved.

---

## Phase 2: Generate the File Set

Once the interview is complete, generate ALL files in a single batch. Save them to the project root
following the exact structure below.

### Output Structure

```
{project-root}/
├── CLAUDE.md                          # Core memory — lean, <300 lines
├── CLAUDE.local.md                    # Personal prefs template (gitignored)
├── AGENTS.md                          # Cross-tool compat (if multi-tool)
├── .claude/
│   ├── rules/
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── git-conventions.md
│   ├── agents/
│   │   ├── code-reviewer.md
│   │   ├── test-writer.md
│   │   ├── debugger.md
│   │   └── architect.md
│   ├── skills/
│   │   ├── new-feature/SKILL.md
│   │   ├── new-endpoint/SKILL.md
│   │   └── new-component/SKILL.md
│   └── commands/
│       ├── new-feature.md
│       ├── fix-bug.md
│       ├── deploy-check.md
│       ├── status.md                  # Project health & next steps
│       └── review.md                  # Feature/milestone review checkpoint
├── docs/agent/
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-patterns.md
│   ├── workflows.md
│   ├── testing-strategy.md
│   ├── deployment.md
│   └── progress.md                    # Living progress tracker
└── .gitignore additions                # Ensure CLAUDE.local.md is gitignored
```

### File Generation Rules

1. **CLAUDE.md must stay under 300 lines.** Use `@` references to point to docs/agent/ files.
2. **Every file includes a changelog section** at the bottom (see Self-Updating Pattern below).
3. **Rules files are short and focused** — one concern per file, imperative voice.
4. **Agents include YAML frontmatter** with description, tools, and optionally model and memory scope.
5. **Skills use progressive disclosure** — SKILL.md is the instruction, heavy detail goes in references/.
6. **Commands are action-oriented** — they describe a workflow, not a concept.
7. **Reference docs use pointers, not code snippets** — code goes stale, descriptions don't.

---

## Phase 3: Self-Updating Document Pattern

Every generated file follows this pattern to stay current as the project evolves:

### Changelog Footer

Every file ends with:

```markdown
---
## Changelog
<!-- Add entries as the project evolves. Format: YYYY-MM-DD | Change description -->
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation via project-scaffold skill |
```

### Update Trigger Comments

Embed HTML comments at key decision points that remind the agent (or human) to revisit:

```markdown
<!-- UPDATE_WHEN: New database table is added -->
## Database Schema
...

<!-- UPDATE_WHEN: New external service is integrated -->
## External Services
...

<!-- UPDATE_WHEN: Deployment target changes -->
## Deployment
...
```

### CLAUDE.md Self-Awareness Block

Include this block in the generated CLAUDE.md:

```markdown
## Keeping These Docs Current

When you complete a task that changes project architecture, conventions, or structure:
1. Identify which doc files are affected (check <!-- UPDATE_WHEN --> comments)
2. Propose specific updates to the affected files
3. Ask the user to confirm before making changes
4. Add a changelog entry with today's date

If you notice a doc file contradicts the actual codebase, flag it immediately.
Do NOT silently work around outdated docs — surface the contradiction.
```

---

## Phase 4: Sub-Agent Definitions

Generate these agents by default. Customize tool access and prompts based on the tech stack.

Read `agents/code-reviewer.md`, `agents/test-writer.md`, `agents/debugger.md`, and
`agents/architect.md` in this skill's agents/ directory for the full templates.

**When to recommend additional agents to the user:**
- If the project uses a complex auth system → suggest an `auth-auditor.md` agent
- If the project has a CMS or content pipeline → suggest a `content-reviewer.md` agent  
- If the project involves data pipelines → suggest a `data-validator.md` agent
- Always ask: "Are there any specialized review or automation tasks you do repeatedly?"

---

## Phase 5: Ask-Don't-Assume Guardrails

These behaviors are baked into every generated file:

### In CLAUDE.md — The Prime Directive Block

```markdown
## Agent Behavior Rules

1. **Ask, don't assume.** If a task is ambiguous, ask a clarifying question before proceeding.
   Prefer a 30-second question over a 10-minute wrong implementation.
2. **Confirm before destructive actions.** Deleting files, dropping tables, force-pushing —
   always confirm first.
3. **Flag uncertainty.** If you're unsure about an architectural decision, say so.
   Suggest 2-3 options and let the human decide.
4. **Scope check.** Before starting a task, restate your understanding of the scope
   and ask "Does this match what you had in mind?"
5. **No silent drift.** If you realize mid-task that the approach needs to change,
   stop and discuss — don't quietly pivot.
```

### In Every Agent — The Clarification Protocol

Each agent file includes:

```markdown
Before beginning work:
1. Restate the task in your own words
2. List any assumptions you're making
3. Ask: "Should I proceed with these assumptions, or do you want to adjust anything?"
```

---

## Customization by Stack

Adapt the generated files based on the tech stack discovered in the interview:

**Next.js / React:**
- Add App Router vs Pages Router conventions to rules
- Component and hook naming patterns
- Server Component vs Client Component guidance
- Add `new-component` and `new-page` skills

**Laravel / PHP:**
- Add Eloquent model conventions, migration patterns
- Service/Repository pattern guidance if applicable
- Add `new-model`, `new-controller` skills

**Node.js / Express:**
- Add middleware patterns, route organization
- Error handling middleware conventions
- Add `new-route`, `new-middleware` skills

**Database-specific:**
- Prisma: migration workflow, schema conventions
- Eloquent: migration + model factory patterns
- Raw SQL: migration file naming, rollback patterns

**Deployment-specific:**
- Docker: Dockerfile and compose conventions
- Vercel: Environment variable handling, edge function patterns
- AWS: IAM and resource naming conventions

---

## After Generation: Present and Confirm

After generating all files:

1. Present a summary table showing every file generated with a one-line description
2. Highlight any assumptions that were made (even with the interview, some may exist)
3. Ask: "Want me to adjust anything before we start building?"
4. Remind the user: "These docs will evolve as we build. I'll flag when something needs updating."

---

## Phase 6: Next Step Engine

Every task ends with a suggested next step. This is not optional — it's baked into the
generated CLAUDE.md and every agent/command/skill.

Read `references/bake-in-blocks.md` for the exact markdown blocks to embed in each file type.

### The "What's Next" Protocol

After completing ANY task, the agent must:

1. **Summarize what was just done** — one sentence, concrete
2. **State what this unlocks** — what can now be built that couldn't before
3. **Suggest 2-3 next steps ranked by priority** — most logical continuation first
4. **Flag any blockers or decisions needed** — things that will stall progress if not resolved

### Priority Logic

1. **Dependency chain** — If task B depends on task A, and A just finished, suggest B
2. **Momentum match** — Stay in the same layer (backend/frontend) unless it's complete
3. **Risk reduction** — Unknowns first (auth, schema, core API) over cosmetics (styling)
4. **Testing cadence** — After every 3-4 implementation tasks, suggest a testing checkpoint
5. **Doc hygiene** — After architecture changes, suggest doc updates before moving on

### What to Bake In

- In CLAUDE.md: the "After Every Task" block (see bake-in-blocks.md)
- In every agent: the "After Completing Work" block
- In every command: the "Wrap-Up" block
- In every skill: the "Wrap-Up Step" as the final step

---

## Phase 7: Progress Tracking

The project maintains a living progress file that tracks what's been done, what's in flight,
and what remains.

### Generate: `docs/agent/progress.md`

Read `references/progress-template.md` for the full template with milestone patterns by project type.

The file tracks five things:
1. **Milestones** — customized to the project type, with status tracking
2. **Task log** — every completed task, most recent first
3. **Decisions** — every non-trivial decision with context and alternatives considered
4. **Open questions** — things that need human input
5. **Tech debt** — shortcuts taken, skipped suggestions, things to revisit

### Milestone Generation Logic

During the interview, after the stack is known, generate milestones that match the project.
See `references/progress-template.md` for patterns by project type (SaaS, e-commerce, API, etc.).

Always ask: "Here are the milestones I'd suggest: [list]. Want to adjust?"

### What to Bake In

- In CLAUDE.md: the "Progress Tracking" block (see bake-in-blocks.md)
- The agent must read progress.md at the start of every session
- The agent must update progress.md after every completed task

---

## Phase 8: Best Practices Engine & Completion Awareness

The agent doesn't just build — it actively coaches toward better outcomes and knows when to stop.

### Best Practices: Proactive Suggestions

Read `references/best-practices-catalog.md` for the full library of 20+ contextual suggestions
with trigger conditions across Security, Performance, Quality, Reliability, and DX.

**Rules for suggestions:**
- Maximum ONE suggestion per task completion
- Only suggest when there's a clear trigger — never generic advice
- Always skippable — "skip" or "later" logs it as tech debt in progress.md
- Don't repeat a skipped suggestion unless the user asks for a review
- Use the coaching format from `references/bake-in-blocks.md`

### Completion Awareness: Knowing When to Stop

The agent recognizes three levels of "done":

**Task-Level** — Requirements met, tests pass, edge cases handled, docs updated.
→ Stop and confirm. Offer enhancements as options, not defaults.
See `references/bake-in-blocks.md` for the task completion format.

**Feature-Level** — All endpoints work E2E, frontend wired to backend, tests pass, errors handled.
→ Suggest a review checkpoint before starting the next feature.
See `references/bake-in-blocks.md` for the feature completion format.

**Project-Level** — All milestones done, tests pass, no critical debt, deployment works, docs current.
→ Present launch readiness summary.
See `references/bake-in-blocks.md` for the launch-ready format.

**Anti-Overbuilding Rules** (bake into CLAUDE.md):
- When requirements are met, STOP — don't add unrequested features
- Never gold-plate. Basic form ≠ animated form with advanced validation
- Offer enhancements as options, not defaults
- Ship "done", iterate toward "perfect"

### What to Bake In

- In CLAUDE.md: "Best Practices" and "Completion Awareness" blocks (see bake-in-blocks.md)
- Spawn `agents/health-monitor.md` when the user asks for project status or after major milestones

---

## Phase 9: The `/status` and `/review` Commands

Generate two additional commands for day-to-day project management:

**`/status`** — Reads `docs/agent/progress.md` and presents an instant health summary:
milestones, last task, suggested next step, open questions, tech debt, and health signals.
See `references/bake-in-blocks.md` for the output format and `references/commands-templates.md`
for the command template.

**`/review`** — Runs a feature or milestone review checkpoint: identifies scope, spawns
code-reviewer, checks tests and docs, updates progress. See `references/commands-templates.md`.

Also spawn `agents/health-monitor.md` when the user asks for deeper project health analysis
or when a major milestone is completed.

---

## Reference Files

Read these for full templates when generating specific file types:

- `references/claude-md-template.md` — Full CLAUDE.md template with all sections
- `references/rules-templates.md` — Templates for each rule file
- `references/agent-templates.md` — Templates for agent YAML frontmatter and prompts
- `references/skills-templates.md` — Templates for project-specific skills
- `references/commands-templates.md` — Templates for slash commands
- `references/bake-in-blocks.md` — Exact markdown blocks to embed in generated files
- `references/progress-template.md` — Full progress.md template with milestone patterns
- `references/best-practices-catalog.md` — Trigger conditions and suggestion library

Read `agents/` directory for sub-agent definitions that get copied into the project.
