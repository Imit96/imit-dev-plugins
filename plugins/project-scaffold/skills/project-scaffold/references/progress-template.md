# Progress Template

Use this template when generating `docs/agent/progress.md`. Customize milestones
based on the project type discovered during the interview.

---

```markdown
# Project Progress — {PROJECT_NAME}

> This file is the single source of truth for where the project stands.
> Read this at the start of every session. Update it after every task.

<!-- UPDATE_WHEN: Any task is completed, decision is made, or question is resolved -->

## Project Milestones

{GENERATE MILESTONES BASED ON PROJECT TYPE — see patterns below}

| # | Milestone | Status | Started | Completed | Notes |
|---|-----------|--------|---------|-----------|-------|
| 1 | Project setup & scaffolding | ✅ Done | {DATE} | {DATE} | Agent docs generated |
| 2 | {MILESTONE_2} | 🔲 Not started | | | |
| 3 | {MILESTONE_3} | 🔲 Not started | | | |
| ... | | | | | |

**Status key**: 🔲 Not started · 🔄 In progress · ✅ Done · ⏸️ Blocked · ❌ Dropped

## Current Sprint Focus

{THE_MILESTONE_CURRENTLY_IN_PROGRESS — update when focus shifts}

**Goal**: {What "done" looks like for this milestone}
**Tasks remaining**:
- {task 1}
- {task 2}
- {task 3}

## Task Log

<!-- Most recent first. Every completed task gets a row. -->

| Date | Task | Category | Milestone | Outcome |
|------|------|----------|-----------|---------|
| {DATE} | Generated agent config files | Setup | #1 | ✅ Complete |

## Decisions Made

<!-- Record every non-trivial decision so future-you knows WHY -->

| Date | Decision | Context | Alternatives Considered |
|------|----------|---------|------------------------|
| {DATE} | Chose {STACK} | Initial setup | {WHAT_ELSE_WAS_CONSIDERED} |

## Open Questions

<!-- Things that need human input to resolve. Remove when answered. -->

- {Any unresolved questions from the discovery interview}

## Known Technical Debt

<!-- Shortcuts, skipped suggestions, things to revisit. Rate: Low / Medium / High priority -->

| Item | Priority | Added | Context |
|------|----------|-------|---------|
| (None yet) | | | |

## Best Practices Log

<!-- Track suggestions: acted on, skipped, or deferred -->

| Date | Suggestion | Status | Notes |
|------|-----------|--------|-------|
| (None yet) | | | |

**Status key**: ✅ Acted on · ⏭️ Skipped · 📌 Deferred

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation via project-scaffold skill |
```

---

## Milestone Patterns by Project Type

Use these as starting points. Always customize and confirm with the user.

### SaaS / Dashboard App
1. Project setup & scaffolding
2. Database schema & models
3. Authentication & authorization
4. Core API endpoints
5. Frontend shell, routing & layout
6. User management (CRUD, roles, invite)
7. Core feature: {PRIMARY_FEATURE}
8. Core feature: {SECONDARY_FEATURE}
9. Billing & subscription (if applicable)
10. Testing suite (unit + integration)
11. Deployment pipeline
12. Monitoring & error tracking
13. Launch readiness review

### E-commerce
1. Project setup & scaffolding
2. Database schema & models
3. Authentication & user accounts
4. Product catalog (CRUD, categories, search)
5. Shopping cart & sessions
6. Checkout flow
7. Payment integration (Stripe, etc.)
8. Order management & history
9. Email notifications (confirmation, shipping)
10. Admin dashboard
11. Testing suite
12. Deployment pipeline
13. Launch readiness review

### API-Only / Backend Service
1. Project setup & scaffolding
2. Database schema & models
3. Authentication (API keys, JWT, OAuth)
4. Core resource endpoints
5. Input validation & error handling
6. Rate limiting & throttling
7. API documentation (OpenAPI/Swagger)
8. Webhooks (if applicable)
9. Testing suite (unit + integration + contract)
10. CI/CD pipeline
11. Monitoring & logging
12. Launch readiness review

### Content Platform / CMS
1. Project setup & scaffolding
2. Database schema & models
3. Authentication & roles (author, editor, admin)
4. Content CRUD & rich text editing
5. Media upload & management
6. Content publishing workflow (draft → review → publish)
7. Frontend rendering & SEO
8. Search functionality
9. Comments / interaction (if applicable)
10. Testing suite
11. Deployment pipeline
12. Launch readiness review

### Portfolio / Marketing Site
1. Project setup & scaffolding
2. Page layout & responsive design
3. Content sections (hero, about, services, contact)
4. Contact form & email integration
5. CMS integration (if applicable)
6. SEO & metadata
7. Performance optimization
8. Analytics integration
9. Deployment pipeline
10. Launch readiness review

### Mobile App Backend
1. Project setup & scaffolding
2. Database schema & models
3. Authentication (JWT, refresh tokens, device management)
4. Core API endpoints
5. Push notification infrastructure
6. File/media upload & CDN
7. Real-time features (if applicable — WebSocket, SSE)
8. Background jobs & queues
9. API versioning strategy
10. Testing suite
11. CI/CD pipeline
12. Launch readiness review
