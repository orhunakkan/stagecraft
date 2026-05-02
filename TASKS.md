# Task Breakdown: Stagecraft

## Status
Draft pending human review and approval. No implementation should begin until this task breakdown is approved.

## Rules for All Tasks

- Do not create `.js` or `.jsx` files.
- Keep the app TypeScript-only for source, tests, and supported config files.
- Do not expose Playwright solution scripts or copy-pasteable locator answers in learner-facing UI.
- Use local Playwright docs under `docs/` internally when designing Playwright-related behavior.
- Keep each completed task in a working state.
- Run the listed verification before marking a task complete.

---

## Phase 1: Project Foundation

### Task 1: Initialize local Next.js TypeScript project foundation

**Status:** Completed.

**Description:** Create the package/tooling baseline for a local-only Next.js App Router project using TypeScript.

**Acceptance criteria:**
- [ ] `package.json` exists with required npm scripts from `SPEC.md`.
- [ ] Next.js app can start locally with `npm run dev`.
- [ ] No `.js` or `.jsx` files are introduced.

**Verification:**
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] Manual check: app starts on localhost.
- [ ] `find . -name "*.js" -o -name "*.jsx"` returns no project-created source/config files.

**Dependencies:** None

**Files likely touched:**
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `.gitignore`

**Estimated scope:** Medium

---

### Task 2: Configure strict TypeScript and path aliases

**Status:** Completed.

**Description:** Establish strict TypeScript settings and stable import aliases for the planned source structure.

**Acceptance criteria:**
- [ ] TypeScript strict mode is enabled.
- [ ] `@/*` path alias resolves to `src/*`.
- [ ] Type checking runs through `npm run typecheck`.

**Verification:**
- [ ] `npm run typecheck`

**Dependencies:** Task 1

**Files likely touched:**
- `tsconfig.json`
- `package.json`

**Estimated scope:** Small

---

### Task 3: Configure linting and formatting

**Status:** Completed.

**Description:** Add ESLint and Prettier configuration using TypeScript-compatible config where supported.

**Acceptance criteria:**
- [ ] `npm run lint` checks the project.
- [ ] `npm run format:check` checks formatting.
- [ ] Config does not require project-authored `.js` or `.jsx` files.

**Verification:**
- [ ] `npm run lint`
- [ ] `npm run format:check`

**Dependencies:** Task 1

**Files likely touched:**
- `eslint.config.ts`
- `.prettierrc.json`
- `.prettierignore`
- `package.json`

**Estimated scope:** Medium

---

### Task 4: Configure Vitest and React Testing Library

**Status:** Completed.

**Description:** Set up unit/component test infrastructure for TypeScript and React.

**Acceptance criteria:**
- [ ] `npm test -- --coverage` runs successfully.
- [ ] Test setup supports React Testing Library and DOM assertions.
- [ ] Coverage output is generated or reported.

**Verification:**
- [ ] `npm test -- --coverage`

**Dependencies:** Tasks 1, 2

**Files likely touched:**
- `vitest.config.ts`
- `src/test/setup.ts`
- `src/test/example.test.ts`
- `package.json`

**Estimated scope:** Medium

---

### Task 5: Configure Playwright Test for local app verification

**Status:** Completed.

**Description:** Add Playwright configuration that can run against the local Stagecraft app using a web server command.

**Acceptance criteria:**
- [ ] `npm run test:e2e` runs Playwright tests.
- [ ] `npm run test:e2e:ui` opens Playwright UI mode if supported.
- [ ] Playwright config uses TypeScript.
- [ ] Initial smoke test verifies the home page loads.

**Verification:**
- [ ] `npm run test:e2e`
- [ ] `npm run test:e2e:ui` manually opens UI mode.

**Dependencies:** Task 1

**Files likely touched:**
- `playwright.config.ts`
- `e2e/home.spec.ts`
- `package.json`

**Estimated scope:** Medium

---

### Task 6: Create Tailwind design foundation with light and dark themes

**Status:** Completed.

**Description:** Configure Tailwind and global styles for a colorful light/dark design system.

**Acceptance criteria:**
- [ ] Tailwind styles are available globally.
- [ ] Light and dark theme tokens exist.
- [ ] Base typography, background, focus, and card styles are readable in both themes.
- [ ] Dark mode is not deferred.

**Verification:**
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] Manual check: light and dark theme styles are visually distinct and readable.

**Dependencies:** Task 1

**Files likely touched:**
- `src/app/globals.css`
- `tailwind.config.ts` or approved Tailwind config alternative
- `postcss.config.ts` or approved config alternative
- `package.json`

