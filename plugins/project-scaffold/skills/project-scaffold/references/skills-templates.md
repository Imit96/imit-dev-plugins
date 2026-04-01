# Skills Templates

Skills live in `.claude/skills/{skill-name}/SKILL.md`.
Each skill is a reusable workflow for a common project task.
Adapt the examples below to the project's specific stack and conventions.

---

## new-feature/SKILL.md

```markdown
---
name: new-feature
description: >
  End-to-end workflow for implementing a new feature. Covers planning, implementation,
  testing, and documentation. Use when the user says "add a feature", "build [something]",
  "implement [something]", or starts describing new functionality.
---

# New Feature Workflow

## Step 1: Clarify Requirements
Before writing any code:
1. Restate the feature in your own words
2. Identify: What user problem does this solve?
3. Ask: "Here's my understanding: [summary]. What am I missing?"
4. Ask about edge cases and error states
5. Ask about scope: MVP or full implementation?

## Step 2: Plan
1. Read @docs/agent/architecture.md to understand where this fits
2. List the files that need to be created or modified
3. Identify any new dependencies needed
4. Present the plan and ask: "Does this approach make sense?"

## Step 3: Implement
1. Start with the data layer (models, schema, migrations)
2. Build the API/backend logic
3. Build the frontend components
4. Wire everything together
5. After each major step, run existing tests to check for regressions

## Step 4: Test
1. Write unit tests for new business logic
2. Write integration tests for new endpoints
3. Write component tests for new UI
4. Run the full test suite

## Step 5: Update Docs
1. Check all <!-- UPDATE_WHEN --> comments in docs/agent/
2. Update any affected documentation
3. Add changelog entry to modified doc files

## Step 6: Review
1. Use the code-reviewer agent to review all changes
2. Address any critical or warning findings

## Step 7: Wrap Up
1. Update docs/agent/progress.md — task log, milestone status, any decisions made
2. Present completion summary:
   - ✅ What was built (concrete list)
   - 💡 One best practice suggestion if triggered (check best-practices-catalog)
   - ➡️ 2-3 suggested next steps ranked by priority
3. Ask: "Ready for the next step, or want to adjust anything?"
```

---

## new-endpoint/SKILL.md

```markdown
---
name: new-endpoint
description: >
  Create a new API endpoint following project conventions. Use when the user says
  "add an endpoint", "create a route", "new API for [something]", or describes
  backend functionality that needs an HTTP interface.
---

# New API Endpoint

## Step 1: Clarify
1. What resource does this endpoint manage?
2. What HTTP method(s)? (GET, POST, PUT, DELETE)
3. Who can access it? (Public, authenticated, admin-only)
4. What's the request/response shape?
5. Ask: "Should I propose the API contract before building?"

## Step 2: Design
1. Read @docs/agent/api-patterns.md for conventions
2. Propose the endpoint contract:
   - Method + Path
   - Request body / query params
   - Response shape (success + error)
   - Status codes
3. Wait for confirmation before implementing

## Step 3: Implement
1. Create the route handler following project patterns
2. Add input validation
3. Implement business logic (or call existing service layer)
4. Add proper error handling with meaningful error messages
5. Add authentication/authorization checks

## Step 4: Test
1. Write integration tests: happy path + error cases + auth checks
2. Run tests to verify

## Step 5: Update Docs
1. Update @docs/agent/api-patterns.md if this introduces new patterns
2. Add changelog entry

## Step 6: Wrap Up
1. Update docs/agent/progress.md — task log and milestone status
2. Present: what was built, any best practice suggestion, next steps
3. Ask: "Ready for the next step, or want to adjust anything?"
```

---

## new-component/SKILL.md

```markdown
---
name: new-component
description: >
  Scaffold a new frontend component following project conventions. Use when the user says
  "create a component", "build a [UI element]", "add a [widget/form/card/etc]", or
  describes frontend UI that needs a new component.
---

# New Component

## Step 1: Clarify
1. What does this component do?
2. Where does it live in the component hierarchy?
3. Does it need state? (local state, server state, global state)
4. Does it receive data via props or fetch its own?
5. Ask: "Should this be a reusable component or page-specific?"

## Step 2: Scaffold
Following project conventions from .claude/rules/code-style.md:
1. Create the component file in the appropriate directory
2. Define the TypeScript interface for props
3. Use a named export
4. Apply project styling approach ({STYLING — Tailwind, CSS Modules, etc.})

## Step 3: Logic
1. If stateful, co-locate a custom hook: `use{ComponentName}.ts`
2. If fetching data, use the project's data fetching pattern
3. Handle loading, error, and empty states
4. Add accessibility attributes (aria labels, roles, keyboard nav)

## Step 4: Test
1. Create `{ComponentName}.test.{tsx/jsx}` alongside the component
2. Test rendering, user interactions, and edge cases
3. Run tests to verify

## Step 5: Export
1. Add barrel export in the directory's index.ts
2. Update any parent components that should use this

## Step 6: Wrap Up
1. Update docs/agent/progress.md — task log and milestone status
2. Present: what was built, any best practice suggestion, next steps
3. Ask: "Ready for the next step, or want to adjust anything?"
```
