# Rules Templates

Each rule file goes in `.claude/rules/`. They are automatically loaded every session.
Keep each file focused on ONE concern. Use imperative voice.

---

## code-style.md

```markdown
# Code Style

<!-- UPDATE_WHEN: Team agrees on new conventions or adopts a new pattern -->

- Use {LANGUAGE} strict mode
- Prefer named exports over default exports
- File naming: {CONVENTION — e.g., kebab-case for files, PascalCase for components}
- One component per file
- Co-locate related files (component + test + hook + types in same directory)
- Barrel exports via index.ts for public APIs of each module
- Prefer composition over inheritance
- Keep functions under 50 lines — extract helpers when they grow

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation |
```

---

## testing.md

```markdown
# Testing Rules

<!-- UPDATE_WHEN: Test runner changes, new test patterns are adopted -->

- Every new feature must include tests before merging
- Test runner: {TEST_RUNNER}
- Unit tests for business logic and utility functions
- Integration tests for API endpoints and database queries
- {E2E_FRAMEWORK if applicable} for critical user flows
- Name test files: `{NAMING_PATTERN — e.g., *.test.ts or *.spec.ts}`
- Use descriptive test names: describe WHAT, not HOW
- Mock external services, never hit real APIs in tests
- Minimum coverage expectation: {COVERAGE_TARGET or "none enforced, use judgment"}

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation |
```

---

## security.md

```markdown
# Security Rules

<!-- UPDATE_WHEN: New auth pattern, new external service, or security incident -->

- Never hardcode API keys, tokens, or secrets — use environment variables
- All user input must be validated before processing
- Use parameterized queries — never string concatenation for database queries
- Sanitize user-generated content before rendering (prevent XSS)
- Every API route must verify authentication before processing
- Apply rate limiting to public-facing endpoints
- Log security-relevant events (failed auth, permission denied, unusual patterns)
- Never log sensitive data (passwords, tokens, PII)
- Dependencies: run `{AUDIT_CMD — e.g., pnpm audit}` before releases

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation |
```

---

## git-conventions.md

```markdown
# Git Conventions

<!-- UPDATE_WHEN: Branching strategy or CI pipeline changes -->

- Branch naming: `{PATTERN — e.g., feat/short-description, fix/issue-number-description}`
- Commit format: `{FORMAT — e.g., conventional commits: type(scope): description}`
- Keep commits atomic — one logical change per commit
- Write PR descriptions that explain WHY, not just WHAT
- Squash merge to main unless history is important
- Never force-push to shared branches
- Tag releases with semantic versioning: v{MAJOR}.{MINOR}.{PATCH}

---
## Changelog
| Date | Change |
|------|--------|
| {GENERATION_DATE} | Initial generation |
```