**Estimated scope:** Medium

---

### Task 7: Build app shell, navigation, homepage, and theme toggle

**Status:** Completed.

**Description:** Create the core layout with accessible navigation, homepage content, and user-controllable theme switching.

**Acceptance criteria:**
- [ ] Homepage explains Stagecraft’s purpose.
- [ ] Navigation exposes challenges and practice areas.
- [ ] Theme toggle is keyboard-accessible and has a clear accessible name.
- [ ] Theme preference persists locally.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e`
- [ ] Manual check: toggle light/dark mode and reload.

**Dependencies:** Tasks 4, 5, 6

**Files likely touched:**
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/AppShell.tsx`
- `src/components/ThemeToggle.tsx`
- `src/features/theme/theme-storage.ts`

**Estimated scope:** Medium

---

## Checkpoint 1: Foundation Review

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Human review before Phase 2.

---

## Phase 2: Challenge System

### Task 8: Define challenge domain model and metadata validation

**Status:** Completed.

**Description:** Create typed models for challenges, labs, objectives, hints, tags, difficulty, and acceptance criteria.

**Acceptance criteria:**
- [ ] Challenge model supports all fields required by `SPEC.md`.
- [ ] Metadata validation catches missing IDs, duplicate IDs, invalid routes, and empty instructions.
- [ ] Public challenge content is separated from internal test/validation logic.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run typecheck`

**Dependencies:** Tasks 2, 4

**Files likely touched:**
- `src/features/challenges/challenge-types.ts`
- `src/features/challenges/challenge-validation.ts`
- `src/features/challenges/challenge-validation.test.ts`

**Estimated scope:** Medium

---

### Task 9: Create initial documentation-backed challenge metadata

**Status:** Completed.

**Description:** Add initial challenge records for the six MVP labs and broad Playwright topic tags informed by local docs.

**Acceptance criteria:**
- [ ] At least six challenge records exist for required MVP labs.
- [ ] Each challenge has difficulty, estimated time, concepts, scenario, objective, acceptance criteria, constraints, and non-code hints.
- [ ] No challenge includes complete Playwright scripts or copy-pasteable locator answers.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] Manual review of challenge copy.

**Dependencies:** Task 8

**Files likely touched:**
- `src/features/challenges/challenge-data.ts`
- `src/features/challenges/challenge-copy-guard.ts`
- `src/features/challenges/challenge-copy-guard.test.ts`

**Estimated scope:** Medium

---

### Task 10: Build challenge catalog UI with search and filters

**Status:** Completed.

**Description:** Implement catalog page with colorful challenge cards, difficulty filters, concept filters, and search.

**Acceptance criteria:**
- [ ] `/challenges` lists all challenges.
- [ ] Users can search by title, concept, and tags.
- [ ] Users can filter by difficulty and concept.
- [ ] Cards show title, difficulty, estimated time, concept, summary, and tags.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e`
- [ ] Manual check: filter and search combinations work in light/dark mode.

**Dependencies:** Tasks 7, 9

**Files likely touched:**
- `src/app/challenges/page.tsx`
- `src/features/challenges/ChallengeCatalog.tsx`
- `src/features/challenges/ChallengeCard.tsx`
- `src/features/challenges/challenge-filters.ts`
- `src/features/challenges/challenge-filters.test.ts`

**Estimated scope:** Medium

---

### Task 11: Build challenge detail pages

**Status:** Completed.

**Description:** Implement challenge detail route with scenario, learning objective, instructions, acceptance criteria, constraints, hints, and practice link.

**Acceptance criteria:**
- [x] `/challenges/[id]` renders valid challenge details.
- [x] Missing challenge IDs show a friendly not-found state.
- [x] Hints are conceptual and do not reveal solution scripts.
- [x] Practice route is visible and accessible.

**Verification:**
- [x] `npm test -- --coverage`
- [x] `npm run test:e2e`
- [x] Manual review: challenge detail copy does not reveal answers.

**Dependencies:** Task 10

**Files likely touched:**
- `src/app/challenges/[id]/page.tsx`
- `src/features/challenges/ChallengeDetail.tsx`
- `src/features/challenges/challenge-lookup.ts`
- `src/features/challenges/challenge-lookup.test.ts`

**Estimated scope:** Medium

---

### Task 12: Implement self-marked local progress

**Status:** Completed.

**Description:** Add local progress state so learners can mark challenges as not started, in progress, practiced, or completed.

