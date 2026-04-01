# Commands Templates

Commands live in `.claude/commands/`. They are invoked with `/command-name` in Claude Code.
Each command is a workflow trigger — a structured sequence of actions.

---

## new-feature.md

```markdown
---
description: Full workflow for implementing a new feature from scratch
---

Implement a new feature. Follow these steps:

1. **Clarify**: Ask what the feature should do. Don't start coding until the scope is clear.
2. **Plan**: Read @docs/agent/architecture.md. List files to create/modify. Present the plan.
3. **Implement**: Start with data layer → backend → frontend. Run tests after each layer.
4. **Test**: Write tests covering happy path, edge cases, and error states.
5. **Docs**: Check <!-- UPDATE_WHEN --> comments. Update any affected docs.
6. **Review**: Spawn the code-reviewer agent to review all changes.

Important: Ask at least one clarifying question before starting implementation.

$ARGUMENTS
```

---

## fix-bug.md

```markdown
---
description: Structured debugging and fix workflow
---

Debug and fix an issue. Follow the debugger protocol:

1. **Gather info**: Ask for the exact error or unexpected behavior. When did it start?
2. **Reproduce**: Find the exact steps or conditions that trigger the issue.
3. **Isolate**: Narrow to the specific layer (frontend / backend / database / infra).
4. **Diagnose**: Form 2-3 hypotheses, investigate the most likely first.
5. **Fix**: Propose a fix and explain WHY it works. Don't just patch the symptom.
6. **Test**: Write a regression test that would catch this bug if it returned.
7. **Prevent**: Suggest one thing that would prevent this class of bug.

If uncertain, say so. Don't guess — ask for more information.

$ARGUMENTS
```

---

## deploy-check.md

```markdown
---
description: Pre-deployment verification checklist
---

Run a pre-deployment check:

1. **Tests**: Run the full test suite. All must pass.
2. **Build**: Run a production build. Verify no errors or warnings.
3. **Lint**: Run the linter. Fix any issues.
4. **Types**: Run type checking. Verify no errors.
5. **Deps**: Check for known vulnerabilities with `{AUDIT_CMD}`.
6. **Env**: Verify all required environment variables are documented.
7. **Migrations**: Check for pending database migrations.
8. **Breaking changes**: Review changes since last deploy for anything that needs coordination.

Report: ✅ Ready / ❌ Blocked (with reasons)
```

---

## refactor.md

```markdown
---
description: Safe refactoring workflow with test safety net
---

Refactor code safely:

1. **Scope**: Ask what's being refactored and why. Define boundaries.
2. **Snapshot**: Ensure all existing tests pass BEFORE making changes.
3. **Plan**: Describe the refactoring approach. Get confirmation.
4. **Small steps**: Make changes incrementally. Run tests after each step.
5. **Verify**: Run the full test suite. All must still pass.
6. **Review**: Spawn code-reviewer agent to verify the refactoring didn't change behavior.

Rule: If tests break during refactoring, stop and investigate before continuing.

$ARGUMENTS
```

---

## status.md

```markdown
---
description: Show project progress, health signals, and suggested next steps
---

Read `docs/agent/progress.md` and present a project health summary:

1. **Progress**: Show milestone completion (N/Total, percentage)
2. **Current focus**: What milestone is in progress and what tasks remain
3. **Last task**: Most recent task log entry
4. **Health signals**:
   - Tests: passing / failing / not set up
   - Docs: up to date or which files may need review
   - Tech debt: count and highest-priority items
   - Open questions: count and list
5. **What's next**: Top 2-3 suggested next steps ranked by priority
6. **Best practices**: Any skipped suggestions worth revisiting

End with: "What would you like to focus on?"
```

---

## review.md

```markdown
---
description: Feature or milestone review checkpoint
---

Run a review checkpoint for the current feature or milestone:

1. **Identify scope**: Ask what feature or milestone to review (or infer from progress.md)
2. **Files changed**: List all files created or modified for this feature
3. **Code review**: Spawn the code-reviewer agent on all changed files
4. **Test check**: Are there tests? Do they pass? Are edge cases covered?
5. **Doc check**: Do any docs/agent/ files need updating?
6. **Progress update**: Update milestone status in progress.md
7. **Best practices**: Any relevant suggestions for this feature?

Present findings and ask: "Should we address any of these before moving on?"
```
