# stagecraft — Agent Instructions

Advanced playground for Playwright testing framework. A web application serving interactive practice labs where users write and run Playwright tests against real UI scenarios.

## Intent → Skill Mapping

Always check if a skill applies before writing any code. If it does, load it and follow every step.

| User Intent | Skill to Load |
|---|---|
| New lab, new feature, unclear requirements | `spec-driven-development` |
| Break work into tasks, plan implementation | `planning-and-task-breakdown` |
| Write code, implement a lab page | `incremental-implementation` + `test-driven-development` |
| Fix a bug, tests failing, unexpected behavior | `debugging-and-error-recovery` |
| Review code before merge | `code-review-and-quality` |
| Building UI, frontend work | `frontend-ui-engineering` |
| Designing an API or module interface | `api-and-interface-design` |
| Security concerns, user input handling | `security-and-hardening` |
| Performance issues | `performance-optimization` |
| Refactoring, simplifying complex code | `code-simplification` |
| Git commits, branching strategy | `git-workflow-and-versioning` |
| Setting up CI/CD pipelines | `ci-cd-and-automation` |

## Rules

- Always check if a skill applies before writing any code
- If a skill applies, load it and follow every step
- Never skip the spec step for non-trivial work
- Never skip verification — "seems right" is not evidence
- Tests must pass before a task is considered done

## Project Structure

```
practice-labs.md        → Lab specifications
practice/               → Lab pages (one directory per lab)
tests/                  → Playwright test files (one per lab)
```

## Conventions

- Every lab page is a standalone HTML page — no shared state between labs
- Lab directory names match the IDs in `practice-labs.md` (e.g. `practice/accessible-locators`)
- Playwright locators use accessible queries (`getByRole`, `getByLabel`, `getByAltText`, `getByText`) — never CSS selectors or XPath
- Write tests before implementing lab pages (TDD)
- Build one lab at a time — implement, test, verify, commit before starting the next

## Commands

```bash
# TODO: update when web stack is chosen
npm run dev     # Start dev server
npm test        # Run Playwright tests
npm run build   # Build for production
```