**Acceptance criteria:**
- [x] Users can update progress from challenge detail pages.
- [x] Progress persists across reloads.
- [x] Users can reset all local progress.
- [x] UI clearly states progress is self-marked, not graded.

**Verification:**
- [x] `npm test -- --coverage`
- [x] `npm run test:e2e`
- [x] Manual check: mark progress, reload, reset.

**Dependencies:** Task 11

**Files likely touched:**
- `src/features/progress/progress-types.ts`
- `src/features/progress/progress-storage.ts`
- `src/features/progress/ProgressControls.tsx`
- `src/features/progress/progress-storage.test.ts`
- `e2e/progress.spec.ts`

**Estimated scope:** Medium

---

## Checkpoint 2: Challenge System Review

- [ ] Catalog search/filter works.
- [ ] Challenge detail pages are clear and answer-free.
- [ ] Progress persists and resets.
- [ ] Light and dark modes are usable.
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e`
- [ ] Human review before Phase 3.

---

## Phase 3: Core MVP Practice Labs

### Task 13: Create shared practice lab layout and reset pattern

**Status:** Completed.

**Description:** Create reusable lab page structure with objective summary, reset control, deterministic state setup, and navigation back to challenge details.

**Acceptance criteria:**
- [x] Practice lab pages share a consistent, accessible layout.
- [x] Reset control has a clear accessible name.
- [x] Reset behavior pattern is reusable by all labs.

**Verification:**
- [x] `npm test -- --coverage`
- [x] `npm run test:e2e`

**Dependencies:** Task 12

**Files likely touched:**
- `src/features/practice-labs/PracticeLabLayout.tsx`
- `src/features/practice-labs/lab-reset.ts`
- `src/features/practice-labs/lab-reset.test.ts`

**Estimated scope:** Small

---

### Task 14: Implement Accessible Locators Lab

**Description:** Build a lab for practicing roles, labels, headings, buttons, links, alt text, titles, and accessible names.

**Acceptance criteria:**
- [ ] Lab route is reachable from its challenge.
- [ ] Page includes diverse accessible targets for role, label, text, alt text, and title practice.
- [ ] E2E verification uses user-facing locators only.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e -- --grep "Accessible Locators"`

**Dependencies:** Task 13

**Files likely touched:**
- `src/app/practice/accessible-locators/page.tsx`
- `src/features/practice-labs/accessible-locators/AccessibleLocatorsLab.tsx`
- `e2e/accessible-locators.spec.ts`

**Estimated scope:** Medium

---

### Task 15: Implement Forms and Validation Lab

**Description:** Build a lab for practicing labels, form controls, validation messages, disabled/enabled states, and successful submission feedback.

**Acceptance criteria:**
- [ ] Lab includes text input, email input, select, checkbox, radio group, and submit behavior.
- [ ] Validation messages are accessible and deterministic.
- [ ] Submit button state changes are observable and testable.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e -- --grep "Forms and Validation"`

**Dependencies:** Task 13

**Files likely touched:**
- `src/app/practice/forms-validation/page.tsx`
- `src/features/practice-labs/forms-validation/FormsValidationLab.tsx`
- `src/features/practice-labs/forms-validation/form-rules.ts`
- `src/features/practice-labs/forms-validation/form-rules.test.ts`
- `e2e/forms-validation.spec.ts`

**Estimated scope:** Medium

---

### Task 16: Implement Tables and Filtering Lab

**Description:** Build a lab for search, sort, filter, pagination, empty results, and row-level actions.

**Acceptance criteria:**
- [ ] Users can search, filter, sort, and paginate deterministic table data.
- [ ] Empty state appears when no rows match.
- [ ] Row actions are accessible and scoped to the chosen row.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e -- --grep "Tables and Filtering"`

**Dependencies:** Task 13

**Files likely touched:**
- `src/app/practice/tables-filtering/page.tsx`
- `src/features/practice-labs/tables-filtering/TablesFilteringLab.tsx`
- `src/features/practice-labs/tables-filtering/table-data.ts`
- `src/features/practice-labs/tables-filtering/table-rules.test.ts`
- `e2e/tables-filtering.spec.ts`

**Estimated scope:** Medium

---

### Task 17: Implement Async UI Lab

**Description:** Build a lab for loading states, delayed UI updates, retry behavior, and web-first assertion practice.

