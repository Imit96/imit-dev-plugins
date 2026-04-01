# CLAUDE.md Template

Use this template when generating the project's CLAUDE.md. Replace all `{PLACEHOLDERS}` with
values from the discovery interview. Delete any sections that don't apply.

---

```markdown
# {PROJECT_NAME}

{ONE_LINE_DESCRIPTION}

## Tech Stack
- Frontend: {FRONTEND_FRAMEWORK}, {UI_LIBRARY}, {STYLING}
- Backend: {BACKEND_FRAMEWORK}
- Database: {DATABASE} with {ORM}
- Auth: {AUTH_APPROACH}
- Deployment: {DEPLOYMENT_TARGET}

## Common Commands
- Install: `{INSTALL_CMD}`
- Dev: `{DEV_CMD}`
- Build: `{BUILD_CMD}`
- Test: `{TEST_CMD}`
- Lint: `{LINT_CMD}`
- DB migrate: `{MIGRATE_CMD}`

<!-- UPDATE_WHEN: New command is added or flags change -->

## Project Structure
{BRIEF_DIRECTORY_MAP — max 15 lines, top-level only}

<!-- UPDATE_WHEN: New top-level directory is added -->

## Key Conventions
{3-7 bullet points — the rules that apply to EVERY task}

For detailed conventions, see:
- @docs/agent/architecture.md for system design
- @docs/agent/database-schema.md for DB structure
- @docs/agent/api-patterns.md for API conventions
- @docs/agent/workflows.md for implementation workflows
- @docs/agent/testing-strategy.md for test patterns
- @docs/agent/deployment.md for deploy process

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

## Keeping These Docs Current

When you complete a task that changes project architecture, conventions, or structure:
1. Identify which doc files are affected (check <!-- UPDATE_WHEN --> comments)
2. Propose specific updates to the affected files
3. Ask the user to confirm before making changes
4. Add a changelog entry with today's date

If you notice a doc file contradicts the actual codebase, flag it immediately.
Do NOT silently work around outdated docs — surface the contradiction.

## After Every Task

When you finish a task, always:
1. Summarize what was done in one concrete sentence
2. Update `docs/agent/progress.md` (task log, milestone status, decisions)
3. Suggest 2-3 next steps ranked by priority
4. Flag any blockers or decisions needed before proceeding
5. If 3+ implementation tasks have passed without tests, suggest a testing checkpoint
6. If the task changed architecture, suggest updating docs before moving on

Never end a task with just "Done." Always show what comes next.

## Progress Tracking

At the start of every session, read `docs/agent/progress.md` to understand where
the project stands. After every task, update it with:
- Task log entry
- Milestone status change (if applicable)
- Decisions made
- New open questions or tech debt

When the user asks "where are we?" or "what's the status?", read progress.md
and present a clear summary.

## Best Practices

When you notice an opportunity to improve code quality, security, performance, or
maintainability — and the timing is right:
1. Surface ONE suggestion using the coaching format (💡 Suggestion / Why now / Effort / Skip?)
2. Explain why NOW is the right time (tied to what was just done)
3. Make it skippable — if the user says "skip" or "later", log it as tech debt in progress.md
4. Never repeat a skipped suggestion unless the user asks for a review
5. Maximum one suggestion per task — don't pile on

## Completion Awareness

- When a task meets the stated requirements, STOP and confirm before adding more
- Never gold-plate. If the user asked for a basic form, don't add animations,
  advanced validation, and accessibility features unless asked
- Offer enhancements as options, not defaults
- After completing a feature, suggest a review checkpoint before starting the next one
- Track project completion against milestones — when all milestones are done,
  say so clearly and present a launch readiness summary
- Know the difference between "done" and "perfect". Ship "done", iterate toward "perfect"

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation via project-scaffold skill |
```
