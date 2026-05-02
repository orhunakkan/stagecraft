# ADR 0001: Playwright Curriculum Coverage

**Status:** Accepted  
**Date:** 2026-05-02  
**Deciders:** Stagecraft project

---

## Context

Stagecraft's local `docs/guides/` directory contains the full set of official Playwright
documentation files. The curriculum must be shaped by that documentation without rendering
or linking the docs directly inside the app.

This record maps every significant docs-backed topic to one of four coverage states:

| Symbol | Meaning |
|---|---|
| ✅ | Covered by an existing MVP lab |
| 🔶 | Partially covered — core concept is present, full depth is not |
| 📋 | Planned for Phase 4 expansion |
| ⛔ | Out-of-scope for MVP (advanced, environment-specific, or contributor-only) |

---

## Decision

The six Phase 3 MVP labs cover the highest-priority Playwright topics for learners who are
new to or deepening their knowledge of Playwright. Phase 4 expands coverage into browser
events, frames, emulation, and debugging/reporting concepts.

Topics rated ⛔ are deferred because they require real infrastructure (CI servers, Docker,
cloud grids), are Playwright contributor-level internals, or overlap significantly with an
existing covered topic at diminishing learner value.

---

## Topic Matrix

### Locators and selectors

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| Role, label, text, alt, title locators | `locators.md` | ✅ | Accessible Locators Lab |
| Chaining and filtering locators | `locators.md` | ✅ | Tables and Filtering Lab |
| Scoping locators to a region/row | `locators.md` | ✅ | Tables and Filtering Lab |
| ARIA snapshots | `aria-snapshots.md` | ⛔ | — |

### Assertions

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| Web-first assertions (`toBeVisible`, `toHaveText`, etc.) | `test-assertions.md` | ✅ | All labs |
| Auto-waiting behaviour | `actionability.md` | ✅ | Async UI Lab |
| Soft assertions | `test-assertions.md` | ⛔ | — |
| Snapshot / visual comparison | `test-snapshots.md` | 📋 | Debugging and Reporting (Phase 4) |

### Async UI and timing

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| Loading, success, error, retry states | `actionability.md` | ✅ | Async UI Lab |
| Avoiding fixed sleeps | `best-practices.md` | ✅ | Async UI Lab |
| Test retries and flaky test recovery | `test-retries.md` | 🔶 | Async UI Lab (concept only) |
| Clock / time control | `clock.md` | 📋 | Debugging and Reporting (Phase 4) |
| Timeouts | `test-timeouts.md` | 🔶 | Async UI Lab (concept only) |

### Forms and inputs

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| Text, email, password inputs | `input.md` | ✅ | Forms and Validation Lab |
| Select, checkbox, radio | `input.md` | ✅ | Forms and Validation Lab |
| Keyboard input and key presses | `input.md` | 📋 | Emulation and Input Lab (Phase 4) |
| Mouse actions and hover | `input.md` | 📋 | Emulation and Input Lab (Phase 4) |
| Drag and drop | `input.md` | 📋 | Emulation and Input Lab (Phase 4) |
| Touch events | `touch-events.md` | 📋 | Emulation and Input Lab (Phase 4) |
| File uploads | `input.md` | 📋 | Browser Events Lab (Phase 4) |

### Tables, filtering, lists

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| Row-scoped locators | `locators.md` | ✅ | Tables and Filtering Lab |
| Searching and filtering deterministic data | `best-practices.md` | ✅ | Tables and Filtering Lab |
| Pagination and list traversal | `locators.md` | ✅ | Tables and Filtering Lab |

### Network

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| Observing requests and responses | `network.md` | ✅ | Network/API Lab |
| `page.waitForResponse()` | `network.md` | ✅ | Network/API Lab |
| Route interception (`page.route()`) | `network.md` | ✅ | Network/API Lab |
| Mocking API responses | `network.md` | ✅ | Network/API Lab |
| API testing (`request` fixture) | `api-testing.md` | 🔶 | Network/API Lab (UI side only) |
| Service workers | `service-workers.md` | ⛔ | — |

### Auth and session state

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| `localStorage` / session state | `auth.md` | ✅ | Fake Auth Session Lab |
| `storageState` concept and usage | `auth.md` | ✅ | Fake Auth Session Lab |
| Protected route redirects | `auth.md` | ✅ | Fake Auth Session Lab |
| Sign-in / sign-out flow | `auth.md` | ✅ | Fake Auth Session Lab |
| OAuth / HTTP auth | `auth.md` | ⛔ | Requires external services |

