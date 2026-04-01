# Best Practices Catalog

A library of contextual suggestions triggered by specific project states.
The agent surfaces ONE suggestion at a time, only when the trigger condition is met.

---

## How This Works

Each entry has:
- **Trigger**: The condition that activates this suggestion
- **Suggestion**: What to recommend
- **Why Now**: Justification tied to what just happened
- **Effort**: Low / Medium / High
- **Category**: Security / Performance / Quality / Reliability / DX (Developer Experience)

The agent checks these triggers after every task and surfaces the first matching one
(maximum one per task). If the user says "skip" or "later", log it in progress.md
under Known Technical Debt with priority and date.

---

## Security

### SEC-1: Input Validation Middleware
- **Trigger**: 3+ API endpoints exist without centralized validation
- **Suggestion**: Add a validation middleware layer (Zod, Joi, class-validator) to avoid repeating validation logic per route
- **Why Now**: You have enough endpoints that duplicating validation becomes a maintenance risk
- **Effort**: Medium
- **Category**: Security

### SEC-2: Rate Limiting on Auth
- **Trigger**: Auth endpoints (login, register, reset password) are implemented
- **Suggestion**: Add rate limiting to authentication endpoints to prevent brute force attacks
- **Why Now**: Auth endpoints are the #1 target for automated attacks
- **Effort**: Low
- **Category**: Security

### SEC-3: Environment Variable Audit
- **Trigger**: First deployment discussion or config, or 5+ env vars in use
- **Suggestion**: Audit all environment variables — ensure none are hardcoded, all are documented, and production values are in a secure vault
- **Why Now**: Before deploying, this is your last easy chance to catch leaked secrets
- **Effort**: Low
- **Category**: Security

### SEC-4: CORS Configuration
- **Trigger**: API is being called from a frontend on a different origin
- **Suggestion**: Configure CORS explicitly with allowed origins, methods, and headers — don't use wildcard (*) in production
- **Why Now**: Default CORS configs are either too open or too restrictive
- **Effort**: Low
- **Category**: Security

### SEC-5: SQL Injection Check
- **Trigger**: Raw SQL queries detected (not using ORM parameterized queries)
- **Suggestion**: Replace string-concatenated SQL with parameterized queries or ORM methods
- **Why Now**: This is the most common and dangerous web vulnerability
- **Effort**: Low
- **Category**: Security

---

## Performance

### PERF-1: Database Indexes
- **Trigger**: 5+ database tables exist, or a query is noticeably slow
- **Suggestion**: Review tables for missing indexes on foreign keys and frequently-filtered columns
- **Why Now**: Index strategy is cheaper to implement now than after data volume grows
- **Effort**: Low
- **Category**: Performance

### PERF-2: N+1 Query Detection
- **Trigger**: List/index endpoints are created that fetch related data
- **Suggestion**: Check for N+1 queries — use eager loading (include/with/join) for related data
- **Why Now**: N+1 queries are invisible in dev with small data but kill production performance
- **Effort**: Medium
- **Category**: Performance

### PERF-3: API Response Pagination
- **Trigger**: Any list endpoint returns potentially unbounded results
- **Suggestion**: Add pagination (cursor-based preferred) to list endpoints before the dataset grows
- **Why Now**: Unpaginated endpoints work fine with 10 records but time out with 10,000
- **Effort**: Medium
- **Category**: Performance

### PERF-4: Frontend Bundle Size
- **Trigger**: 10+ frontend components exist, or a new large dependency is added
- **Suggestion**: Check bundle size — consider code splitting, lazy loading for routes, and tree-shaking
- **Why Now**: Bundle size creeps up silently; catching it early is much easier than fixing later
- **Effort**: Medium
- **Category**: Performance

### PERF-5: Caching Strategy
- **Trigger**: Repeated expensive queries or external API calls
- **Suggestion**: Consider caching (Redis, in-memory, HTTP cache headers) for frequently-accessed data
- **Why Now**: You're making the same expensive call multiple times — a cache would reduce latency and cost
- **Effort**: Medium
- **Category**: Performance

---

## Code Quality

### QUAL-1: Testing Checkpoint
- **Trigger**: 5+ implementation tasks completed without writing tests
- **Suggestion**: Pause and write tests for what's been built so far. The longer you wait, the harder it gets
- **Why Now**: You've built significant functionality without a safety net. One refactor could break things silently
- **Effort**: Medium-High
- **Category**: Quality

