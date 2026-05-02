# Implementation Plan: Stagecraft

## Status
Draft pending human review and approval. No implementation should begin until this plan is approved.

## Source Inputs

- Approved product specification: `SPEC.md`
- Local Playwright documentation consulted for planning:
  - `docs/guides/best-practices.md`
  - `docs/guides/locators.md`
  - `docs/guides/test-typescript.md`
  - `docs/guides/network.md`
  - `docs/guides/auth.md`

Key documentation principles reflected in this plan:

- Prioritize user-visible behavior over implementation details.
- Favor Playwright locators based on role, label, text, alt text, title, and stable test IDs only when needed.
- Use web-first assertions and deterministic async behavior.
- Keep tests isolated and resettable.
- Run TypeScript checking separately because Playwright can execute TypeScript tests without full type checking.
- Model auth/session practice around safe fake state, not real credentials.

## Overview

Build Stagecraft as a local-only, TypeScript-only, colorful web app for practicing modern Playwright automation. The application will provide a challenge catalog, clear challenge instructions without answers, interactive practice labs, self-marked local progress, dark mode, and internal documentation-driven curriculum coverage.

The implementation should proceed vertically: establish the app foundation, deliver the challenge catalog and instruction model, then add practice labs one by one with tests and Playwright compatibility verification at each checkpoint.

## Architecture Decisions

### 1. Framework and Runtime

- Use Next.js with React and App Router.
- Use TypeScript strict mode for application and tests.
- Keep MVP optimized for local development via `npm run dev`.
- Avoid `.js` and `.jsx` files; use `.ts`, `.tsx`, `.json`, `.css`, and Markdown files where appropriate.

### 2. Styling and Dark Mode

- Use Tailwind CSS for a colorful, maintainable design system.
- Dark mode is required and should be designed alongside light mode.
- Theme state should support a user-visible toggle and preferably respect system preference on first visit.
- Important states must not rely on color alone.

### 3. Challenge Content Model

- Store challenge metadata as typed TypeScript data, not as free-form untyped objects.
- Separate public learner-facing instructions from internal validation/test logic.
- Challenge instructions may include conceptual hints but must not include complete Playwright scripts or copy-pasteable locator answers.
- The local `docs/` folder is used internally to shape challenge topics and terminology, but docs are not rendered or linked inside the app.

### 4. Practice Lab Design

- Each practice lab gets a predictable route.
- Each lab has deterministic data and an explicit reset mechanism.
- Labs should be realistic enough for automation practice but small enough to understand quickly.
- Accessible names, labels, roles, and visible state should be intentional so users can practice resilient Playwright locators.

### 5. Progress Model

- Learner progress is self-marked and stored in browser local storage.
- No login or backend is required.
- Progress state should be resettable.
- Progress must not imply automated grading.

### 6. Mock API and Session Practice

- Use local Next.js route handlers for deterministic mock API behavior where needed.
- Fake auth/session practice should use safe local/session state and predictable routes.
- No real credentials, secrets, or external services.

### 7. Testing Strategy

- Use Vitest for domain utilities and metadata validation.
- Use React Testing Library for component behavior.
- Use Playwright Test to validate Stagecraft's user flows and Playwright compatibility.
- Playwright tests should verify that labs are automatable via user-facing locators, not implementation selectors.
- Verification must include linting, type checking, tests, Playwright tests, and build.

## Dependency Graph

```text
Project/tooling foundation
  ├── TypeScript strict config
  ├── Next.js app shell
  ├── Tailwind light/dark design system
  └── Test infrastructure
        │
        ├── Typed challenge content model
        │     ├── Challenge catalog
        │     ├── Challenge detail pages
        │     └── Progress state
        │
        ├── Shared UI components
        │     ├── Cards, badges, filters, panels
        │     └── Theme controls
        │
        └── Practice lab foundations
              ├── Lab routing and reset patterns
              ├── Deterministic fixtures/data builders
              ├── Mock API route handlers
              └── Individual labs
                    ├── Accessible Locators Lab
                    ├── Forms and Validation Lab
                    ├── Tables and Filtering Lab
                    ├── Async UI Lab
                    ├── Network/API Lab
                    └── Fake Auth/Session Lab
```

Implementation order should follow this dependency graph from foundation to individual labs.

## Implementation Phases

### Phase 1: Project Foundation

Goal: Initialize a TypeScript-only local Next.js app with quality gates and design foundations.

Major work:

- Initialize package/scripts/tooling.
- Configure TypeScript strict mode.
- Configure linting, formatting, unit/component testing, and Playwright testing.
- Set up Tailwind with light/dark theme tokens.
- Create base app layout, navigation shell, homepage, and theme toggle.

Verification checkpoint:

- `npm run lint`
- `npm run typecheck`
- `npm test -- --coverage`
- `npm run test:e2e`
- `npm run build`

### Phase 2: Challenge System

Goal: Deliver the challenge catalog, challenge detail pages, typed metadata, filters, search, and self-marked progress.

Major work:

- Define typed challenge domain model.
- Create initial challenge metadata mapped to Playwright documentation-backed topics.
- Build catalog UI with filters/search.
- Build challenge detail UI with instructions, objectives, acceptance criteria, constraints, and conceptual hints.
- Implement local progress state and reset.
- Add safeguards/tests that challenge copy does not expose complete solution scripts.

