# stagecraft

Advanced playground for Playwright testing framework. A web application serving interactive practice labs where users write and run Playwright tests against real UI scenarios.

## Project Structure

```
practice-labs.md        → Lab specifications
practice/               → Lab pages (created as development progresses)
  <lab-id>/             → One directory per lab
tests/                  → Playwright test files (one per lab)
```

## Commands

```bash
# TODO: update when web stack is chosen
npm run dev     # Start dev server
npm test        # Run Playwright tests
npm run build   # Build for production
```

## Conventions

- Every lab page is a standalone HTML page — no shared state between labs
- Lab directory names match the IDs in `practice-labs.md` (e.g. `practice/accessible-locators`)
- Playwright locators use accessible queries (`getByRole`, `getByLabel`, `getByAltText`, `getByText`) — never CSS selectors or XPath
- Write tests before implementing lab pages (TDD)
- Build one lab at a time — implement, test, verify, commit before starting the next

## Skills

Agent-skills are globally available. Common mappings for this project:

- Starting a new lab → `spec-driven-development` → `planning-and-task-breakdown`
- Implementing a lab page → `incremental-implementation` + `test-driven-development`
- Fixing a failing test → `debugging-and-error-recovery`
- Reviewing code → `code-review-and-quality`
- Building UI → `frontend-ui-engineering`
- Security concerns → `security-and-hardening`
