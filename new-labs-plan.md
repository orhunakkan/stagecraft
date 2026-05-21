# Add 5 New Playwright Learning Labs

## Context

Stagecraft is a React + Express monorepo containing **25 "labs"**, each a self-contained
practice page that teaches one aspect of the Playwright testing tool. The goal is to add
**5 more meaningful labs** that follow the established frontend/backend pattern and cover
Playwright features/APIs not yet demonstrated by the existing 25.

After auditing the existing labs (in `client/src/labs/index.ts`), the following Playwright
capabilities are **already covered**: accessible locators, forms, tables, async/`expect.poll`,
network `route`, auth/`storageState`, dialogs/uploads/downloads, frames, viewport/keyboard/mouse
emulation, tracing/reporting, WebSocket interception, ARIA snapshots, `page.clock`, API request
context, visual regression, drag & drop, HAR, multi-tab/popups, service workers/offline,
geolocation/permissions (incl. **clipboard** — already in `GeolocationPermissions.tsx`),
`addLocatorHandler`, media/locale emulation, infinite scroll/IntersectionObserver, and axe-core
a11y scanning.

The 5 new labs below each target a **genuine gap**.

## Proposed 5 Labs

1. **Shadow DOM & Web Components** (`shadow-dom`, frontend-only)
   - Teaches that Playwright locators automatically pierce **open** shadow roots, while CSS `>>>`
     and manual traversal are needed for nested/declarative cases. Build native custom elements
     (`customElements.define`) with attached shadow roots: a rating widget, a labelled input.
   - APIs: `getByRole`, `locator`, `getByText` (piercing), `locator.evaluate`
   - Docs: https://playwright.dev/docs/locators#locate-in-shadow-dom

2. **Touch & Mobile Gestures** (`touch-gestures`, frontend-only)
   - Distinct from the existing _Emulation & Input_ lab (keyboard/mouse/viewport). Covers
     touch-only interactions: `page.tap()`, `hasTouch`/device descriptors, swipe-to-dismiss,
     and touch-driven carousels using `touchscreen` and pointer events.
   - APIs: `page.tap`, `locator.tap`, `page.touchscreen`, `hasTouch`, `devices`
   - Docs: https://playwright.dev/docs/api/class-touchscreen

3. **Init Scripts & Seeding** (`init-scripts`, frontend-only)
   - Teaches `page.addInitScript()` / `context.addInitScript()` to run code **before** page load:
     stubbing `Math.random` and `Date.now` for determinism, seeding `localStorage` to skip a
     first-run onboarding modal, and injecting a feature-flag object. The page reads
     `window.__FLAGS__`, a random "lucky number", and a localStorage onboarding flag.
   - APIs: `page.addInitScript`, `context.addInitScript`
   - Docs: https://playwright.dev/docs/api/class-page#page-add-init-script

4. **Server-Sent Events (SSE)** (`server-sent-events`, **requires backend**)
   - Distinct from the WebSocket lab — one-way streaming via the `EventSource` API. A backend
     endpoint streams `text/event-stream` build/deploy status events; the UI renders a live log.
     Teaches asserting on progressively-appended DOM and intercepting/stubbing the stream with
     `page.route()`.
   - APIs: `page.route`, `page.waitForResponse`, `expect.poll`, `toContainText`
   - Docs: https://playwright.dev/docs/network (+ EventSource)

5. **Soft Assertions & Test Steps** (`soft-assertions`, frontend-only)
   - A test-authoring gap. A "profile dashboard" with several independently-verifiable widgets
     that demonstrates `expect.soft` (collect multiple failures), `expect.poll` /
     `expect(...).toPass()` (retry blocks), and `test.step` (readable trace grouping) plus
     test annotations/tags.
   - APIs: `expect.soft`, `expect.poll`, `expect.toPass`, `test.step`
   - Docs: https://playwright.dev/docs/test-assertions#soft-assertions

## Anatomy of a Lab (what to create per lab)

Confirmed by tracing existing labs end-to-end:

**Every lab (frontend):**

- Add a `Lab` object to the `labs` array in `client/src/labs/index.ts`
  (`slug`, `title`, `topic`, `apis`, `status: 'ready'`, `requiresBackend`, `goal`, `guidance[]`,
  `docsUrl`).
- Create `client/src/pages/practice/<PascalCase>.tsx` — exports a named function component that
  renders `<LabHeader lab={lab} />` (where `const lab = labs.find(l => l.slug === '<slug>')!`)
  followed by the interactive UI. Match the Tailwind/`role`/`aria-label` conventions in
  `GeolocationPermissions.tsx`.
- Register the component in `labComponentMap` in `client/src/App.tsx` via
  `lazyNamed(() => import('./pages/practice/<PascalCase>'), '<PascalCase>')`. Routes auto-derive
  to `/practice/<slug>`. (Home page and nav auto-list from the registry — no edit needed.)
- Add an E2E spec `e2e/labs/<slug>.spec.ts` following the existing
  `test.describe(...) / beforeEach(goto)` pattern.
- (Optional) add a unit test under `client/tests/labs/` as some labs do.

**Backend lab only (SSE — lab #4):**

- Create `server/src/routes/<name>.ts` exporting an Express `Router` (model on
  `server/src/routes/feed.ts` / `notes.ts`). For SSE, set `Content-Type: text/event-stream`,
  write `data:` frames on an interval, and clean up on `req.on('close')`.
- Register it in `server/src/app.ts`: `import` + `app.use('/api/<path>', ...)` (after line 135).
  Note the CSP `connect-src 'self'` already permits same-origin SSE.
- Add the endpoint to `server/src/openapi.ts` to match the existing documented routes (verify the
  file's structure during implementation).
- Use the shared client HTTP helpers in `client/src/lib/api.ts` where applicable.

## Critical Files

- `client/src/labs/index.ts` — registry (5 new entries)
- `client/src/App.tsx` — 5 new `labComponentMap` entries
- `client/src/pages/practice/{ShadowDom,TouchGestures,InitScripts,ServerSentEvents,SoftAssertions}.tsx` — new
- `e2e/labs/{shadow-dom,touch-gestures,init-scripts,server-sent-events,soft-assertions}.spec.ts` — new
- `server/src/routes/sse.ts` + `server/src/app.ts` + `server/src/openapi.ts` — SSE backend only

## Build Order (incremental — one lab at a time)

For each lab: registry entry → component → route registration → run dev & eyeball → E2E spec →
lint/format. Land each lab as its own commit. Recommended order (simplest first):
Shadow DOM → Init Scripts → Soft Assertions → Touch Gestures → SSE (backend last).

## Verification

- `npm run dev` (root) — confirm each new card appears on Home and `/practice/<slug>` renders.
- Manually exercise each lab's interactions in the browser (and via Playwright MCP).
- `npm run test` (client/server unit) + `npx playwright test e2e/labs/<slug>.spec.ts` for the
  new specs.
- `npm run lint` and `npm run format` (Husky/lint-staged will enforce on commit).
- Confirm the registry test `client/tests/labs/registry.test.ts` still passes with 30 labs.