Verification checkpoint:

- Catalog can be searched and filtered.
- Challenge detail pages explain tasks clearly without answers.
- Progress persists across reload and can be reset.
- Tests pass for metadata validation, filtering, and progress behavior.

### Phase 3: Core MVP Practice Labs

Goal: Implement the six required MVP labs as deterministic, Playwright-compatible practice surfaces.

Major work:

1. Accessible Locators Lab
   - Practice roles, headings, links, buttons, alt text, labels, accessible names, and visible text.
2. Forms and Validation Lab
   - Practice labels, validation messages, checkbox/radio/select/input behavior, disabled/enabled states.
3. Tables and Filtering Lab
   - Practice search, sort, filter, pagination, empty results, and row-level actions.
4. Async UI Lab
   - Practice loading states, retryable assertions, delayed UI updates, and avoiding arbitrary sleeps.
5. Network/API Lab
   - Practice deterministic API-backed UI, request/response observation, and route mocking opportunities.
6. Fake Auth/Session Lab
   - Practice login-like flow, protected route behavior, redirects, logout, and storage-state concepts without real authentication.

Verification checkpoint:

- Each lab has a route from catalog/detail pages.
- Each lab is deterministic and resettable.
- Each lab can be exercised by Playwright using user-facing locators.
- No lab requires brittle CSS/XPath selectors.

### Phase 4: Expanded Playwright Topic Coverage

Goal: Add breadth from the local Playwright docs while keeping each lab understandable.

Candidate topics from `docs/guides/`:

- Dialogs
- Downloads
- Uploads
- Multiple pages/tabs
- Frames
- Browser contexts
- Emulation and viewport/device behavior
- Screenshots and visual comparison concepts
- Trace viewer/debugging concepts
- Retries, timeouts, and parallelism concepts
- Test fixtures and project configuration concepts
- Accessibility testing concepts
- Keyboard and mouse input
- Clock/time control concepts
- Events and navigation

Important constraint: add these as clear labs or challenge variants, not as hidden answers or overwhelming all-in-one pages.

Verification checkpoint:

- New topics are represented in the catalog with clear instructions.
- Each topic has deterministic practice behavior.
- Playwright verification tests cover at least one representative flow per added topic group.

### Phase 5: Polish, Accessibility, and Documentation

Goal: Prepare the MVP for local use by learners and future contributors.

Major work:

- Improve empty/loading/error states.
- Validate light and dark mode readability.
- Strengthen responsive layouts.
- Add README setup instructions and learner guidance.
- Add architecture decision records where needed.
- Review app copy to ensure it teaches tasks without revealing answers.
- Ensure no official Playwright docs are rendered/linked in the app.

Final verification checkpoint:

- `npm run verify`
- Manual local run through main flows.
- Playwright tests pass across configured browsers.
- No `.js` or `.jsx` files exist.
- No solution scripts are present in public UI copy.

## Risk and Mitigation Plan

| Risk | Impact | Mitigation |
|---|---:|---|
| Scope grows too large because “include everything” is broad | High | Deliver six MVP labs first, then add documentation-backed topics incrementally as separate labs/challenges. |
| Challenge instructions accidentally reveal answers | High | Keep instructions conceptual, test copy for disallowed solution patterns, review before adding new challenges. |
| Dark mode is bolted on late | Medium | Build design tokens and theme toggle in Phase 1. Test both themes throughout. |
| Playwright labs become flaky | High | Use deterministic data, explicit reset controls, web-first UI states, and avoid uncontrolled timers/randomness. |
| TypeScript-only rule conflicts with tool defaults | Medium | Prefer `.ts` configs where supported; document any unavoidable exception before using it. |
| Local docs are large and topic mapping becomes inconsistent | Medium | Create a curriculum/topic matrix from docs before expanding beyond required labs. |
| Too many labs make navigation confusing | Medium | Use filtering, tags, difficulty levels, and concise cards. |
| App tests become solution examples | Medium | Internal tests may validate behavior but must not be surfaced as learner-facing answers. |

## Parallelization Opportunities

Safe to parallelize after foundation:

- Independent practice labs once shared lab patterns are defined.
- Component tests for stable UI components.
- Challenge metadata writing and copy review.
- README/ADR documentation.

Must be sequential:

- Tooling and project foundation before feature work.
- Typed challenge model before catalog/detail implementation.
- Shared reset/progress patterns before many labs depend on them.
- Design tokens/theme system before broad UI polish.

Needs coordination:

- Any challenge topic that depends on shared mock API or fake session behavior.
- Any expansion of docs-derived curriculum categories.

## Proposed Review Gates

1. **Plan approval:** Confirm this architecture and phase order.
2. **Task breakdown approval:** After plan approval, create implementation tasks with acceptance criteria and file scopes.
3. **Foundation checkpoint review:** Verify tooling, app shell, dark mode, and test setup.
4. **Challenge system checkpoint review:** Verify catalog/detail/progress experience before building many labs.
5. **Core labs checkpoint review:** Verify the six MVP labs before expanding topic coverage.
6. **Final MVP review:** Run full verification and inspect local user experience.

## Open Questions

None currently. Awaiting human approval of this plan before creating the implementation task breakdown.
