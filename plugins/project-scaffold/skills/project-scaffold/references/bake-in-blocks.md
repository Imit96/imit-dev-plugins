# Bake-In Blocks

These are the exact markdown blocks to embed into generated files.
The SKILL.md references this file — read it when generating CLAUDE.md, agents, commands, and skills.

---

## For CLAUDE.md: After Every Task Block

```markdown
## After Every Task

When you finish a task, always:
1. Summarize what was done in one concrete sentence
2. Suggest 2-3 next steps ranked by priority
3. Flag any blockers or decisions needed before proceeding
4. If 3+ implementation tasks have passed without tests, suggest a testing checkpoint
5. If the task changed architecture, suggest updating docs before moving on

Never end a task with just "Done." Always show what comes next.
```

---

## For CLAUDE.md: Progress Tracking Block

```markdown
## Progress Tracking

After completing any task:
1. Update `docs/agent/progress.md`:
   - Add the task to the Task Log
   - Update milestone status if a milestone was reached or progressed
   - Record any decisions made in the Decisions table
   - Add any new open questions or tech debt
2. When starting a new session, read `docs/agent/progress.md` first to understand
   where the project stands

When the user asks "where are we?" or "what's the status?", read progress.md
and present a clear summary.
```

---

## For CLAUDE.md: Best Practices Block

```markdown
## Best Practices

When you notice an opportunity to improve code quality, security, performance, or
maintainability — and the timing is right:
1. Surface ONE suggestion using the coaching format
2. Explain why NOW is the right time (tied to what was just done)
3. Make it skippable — if the user says "skip" or "later", log it as tech debt
4. Never repeat a skipped suggestion unless the user asks for a review
5. Maximum one suggestion per task — don't pile on
```

---

## For CLAUDE.md: Completion Awareness Block

```markdown
## Completion Awareness

- When a task meets the stated requirements, STOP and confirm before adding more
- Never gold-plate. If the user asked for a basic form, don't add animations,
  advanced validation, and accessibility features unless asked
- Offer enhancements as options, not defaults
- After completing a feature, suggest a review checkpoint before starting the next one
- Track project completion against milestones — when all milestones are done,
  say so clearly and present a launch readiness summary
- Know the difference between "done" and "perfect". Ship "done", iterate toward "perfect"
```

---

## For Every Agent: After-Work Block

Append this to the end of every generated agent file:

```markdown
## After Completing Work
1. Summarize what you did
2. Suggest what should happen next based on what you found
3. Flag anything that needs the user's attention
4. Update docs/agent/progress.md task log
```

---

## For Every Command: Wrap-Up Block

Append this to the end of every generated command file:

```markdown
When finished:
- Report: what was done, what was found, what changed
- Suggest: the most logical next action
- Ask: "Want to proceed with [suggested next step], or do something else?"
```

---

## For Every Skill: Wrap-Up Step

Add this as the final step in every generated skill:

```markdown
## Final Step: Wrap Up
1. Update docs/agent/progress.md — task log, milestone status, any decisions made
2. Present completion summary:
   - ✅ What was built (concrete list)
   - 💡 One best practice suggestion if triggered (check best-practices-catalog)
   - ➡️ 2-3 suggested next steps ranked by priority
3. Ask: "Ready for the next step, or want to adjust anything?"
```

---

## Next Step Format

Use this format when presenting next steps:

```markdown
✅ **Done**: {what was completed}

**Suggested next steps** (in order of priority):
1. **{Most logical next task}** — {why this should come next, 1 sentence}
2. **{Second option}** — {why, 1 sentence}
3. **{Optional alternative}** — {why, 1 sentence}

⚠️ **Needs your input**: {any decision or blocker, if applicable}
```

---

## Best Practice Coaching Format

Use this format when surfacing a best practice suggestion:

```markdown
💡 **Suggestion**: {What to consider}
**Why now**: {Why this is the right moment — tied to what was just done}
**Effort**: {Low / Medium / High}
**Skip?**: Totally fine to defer this. Say "skip" and I'll note it as tech debt.
```

---

## Task Completion Format

```markdown
✅ **Task complete.** Here's what was built:
- {Concrete list of what was done}

This covers what you asked for. I could also add:
- {Optional enhancement 1} — {1 sentence why}
- {Optional enhancement 2} — {1 sentence why}

Want any of these, or should we move on to the next thing?
```

---

## Feature Completion Format

```markdown
🏁 **Feature complete: {Feature Name}**

Before moving on, I'd recommend:
1. Quick review of all files changed (I can spawn the code-reviewer agent)
2. Run the full test suite to check for regressions
3. Update docs/agent/progress.md milestone

Ready for review, or move straight to the next feature?
```

---

## Project Launch-Ready Format

```markdown
🚀 **Project looks launch-ready.** Here's the status:

✅ All {N} milestones complete
✅ Test suite passing ({coverage}% coverage)
✅ Deployment pipeline working
⚠️ {N} items in tech debt (none critical)

**Before launch, I'd suggest reviewing:**
1. Security audit (spawn the code-reviewer agent with security focus)
2. Performance check on critical paths
3. Environment variable audit for production
4. Error monitoring setup (Sentry, LogRocket, etc.)

Or if you want to keep building, here are enhancement ideas: {list based on project type}

What's the call?
```

---

## /status Command Output Format

```markdown
## Project: {NAME}

**Milestones**: {N done} / {N total} ({percentage}%)
**Last task**: {most recent task log entry}
**Next suggested**: {highest priority next step}

### Milestones
{milestone table — only show status emoji + name for brevity}

### Open Questions ({count})
{list or "None — you're clear"}

### Tech Debt ({count})
{list or "None — clean slate"}

### Health Check
- Tests: {passing/failing/not set up yet}
- Docs: {up to date / {N} files may need updates}
- Last best practice suggestion: {what it was and whether it was acted on or skipped}
```