**Acceptance criteria:**
- [ ] Lab has deterministic delayed states with visible loading, success, retry, and error states.
- [ ] No arbitrary random timing is required.
- [ ] E2E tests use Playwright waiting/assertion patterns, not fixed sleeps.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e -- --grep "Async UI"`

**Dependencies:** Task 13

**Files likely touched:**
- `src/app/practice/async-ui/page.tsx`
- `src/features/practice-labs/async-ui/AsyncUiLab.tsx`
- `src/features/practice-labs/async-ui/async-state.ts`
- `src/features/practice-labs/async-ui/async-state.test.ts`
- `e2e/async-ui.spec.ts`

**Estimated scope:** Medium

---

### Task 18: Implement Network/API Lab

**Description:** Build a deterministic API-backed lab suitable for request/response observation and route mocking practice.

**Acceptance criteria:**
- [ ] Lab fetches data from local route handlers.
- [ ] API responses are deterministic and resettable.
- [ ] UI exposes loading, success, error, and refresh behavior.
- [ ] E2E test verifies network-backed behavior without external services.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e -- --grep "Network API"`

**Dependencies:** Task 13

**Files likely touched:**
- `src/app/practice/network-api/page.tsx`
- `src/app/api/practice/network/items/route.ts`
- `src/features/practice-labs/network-api/NetworkApiLab.tsx`
- `src/features/practice-labs/network-api/network-fixtures.ts`
- `e2e/network-api.spec.ts`

**Estimated scope:** Medium

---

### Task 19: Implement Fake Auth/Session Lab

**Description:** Build a fake login/session workflow for practicing redirects, protected pages, logout, and storage-state concepts without real credentials.

**Acceptance criteria:**
- [ ] Login-like page accepts documented fake learner input without real secrets.
- [ ] Protected practice page redirects when fake session is absent.
- [ ] Logout clears fake session state.
- [ ] E2E tests verify repeatable session behavior.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e -- --grep "Fake Auth"`

**Dependencies:** Task 13

**Files likely touched:**
- `src/app/practice/fake-auth/page.tsx`
- `src/app/practice/fake-auth/protected/page.tsx`
- `src/features/practice-labs/fake-auth/FakeAuthLab.tsx`
- `src/features/practice-labs/fake-auth/fake-session.ts`
- `e2e/fake-auth.spec.ts`

**Estimated scope:** Medium

---

## Checkpoint 3: Core MVP Labs Review

- [ ] Six required MVP labs are implemented.
- [ ] Each lab is deterministic and resettable.
- [ ] Each lab is reachable from a challenge.
- [ ] Playwright tests use user-facing locators wherever possible.
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e`
- [ ] `npm run build`
- [ ] Human review before Phase 4.

---

## Phase 4: Expanded Playwright Topic Coverage

### Task 20: Create documentation-backed curriculum matrix

**Description:** Build an internal topic matrix mapping local Playwright docs to existing and planned challenge coverage.

**Acceptance criteria:**
- [ ] Matrix lists major docs-backed Playwright topics.
- [ ] Each topic is marked as covered, partially covered, planned, or out-of-scope for MVP.
- [ ] Matrix remains internal contributor documentation, not app-rendered official docs.

**Verification:**
- [ ] Manual review against `docs/guides/` file list.

**Dependencies:** Checkpoint 3

**Files likely touched:**
- `docs/adr/0001-playwright-curriculum-coverage.md`

**Estimated scope:** Small

---

### Task 21: Add browser events lab group

**Description:** Add practice coverage for dialogs, downloads/uploads, popups/tabs, and navigation events.

**Acceptance criteria:**
- [ ] Catalog includes event-focused challenge entries.
- [ ] Practice surface includes deterministic dialog, upload/download, popup, and navigation behaviors where feasible locally.
- [ ] E2E tests verify representative event behaviors.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e -- --grep "Browser Events"`

**Dependencies:** Task 20

**Files likely touched:**
- `src/features/challenges/challenge-data.ts`
- `src/app/practice/browser-events/page.tsx`
- `src/features/practice-labs/browser-events/BrowserEventsLab.tsx`
- `e2e/browser-events.spec.ts`

**Estimated scope:** Medium

---

### Task 22: Add frames and multi-context lab group

**Description:** Add practice coverage for iframes/frame locators and browser-context-like isolated state concepts.

**Acceptance criteria:**
- [ ] Catalog includes frames/context challenge entries.
- [ ] Lab includes deterministic iframe content suitable for frame locator practice.
- [ ] Lab demonstrates isolated state concepts without real auth.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e -- --grep "Frames and Contexts"`

**Dependencies:** Task 20

**Files likely touched:**
- `src/features/challenges/challenge-data.ts`
- `src/app/practice/frames-contexts/page.tsx`
- `src/features/practice-labs/frames-contexts/FramesContextsLab.tsx`
- `e2e/frames-contexts.spec.ts`

