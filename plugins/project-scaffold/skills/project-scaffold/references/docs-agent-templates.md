# Reference Doc Templates

These templates generate the files in `docs/agent/`.
Each file is a deep-dive reference that CLAUDE.md points to via `@` imports.
They are only loaded when Claude is working on a relevant task.

---

## architecture.md

```markdown
# System Architecture

<!-- UPDATE_WHEN: New service, module, or major component is added -->

## Overview
{HIGH_LEVEL_DESCRIPTION — 2-3 sentences about the system design}

## Architecture Pattern
{PATTERN — e.g., Monolithic MVC, API + SPA, Serverless, Microservices}

## System Diagram
{ASCII or mermaid description of how the major pieces connect}

## Module Map
{KEY_MODULES — what each does, what it depends on, public interface}

## Data Flow
{HOW_DATA_MOVES — from user action through frontend → API → database and back}

## External Services
<!-- UPDATE_WHEN: New external service is integrated -->
{LIST — name, purpose, how it's called, where credentials are stored}

## Key Decisions
{ARCHITECTURAL_DECISIONS — why X was chosen over Y, with context}

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation |
```

---

## database-schema.md

```markdown
# Database Schema

<!-- UPDATE_WHEN: New table or significant column change -->

## Overview
{DATABASE_TYPE} with {ORM}
{CONNECTION_PATTERN — connection pooling, read replicas, etc.}

## Tables
{FOR_EACH_TABLE:}
### {table_name}
- Purpose: {what this table stores}
- Key columns: {important columns and their types}
- Relationships: {foreign keys, belongs_to, has_many}
- Indexes: {notable indexes and why}

## Migration Approach
{HOW_MIGRATIONS_WORK — command to create, naming convention, rollback strategy}

## Seeding
{HOW_TO_SEED — command, what data is seeded, dev vs test vs production}

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation |
```

---

## api-patterns.md

```markdown
# API Patterns

<!-- UPDATE_WHEN: New endpoint pattern or error handling change -->

## Base URL
{BASE_URL_PATTERN — e.g., /api/v1/}

## Authentication
{HOW_AUTH_WORKS — Bearer token, session cookie, API key, etc.}

## Request/Response Conventions
- Content-Type: application/json
- Response envelope: {PATTERN — e.g., { data, error, meta }}
- Pagination: {PATTERN — e.g., cursor-based, offset-based}
- Error format: {PATTERN — e.g., { error: { code, message, details } }}

## Status Code Usage
- 200: Success with body
- 201: Created
- 204: Success, no body (deletes)
- 400: Validation error
- 401: Not authenticated
- 403: Not authorized
- 404: Not found
- 500: Server error (should never be intentional)

## Endpoint Inventory
<!-- UPDATE_WHEN: New endpoint is added -->
{TABLE: Method | Path | Description | Auth Required}

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation |
```

---

## workflows.md

```markdown
# Implementation Workflows

<!-- UPDATE_WHEN: Team process changes -->

## Adding a New Feature
1. Create a branch: `{BRANCH_PATTERN}`
2. Plan the implementation (identify all files to touch)
3. Implement data layer first, then backend, then frontend
4. Write tests at each layer
5. Run full test suite
6. Create PR with description explaining WHY

## Adding a New Database Table
1. Create migration: `{MIGRATE_CREATE_CMD}`
2. Define schema with appropriate types and constraints
3. Add indexes for frequently queried columns
4. Create the model with relationships
5. Create seed data for development
6. Run migration: `{MIGRATE_CMD}`
7. Update @docs/agent/database-schema.md

## Adding a New API Endpoint
1. Read @docs/agent/api-patterns.md
2. Define the contract (method, path, request, response)
3. Implement route handler
4. Add input validation
5. Add auth checks
6. Write integration tests
7. Update @docs/agent/api-patterns.md endpoint inventory

## Debugging
1. Reproduce the issue
2. Check logs for relevant errors
3. Isolate to specific layer
4. Form hypotheses, test most likely first
5. Fix root cause, not symptoms
6. Write regression test

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation |
```

---

## testing-strategy.md

```markdown
# Testing Strategy

<!-- UPDATE_WHEN: Test runner changes, new test pattern adopted -->

## Tools
- Runner: {TEST_RUNNER}
- Assertions: {ASSERTION_LIBRARY — built-in or separate}
- Mocking: {MOCK_LIBRARY}
- E2E: {E2E_FRAMEWORK or "not yet"}

## Test Types
- **Unit**: Business logic, utilities, pure functions
- **Integration**: API endpoints, database queries, service interactions
- **Component**: UI rendering, user interactions, state changes
- **E2E**: Critical user flows end-to-end

## Conventions
- File naming: `{PATTERN}`
- Location: co-located with source files
- Describe blocks: group by function or behavior
- Test names: describe what should happen, not how

## Running Tests
- All tests: `{TEST_CMD}`
- Single file: `{TEST_SINGLE_CMD}`
- Watch mode: `{TEST_WATCH_CMD}`
- Coverage: `{TEST_COVERAGE_CMD}`

## What to Mock
- External APIs: always mock
- Database: use test database or in-memory
- Time/dates: mock for deterministic tests
- File system: mock when practical

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation |
```

---

## deployment.md

```markdown
# Deployment

<!-- UPDATE_WHEN: Deployment target, CI/CD pipeline, or env config changes -->

## Environments
- Development: {HOW_TO_RUN_LOCALLY}
- Staging: {STAGING_URL_OR_PROCESS}
- Production: {PRODUCTION_DEPLOY_PROCESS}

## Environment Variables
<!-- UPDATE_WHEN: New env var is added -->
{TABLE: Variable | Required | Description | Where to set}

## Deploy Process
{STEP_BY_STEP — e.g., push to main → CI runs → auto-deploy, or manual steps}

## Pre-Deploy Checklist
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No linter errors
- [ ] Migrations are ready
- [ ] Env vars are set in target environment
- [ ] Breaking changes are communicated

## Rollback
{HOW_TO_ROLLBACK — revert commit, redeploy previous version, etc.}

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation |
```
