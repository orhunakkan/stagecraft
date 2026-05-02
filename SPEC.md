# Spec: Stagecraft

## Status
Draft pending human review and approval. No application code should be written until this spec is approved.

## Product Direction
Stagecraft is a web application for learning and practicing modern test automation through hands-on browser tasks. The MVP focuses on full compatibility with Playwright and clear, self-guided exercises for test automation engineers and automation-curious learners.

The app must teach by practice, not by giving users finished answers. Users should read a task, understand the goal, inspect and interact with a realistic UI, then write their own Playwright tests outside the app.

## Assumptions
1. Stagecraft is a new TypeScript-only web application.
2. The primary MVP goal is Playwright-compatible automation practice.
3. The existing `docs/` directory contains current Playwright documentation extracted from the official Playwright website and should be used as the implementation/content reference source.
4. Users will run their own separate Playwright project against the app locally.
5. The app itself should not generate, reveal, or ship solution test scripts.
6. Authentication, accounts, paid courses, leaderboards, and backend persistence are not required for the MVP unless explicitly approved later.
7. The initial app stores lightweight local learner progress in browser storage, but exercise correctness does not depend on accounts.
8. The product name remains **Stagecraft** for the MVP.
9. Dark mode is a required MVP feature, not a later enhancement.

If any assumption is wrong, update this spec before implementation begins.

## Objective
Build a colorful, modern web application where users practice test automation skills on realistic UI challenges designed for Playwright.

The MVP should help users answer:

- What automation skill am I practicing?
- What task should I complete?
- What user-facing behavior should my test verify?
- Which constraints should my automation respect?
- Where can I practice without being handed the answer?

### Primary Users

- **Test Automation Engineers:** Practice Playwright skills, modern locator strategies, assertions, network handling, and stable automation patterns.
- **Manual QA Engineers transitioning to automation:** Learn how automation tasks map to realistic UI behavior.
- **Developers curious about test automation:** Understand how to build and validate automatable web interfaces.
- **Interview or training candidates:** Practice practical UI automation scenarios without seeing direct solutions.

### Success Definition

Stagecraft is successful when a user can open the app, choose a Playwright-focused challenge, clearly understand the task, interact with a realistic web page, and write their own Playwright test without the app revealing the implementation answer or test script.

## Product Requirements

### Functional Requirements

#### 1. Challenge Catalog

- The app displays a catalog of automation practice challenges.
- Each challenge includes:
  - Title
  - Difficulty: beginner, intermediate, advanced
  - Estimated time
  - Primary automation concept
  - Short scenario summary
  - Tags such as locators, assertions, forms, tables, network, auth, accessibility, API, visual, debugging, fixtures, tracing, screenshots, downloads, uploads, dialogs, tabs, frames, mobile emulation, retries, parallelism, and configuration
- Users can filter challenges by difficulty and concept.
- Users can search challenges by title, concept, and tags.
- Challenge cards should be colorful, visually distinct, and easy to scan.

#### 2. Challenge Detail Page

Each challenge page must clearly explain what the user should do without giving direct answers.

A challenge includes:

- Scenario context
- Learning objective
- Task instructions
- Acceptance criteria written in user-observable terms
- Constraints or rules
- Optional conceptual hints that reference Playwright concepts without solution code
- Plain-language references to relevant Playwright concepts when appropriate, without linking or rendering official documentation inside the app

The challenge page must not include:

- Complete Playwright test scripts
- Copy-pasteable locator answers
- Hidden solution files exposed through the UI
- Step-by-step code recipes that remove the need for the user to reason through the task

#### 3. Interactive Practice Pages

- Each challenge links to one or more interactive practice pages.
- Practice pages simulate realistic application behavior suitable for automation.
- MVP practice areas should include at least:
  1. **Accessible Locators Lab:** Buttons, links, headings, labels, ARIA roles, and accessible names.
  2. **Forms and Validation Lab:** Inputs, selects, checkboxes, radio buttons, validation messages, disabled/enabled states.
  3. **Tables and Filtering Lab:** Search, sort, filter, pagination, empty results, and row-level actions.
  4. **Async UI Lab:** Loading states, delayed results, optimistic or staged updates, retry behavior.
  5. **Network/API Lab:** UI backed by deterministic mock API routes suitable for Playwright request/response assertions or route mocking.
  6. **Auth-like Session Lab:** A safe fake login/session workflow for practicing storage state, redirects, and protected routes without real credentials.
