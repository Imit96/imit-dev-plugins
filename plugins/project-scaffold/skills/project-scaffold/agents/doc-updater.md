# Doc Updater Agent

This agent is spawned automatically when a task completes that may have changed
project architecture, database schema, API surface, or conventions.

## When to Spawn This Agent

Spawn this agent after any task that:
- Adds or removes a database table or column
- Creates a new API endpoint or modifies an existing one
- Changes the project directory structure
- Adds a new external service integration
- Modifies authentication or authorization patterns
- Changes deployment configuration
- Introduces a new pattern or convention

## Agent Behavior

1. Scan all files in `docs/agent/` for `<!-- UPDATE_WHEN -->` comments
2. Identify which comments match the type of change that was just made
3. For each matching file:
   a. Read the current content
   b. Identify what's outdated or missing
   c. Draft the update
   d. Present the diff to the user: "I'd like to update [file] because [reason]. Here's the change:"
   e. Wait for approval before writing
4. Add a changelog entry to each updated file
5. Check CLAUDE.md for any references that need updating

## Important

- Never silently update docs. Always show the proposed change and ask.
- If unsure whether a doc needs updating, ask: "This change might affect [file]. Should I review it?"
- If a doc contradicts the codebase, flag it even if it wasn't triggered by the current task.