**Estimated scope:** Medium

---

### Task 23: Add emulation and input lab group

**Description:** Add practice coverage for viewport-aware behavior, keyboard input, mouse interactions, touch-like UI, and device/emulation concepts.

**Acceptance criteria:**
- [ ] Catalog includes emulation/input challenge entries.
- [ ] Lab includes responsive behavior and deterministic keyboard/mouse interaction targets.
- [ ] Dark mode and responsive behavior remain readable.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e -- --grep "Emulation and Input"`

**Dependencies:** Task 20

**Files likely touched:**
- `src/features/challenges/challenge-data.ts`
- `src/app/practice/emulation-input/page.tsx`
- `src/features/practice-labs/emulation-input/EmulationInputLab.tsx`
- `e2e/emulation-input.spec.ts`

**Estimated scope:** Medium

---

### Task 24: Add debugging and reporting concept pages

**Description:** Add challenge content for trace viewer, screenshots, videos, retries, timeouts, annotations, and reporting concepts without exposing answer scripts.

**Acceptance criteria:**
- [ ] Catalog includes debugging/reporting challenge entries.
- [ ] Challenge details explain what users should practice in their own Playwright project.
- [ ] No complete scripts are shown.

**Verification:**
- [ ] `npm test -- --coverage`
- [ ] Manual review of challenge copy.

**Dependencies:** Task 20

**Files likely touched:**
- `src/features/challenges/challenge-data.ts`
- `src/features/challenges/challenge-copy-guard.test.ts`

**Estimated scope:** Small

---

## Checkpoint 4: Expanded Coverage Review

- [ ] Curriculum matrix exists.
- [ ] Added topics are discoverable in catalog.
- [ ] Added labs/challenges remain clear and answer-free.
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test -- --coverage`
- [ ] `npm run test:e2e`
- [ ] Human review before Phase 5.

---

## Phase 5: Polish and Release Readiness

### Task 25: Strengthen accessibility and theme QA

**Description:** Review and improve accessibility, keyboard navigation, focus states, semantic structure, and light/dark readability.

**Acceptance criteria:**
- [ ] Main navigation and all challenge/lab flows are keyboard usable.
- [ ] Focus states are visible in light and dark modes.
- [ ] Important statuses do not rely on color alone.
- [ ] E2E coverage includes dark mode smoke checks.

**Verification:**
- [ ] `npm run test:e2e`
- [ ] Manual keyboard and theme review.

**Dependencies:** Checkpoint 4

**Files likely touched:**
- `src/app/globals.css`
- `src/components/AppShell.tsx`
- `src/components/ThemeToggle.tsx`
- `e2e/theme-accessibility.spec.ts`

**Estimated scope:** Medium

---

### Task 26: Add README learner and contributor guidance

**Description:** Document local setup, commands, how learners should use their separate Playwright project, and contributor rules.

**Acceptance criteria:**
- [ ] README explains Stagecraft’s purpose.
- [ ] README lists local setup and verification commands.
- [ ] README clarifies users write tests in their own separate Playwright project.
- [ ] README states that the app does not provide solution scripts.

**Verification:**
- [ ] Manual review of README.

**Dependencies:** Checkpoint 4

**Files likely touched:**
- `README.md`

**Estimated scope:** Small

---

### Task 27: Add final verification script and repository hygiene checks

**Description:** Ensure `npm run verify` runs all required quality gates and add checks for TypeScript-only and answer-free constraints where practical.

**Acceptance criteria:**
- [ ] `npm run verify` runs lint, typecheck, unit/component tests, Playwright tests, and build.
- [ ] Verification includes a practical guard against `.js`/`.jsx` files.
- [ ] Verification includes challenge copy guard tests.

**Verification:**
- [ ] `npm run verify`

**Dependencies:** Tasks 25, 26

**Files likely touched:**
- `package.json`
- `src/features/challenges/challenge-copy-guard.test.ts`
- `tests/repository-hygiene.test.ts`

**Estimated scope:** Small

---

## Final Checkpoint: MVP Review

- [ ] `npm run verify`
- [ ] Manual local run through homepage, catalog, challenge details, progress, and all labs.
- [ ] Light and dark modes are both usable.
- [ ] No `.js` or `.jsx` files exist in project-authored source/config/test files.
- [ ] No learner-facing page exposes solution scripts or direct answers.
- [ ] Official Playwright docs are used internally only, not rendered or linked in the app.
- [ ] Human review confirms MVP readiness.