- Practice pages must be deterministic by default so tests are stable.
- Any randomness or intentionally flaky behavior must be explicitly labeled as a debugging challenge.
- The challenge library should cover as many Playwright documentation-backed topics as practical, using the local `docs/` folder as the curriculum source.
- Breadth should be added through clear, maintainable labs rather than overwhelming a single page with unrelated behaviors.

#### 4. Playwright Compatibility

Full Playwright compatibility is the MVP priority. Users are expected to create and maintain their own separate Playwright project and point it at the local Stagecraft app.

The app must:

- Work reliably with Playwright browsers: Chromium, Firefox, and WebKit where the framework supports them.
- Favor accessible, user-facing locators by using semantic HTML, labels, roles, names, and visible text.
- Avoid requiring brittle selectors such as generated class names or deeply nested CSS paths.
- Use `data-testid` only when a stable user-facing locator is not appropriate.
- Avoid anti-automation patterns such as CAPTCHA, bot detection, random blocking overlays, or intentionally unstable timing outside debugging labs.
- Provide deterministic data reset paths for tests.
- Expose predictable routes for each challenge/practice page.
- Support repeatable test runs without manual cleanup.
- Include clear loading, success, error, validation, and empty states.

#### 5. Documentation-Driven Content

- The local `docs/` folder is the authoritative internal source for Playwright concepts during implementation.
- Exercise design should be cross-checked against relevant files in:
  - `docs/guides/`
  - `docs/api/`
  - `docs/agent-cli/`
  - `docs/mcp/` if relevant
- Documentation should inform task design, terminology, and recommended practices.
- Official Playwright documentation content should not be rendered, mirrored, or linked from challenge pages in the MVP.
- The app may reference documentation concepts in plain language, but should avoid exposing solution-like code snippets directly in challenge instructions.
- If documentation and assumptions conflict, prefer the local official-doc extraction and update this spec or implementation plan.

#### 6. Learner Progress

- MVP tracks self-marked local progress in the browser:
  - Not started
  - In progress
  - Practiced
  - Completed manually by learner
- Progress tracking must not require login.
- Users manually mark practice status; the MVP does not automatically detect challenge completion.
- The app should not need to evaluate uploaded test scripts in the MVP.
- If automated grading is desired later, it must be added through a future approved spec update.

#### 7. Colorful User Experience and Dark Mode

- The app should feel energetic, modern, and encouraging.
- Dark mode is required for the MVP and should feel intentionally designed, not like an afterthought.
- The app should support a clear theme toggle or system-aware theme behavior; the exact implementation should be confirmed in the technical plan.
- Use a colorful design system in both light and dark themes with:
  - Strong accent colors
  - Gradients or layered backgrounds where appropriate
  - Distinct color-coded tags/difficulty indicators
  - Clear cards and panels
  - Friendly empty states
- Color must enhance usability, not replace text labels or accessible states.
- All important state must be communicated through text, icons, or structure in addition to color.

### Non-Functional Requirements

- The application must be TypeScript-only for source, tests, and supported tool configuration.
- Do not create `.js` or `.jsx` files.
- The UI should be responsive on desktop, tablet, and common laptop widths.
- Dark mode must be supported and tested.
- The app must be accessible enough to support modern Playwright locator best practices.
- User-entered text must be rendered safely without unsafe HTML injection.
- Practice behavior must be deterministic and resettable.
- Build, lint, type-check, unit/component tests, and Playwright tests must run from documented commands.
- The codebase should have clear feature boundaries and be easy for future contributors to extend with new challenges.

## Tech Stack

Proposed stack for the initial implementation, pending approval:

- Language: TypeScript only
- Runtime: Node.js LTS
- Package manager: npm unless another package manager is approved
- Deployment target: local development app for MVP
- Framework: Next.js with React and App Router
- Styling: Tailwind CSS with a custom colorful light/dark design system
- UI primitives: Radix UI where accessible primitives are useful
- Icons: Lucide React
- Unit/integration testing: Vitest
- Component testing: React Testing Library
- Browser automation testing: Playwright Test
- Linting: ESLint with TypeScript-aware rules
- Formatting: Prettier
- Type checking: TypeScript strict mode
- Persistence: Browser local storage for MVP learner progress only

No dependency should be added until the implementation plan is approved.

## Commands

These commands define the expected developer workflow once the project is initialized. If the chosen framework generates different script names, update this section before implementation.

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build

# Run unit and component tests with coverage
npm test -- --coverage

# Run Playwright end-to-end tests
npm run test:e2e

# Open Playwright UI mode, if configured
npm run test:e2e:ui

# Run linter
npm run lint

# Run formatter check
npm run format:check

# Run type checking
npm run typecheck