### QUAL-2: Extract Shared Utility
- **Trigger**: Same logic pattern appears in 3+ places
- **Suggestion**: Extract the repeated pattern into a shared utility function
- **Why Now**: The pattern just appeared a third time — it's officially a pattern, not a coincidence
- **Effort**: Low
- **Category**: Quality

### QUAL-3: Error Handling Strategy
- **Trigger**: 3+ API endpoints exist without a consistent error handling pattern
- **Suggestion**: Define a centralized error handling strategy — custom error classes, error middleware, consistent response format
- **Why Now**: Inconsistent error handling creates confusing API responses and makes debugging harder
- **Effort**: Medium
- **Category**: Quality

### QUAL-4: Type Safety Audit
- **Trigger**: TypeScript project with `any` types appearing in multiple files
- **Suggestion**: Replace `any` types with proper interfaces — start with the most-used ones
- **Why Now**: `any` defeats the purpose of TypeScript and hides bugs
- **Effort**: Low-Medium
- **Category**: Quality

### QUAL-5: Code Review Checkpoint
- **Trigger**: A major feature (3+ files changed, new patterns introduced) is completed
- **Suggestion**: Spawn the code-reviewer agent for a quality pass before moving to the next feature
- **Why Now**: Fresh eyes on a completed feature catch things that are hard to see when you're deep in implementation
- **Effort**: Low
- **Category**: Quality

---

## Reliability

### REL-1: Error Monitoring
- **Trigger**: First deployment or production discussion
- **Suggestion**: Set up error monitoring (Sentry, LogRocket, Bugsnag) so you know when things break in production
- **Why Now**: Without monitoring, you'll only find bugs when users complain
- **Effort**: Low
- **Category**: Reliability

### REL-2: Health Check Endpoint
- **Trigger**: Deployment pipeline is being set up
- **Suggestion**: Add a /health endpoint that checks database connectivity and returns service status
- **Why Now**: Deployment platforms use health checks to route traffic and detect outages
- **Effort**: Low
- **Category**: Reliability

### REL-3: Database Backup Strategy
- **Trigger**: Production database contains user data
- **Suggestion**: Set up automated backups and test the restore process at least once
- **Why Now**: You have real data worth protecting. Backups you haven't tested aren't backups
- **Effort**: Medium
- **Category**: Reliability

### REL-4: Graceful Degradation
- **Trigger**: External service integration (payment, email, API) is implemented
- **Suggestion**: Add fallback behavior when the external service is down — don't let one dependency take down your whole app
- **Why Now**: External services fail. The question is when, not if
- **Effort**: Medium
- **Category**: Reliability

---

## Developer Experience

### DX-1: Seed Data
- **Trigger**: Database models are created but no seed data exists
- **Suggestion**: Create seed data for development — realistic enough to test with, easy to reset
- **Why Now**: Every new developer (including future-you) will need sample data to work with
- **Effort**: Low
- **Category**: DX

### DX-2: README Update
- **Trigger**: Project has working dev setup but README is still default/empty
- **Suggestion**: Update README with: what the project does, how to set up locally, how to run tests, how to deploy
- **Why Now**: If you can't onboard yourself in 5 minutes from the README, neither can anyone else
- **Effort**: Low
- **Category**: DX

### DX-3: Environment Setup Documentation
- **Trigger**: Project requires 3+ environment variables or external service setup
- **Suggestion**: Create a .env.example file and document each variable's purpose and how to obtain it
- **Why Now**: Missing env vars are the #1 cause of "it works on my machine" problems
- **Effort**: Low
- **Category**: DX

---

## Completion Signals

These aren't suggestions — they're signals the agent watches for to determine when
to recommend stopping or shifting focus.

### Task-Level: Stop When
- Stated requirements are met (not more, not less)
- Tests pass for the implemented functionality
- Error states are handled for stated edge cases
- No unrequested features were added

### Feature-Level: Review When
- All endpoints work end-to-end
- Frontend is wired to backend
- Tests exist and pass
- Error handling is consistent

### Project-Level: Launch-Ready When
- All milestones in progress.md are ✅ Done
- Test suite passes
- No critical tech debt items
- Deployment pipeline works
- Docs are current
- Security basics are covered (SEC-1 through SEC-5)

### Over-Engineering Signals: Pull Back When
- Adding features the user didn't ask for
- Optimizing before there's a performance problem
- Building abstractions for hypothetical future use cases
- Spending more time on tooling than on the product
- Refactoring working code that doesn't need it