### Browser events

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| Dialog handling (`alert`, `confirm`, `prompt`) | `dialogs.md` | 📋 | Browser Events Lab (Phase 4) |
| File downloads | `downloads.md` | 📋 | Browser Events Lab (Phase 4) |
| New tabs and pop-ups | `pages.md` | 📋 | Browser Events Lab (Phase 4) |
| Page navigation events | `events.md` | 📋 | Browser Events Lab (Phase 4) |

### Frames and contexts

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| `frameLocator()` and iframes | `frames.md` | 📋 | Frames and Contexts Lab (Phase 4) |
| Browser context isolation | `browser-contexts.md` | 📋 | Frames and Contexts Lab (Phase 4) |
| Multiple pages in one test | `pages.md` | 📋 | Browser Events Lab (Phase 4) |

### Emulation

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| Viewport and device emulation | `emulation.md` | 📋 | Emulation and Input Lab (Phase 4) |
| Dark mode / `prefers-color-scheme` | `emulation.md` | 📋 | Emulation and Input Lab (Phase 4) |
| Geolocation | `emulation.md` | ⛔ | — |
| Timezone and locale | `emulation.md` | ⛔ | — |

### Debugging and reporting

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| Trace viewer | `trace-viewer.md` | 📋 | Debugging and Reporting (Phase 4) |
| Screenshots and videos on failure | `screenshots.md` | 📋 | Debugging and Reporting (Phase 4) |
| Test annotations (`test.step`, `test.info`) | `test-annotations.md` | 📋 | Debugging and Reporting (Phase 4) |
| Retries and flakiness patterns | `test-retries.md` | 📋 | Debugging and Reporting (Phase 4) |
| Test reporters | `test-reporters.md` | ⛔ | Out of scope for app content |

### Test configuration and architecture

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| Test fixtures | `test-fixtures.md` | 🔶 | Via Network/API Lab (concept only) |
| Projects and multi-browser | `test-projects.md` | ⛔ | Learner's own project setup |
| Parallelism and sharding | `test-parallel.md` | ⛔ | Learner's own project setup |
| Global setup / teardown | `test-global-setup-teardown.md` | ⛔ | Learner's own project setup |
| Parameterised tests | `test-parameterize.md` | ⛔ | Out of scope for app content |
| `webServer` configuration | `test-webserver.md` | ⛔ | Learner's own project setup |
| TypeScript in tests | `test-typescript.md` | ⛔ | Learner's own project setup |
| UI mode | `test-ui-mode.md` | ⛔ | Learner's own project setup |
| Codegen | `codegen.md` | ⛔ | Learner's own project setup |

### Accessibility

| Topic | Docs file | Coverage | Lab |
|---|---|---|---|
| Accessible locators (role, label, name) | `locators.md` | ✅ | Accessible Locators Lab |
| Accessibility testing APIs | `accessibility-testing.md` | 🔶 | Accessible Locators Lab (concept only) |

---

## Phase 4 Lab Plan

Based on this matrix, the following four lab groups are planned for Phase 4:

| Lab group | Topics covered | Phase 4 task |
|---|---|---|
| **Browser Events Lab** | Dialogs, downloads, file uploads, multi-page/pop-up, navigation events | Task 21 |
| **Frames and Contexts Lab** | `frameLocator`, browser context isolation, multi-page patterns | Task 22 |
| **Emulation and Input Lab** | Viewport, device emulation, keyboard/mouse, dark mode emulation | Task 23 |
| **Debugging and Reporting** | Trace viewer, screenshots, videos, retries, annotations, clock | Task 24 |

---

## Coverage summary

| State | Count |
|---|---|
| ✅ Covered | 21 |
| 🔶 Partially covered | 6 |
| 📋 Planned (Phase 4) | 22 |
| ⛔ Out of scope | 18 |

---

## Consequences

- The curriculum matrix is **internal contributor documentation only**. It must not be
  rendered or linked inside the learner-facing application.
- Phase 4 implementation should track back to this matrix and update the coverage state
  for each topic as labs are added.
- Topics marked ⛔ may be re-evaluated in future phases if learner demand or scope changes.
- No official Playwright documentation is reproduced verbatim in the app. Challenge content
  references concepts informed by the docs but does not quote or link them.