# Run all verification checks
npm run verify
```

## Project Structure

Target structure for the implementation:

```text
.
├── SPEC.md                    # Product requirements and implementation boundaries
├── README.md                  # Setup, commands, and learner/contributor guidance
├── package.json               # Scripts and dependencies
├── docs/                      # Local extracted Playwright documentation and project ADRs
│   ├── guides/                # Official Playwright guide extraction
│   ├── api/                   # Official Playwright API extraction
│   ├── agent-cli/             # Official Playwright agent CLI docs, if used
│   ├── mcp/                   # Official Playwright MCP docs, if used
│   └── adr/                   # Project architecture decision records
├── src/                       # Application source code
│   ├── app/                   # Next.js routes, layouts, and route handlers
│   ├── components/            # Reusable UI components
│   ├── features/              # Feature-specific modules
│   │   ├── challenges/        # Challenge catalog, metadata, and detail pages
│   │   ├── practice-labs/     # Interactive practice experiences
│   │   ├── progress/          # Local progress state
│   │   └── docs-reference/    # Safe references to docs concepts, not answers
│   ├── lib/                   # Shared utilities and infrastructure
│   ├── styles/                # Global styles/design tokens
│   └── test/                  # Test setup utilities
├── tests/                     # Cross-feature integration tests
├── e2e/                       # Playwright end-to-end tests for the app itself
└── public/                    # Static assets
```

### File Placement Rules

- Shared, reusable UI belongs in `src/components/`.
- Challenge metadata and challenge display logic belongs in `src/features/challenges/`.
- Interactive challenge implementations belong in `src/features/practice-labs/`.
- Local progress logic belongs in `src/features/progress/`.
- Shared helpers belong in `src/lib/` only when used by more than one feature.
- Unit/component tests should be colocated with the code when practical.
- Cross-feature integration tests should live in `tests/`.
- Playwright end-to-end tests for validating Stagecraft itself should live in `e2e/`.
- Architecture decisions should live in `docs/adr/`.
- Official Playwright documentation extractions under `docs/guides`, `docs/api`, `docs/agent-cli`, and `docs/mcp` should not be casually edited.

## Code Style

### Conventions

- Use TypeScript for all application and test code.
- Never create `.js` or `.jsx` files.
- Use strict TypeScript types and avoid `any` unless a narrow reason is documented.
- Prefer semantic HTML and accessible components.
- Prefer user-facing names in component and domain models: `Challenge`, `PracticeLab`, `LearningObjective`, `AcceptanceCriterion`.
- Use `PascalCase` for React components and exported types.
- Use `camelCase` for variables, functions, and object properties.
- Keep feature modules cohesive; avoid importing from another feature's private internals.
- Keep challenge instructions separate from any internal validation or test code.
- Do not place solution scripts or solution locators in public source files, fixtures, or UI copy.
- Validate and normalize user input at module boundaries.
- Prefer small, named functions over large inline handlers.

### Example Style

```ts
type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';

type ChallengeStatus = 'notStarted' | 'inProgress' | 'practiced' | 'completed';

interface ChallengeSummary {
  id: string;
  title: string;
  difficulty: ChallengeDifficulty;
  estimatedMinutes: number;
  concepts: string[];
  practicePath: string;
}

