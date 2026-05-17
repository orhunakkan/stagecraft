# stagecraft — Copilot Instructions

Advanced playground for Playwright testing framework. A web application serving interactive practice labs where users write and run Playwright tests against real UI scenarios.

## Testing

- Write Playwright tests before implementing lab pages (TDD)
- Use accessible locators exclusively: `getByRole()`, `getByLabel()`, `getByAltText()`, `getByText()`
- Never use CSS selectors or XPath in Playwright tests — accessible locators only
- Each lab has its own test file matching the lab ID
- Run tests after every change; all tests must pass before committing

## Code Quality

- Build one lab at a time — implement, test, verify, commit before starting the next
- Review across five axes before merging: correctness, readability, architecture, security, performance
- Every PR must pass: lint, type check, tests, build
- No secrets in code or version control

## Implementation

- Every lab page is a standalone HTML page — no shared state between labs
- Lab directory names match the IDs in `practice-labs.md` (e.g. `practice/accessible-locators`)
- ESM modules (`"type": "module"` in package.json)
- Ask before adding new dependencies

## Boundaries

- Always: use accessible locators in Playwright tests, run tests before committing, validate user input
- Never: commit secrets, skip failing tests, use CSS selectors or XPath in tests