function getVisibleChallenges(
  challenges: ChallengeSummary[],
  selectedConcept: string | null,
): ChallengeSummary[] {
  if (!selectedConcept) return challenges;

  return challenges.filter((challenge) =>
    challenge.concepts.includes(selectedConcept),
  );
}
```

## Testing Approach

Stagecraft should model the same modern automation practices it teaches.

### Required Test Levels

- **Unit tests:** Challenge filtering, progress state, metadata validation, deterministic data builders, utility functions.
- **Component tests:** Challenge cards, filters, instruction panels, colorful UI states, forms, validation messages, empty states.
- **Integration tests:** Challenge catalog to detail navigation, progress persistence, practice lab state reset, mock API behavior.
- **Playwright end-to-end tests:** Critical user flows and verification that practice pages are automatable through user-facing locators.

### Playwright-Focused Verification

End-to-end tests should prove:

1. The challenge catalog is discoverable and filterable.
2. A user can open a challenge and understand the task without seeing a solution script.
3. Each MVP practice lab can be automated using Playwright-friendly locators.
4. Forms expose accessible labels, validation messages, and state changes.
5. Tables can be searched, sorted, filtered, and paginated deterministically.
6. Async UI can be tested without arbitrary sleeps.
7. Fake auth/session flows are repeatable and resettable.
8. Mock network/API flows are deterministic.
9. Local progress persists across reloads and can be reset.
10. Dark mode can be enabled and remains usable/readable.
11. No challenge page exposes complete Playwright answer code.

### Coverage Expectations

- Domain utilities: high coverage, including edge cases.
- UI components: cover meaningful behavior, not implementation details.
- Playwright tests: cover happy paths, validation/error paths, and automatable locator quality.
- Accessibility checks should be included where practical.
- No failing tests may be removed, skipped, or weakened without explicit approval.

### Verification Gate

Before any implementation task is considered complete, run the relevant checks. Before final completion, run:

```bash
npm run lint
npm run typecheck
npm test -- --coverage
npm run test:e2e
npm run build
```

The final implementation should also pass:

```bash
npm run verify
```

## Boundaries

### Always Do

- Keep `SPEC.md` updated when scope or decisions change.
- Ask for approval before moving from specification to planning, tasks, or implementation.
- Use TypeScript only.
- Consult local Playwright documentation under `docs/` before implementing Playwright-related behavior.
- Design practice pages to be deterministic, accessible, and Playwright-compatible.
- Write tests for new logic and behavior.
- Use Playwright tests to validate the app's own automation practice flows.
- Run relevant verification commands before marking work complete.
- Preserve clear feature/module boundaries.
- Validate and safely render user-provided text.
- Keep challenge instructions clear, actionable, and free from complete answer scripts.
- Document non-obvious architectural decisions in `docs/adr/`.

### Ask First

- Adding dependencies.
- Choosing a different frontend framework, styling system, or package manager.
- Adding a backend, database, authentication, external service, or paid account system.
- Adding automated grading or test-script evaluation.
- Rendering or linking official Playwright documentation content directly inside the app.
- Changing the local documentation extraction under `docs/`.
- Changing CI/CD configuration.
- Introducing generated code.
- Restructuring major directories after implementation starts.
- Expanding scope beyond the MVP requirements listed here.

### Never Do

- Write application code before this spec is approved.
- Create `.js` or `.jsx` source/config/test files.
- Give users direct Playwright answer scripts in the app.
- Commit secrets, API keys, credentials, or private production data.
- Edit dependency/vendor directories directly.
- Remove, skip, or weaken failing tests to make checks pass.
- Add analytics, telemetry, tracking, or third-party learning instrumentation without approval.
- Add anti-automation features such as CAPTCHA or bot detection.
- Implement billing, payments, subscriptions, or user accounts in the MVP.
- Store sensitive personal data.

## Out of Scope for MVP

- Real user authentication and authorization.
- Multi-user accounts, teams, organizations, or classrooms.
- Paid courses, subscriptions, billing, or certificates.
- Automated grading of user-submitted tests.
- Uploading, storing, or running user test scripts.
- AI-generated tests, answers, hints, or evaluations.
- Full learning management system features.
- Leaderboards or social features.
- Native mobile applications.
- Browser extension tooling.
- Production analytics or user tracking.
- CAPTCHA, bot detection, or intentionally blocking automation.
- Maintaining a public copy of the full Playwright documentation inside the app unless separately approved.

## Success Criteria

The MVP is complete when:

- A user can browse, search, and filter Playwright-focused automation challenges.
- Each challenge clearly explains what to practice without exposing solution scripts.
- At least six MVP practice labs exist: accessible locators, forms/validation, tables/filtering, async UI, network/API, and fake auth/session.
- Practice labs are deterministic, resettable, and suitable for Playwright automation.
- The app uses semantic HTML and accessible labels to encourage modern locator strategies.
- The UI is colorful, responsive, dark-mode capable, and accessible enough for practical automation learning.
- Local progress can be tracked without login.
- The codebase is TypeScript-only.
- The documented build, lint, type-check, unit/component test, Playwright test, and verification commands pass.
- Implementation decisions are grounded in the local Playwright documentation under `docs/`.
- No out-of-scope features are implemented without spec approval.

## Resolved Decisions

- Product name remains **Stagecraft**.
- Users create and maintain their own separate Playwright project to practice against Stagecraft.
- Conceptual hints are allowed if they do not include solution code, direct answer scripts, or copy-pasteable locator answers.
- Learners self-mark challenge progress in the MVP.
- Official Playwright documentation in `docs/` is used internally during implementation and is not rendered or linked inside the app.
- The MVP optimizes for local development usage, not deployment.
- Dark mode is required in the MVP.
- Challenge coverage should include as many Playwright documentation-backed topics as practical, prioritizing breadth through maintainable labs.

## Open Questions

None currently. Awaiting human approval of this spec before planning or implementation.

## Approval Gate

Implementation must not begin until a human approves this spec or provides corrections. After approval, proceed to a technical plan, then task breakdown, then implementation.
