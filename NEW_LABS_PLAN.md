# Add 5 New Playwright Labs to Stagecraft

## Context

Stagecraft is a Playwright practice playground with **20 labs**, each a self-contained UI page
users write Playwright tests against. The goal is to add **5 more meaningful labs**, prioritizing
Playwright features/APIs **not yet exercised by any existing lab**, while following the established
frontend + backend + e2e conventions exactly.

After auditing all 20 labs, the following high-value Playwright capabilities have **zero coverage**.
The confirmed set of 5:

| #   | New Lab                   | Slug                      | Headline Playwright APIs                                                                                           | Backend?                    |
| --- | ------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| 1   | Geolocation & Permissions | `geolocation-permissions` | `context.grantPermissions`, `context.setGeolocation`, `geolocation`/`clipboard-read`/`clipboard-write` permissions | No                          |
| 2   | Locator Handlers          | `locator-handlers`        | `page.addLocatorHandler`, `page.removeLocatorHandler`                                                              | No                          |
| 3   | Media & Locale Emulation  | `media-locale`            | `page.emulateMedia` (colorScheme, reducedMotion, print, forcedColors), `locale` + `timezoneId` context options     | No                          |
| 4   | Scroll & Lazy Loading     | `scroll-lazy-loading`     | `locator.scrollIntoViewIfNeeded`, `expect(locator).toBeInViewport`, infinite scroll                                | Yes (paginated `/api/feed`) |
| 5   | Accessibility Scanning    | `accessibility-scanning`  | `@axe-core/playwright` (`AxeBuilder`), `.analyze()`, `.include()`/`.withTags()`                                    | No                          |

Each lab keeps a clear, distinct value proposition (no meaningful overlap with the a11y-locator,
aria-snapshot, emulation-input, or async-ui labs).

## Conventions every new lab must follow (verified from existing code)

For **each** lab, four pieces are required (plus a fifth for the backend lab):

1. **Registry entry** in [client/src/labs/index.ts](client/src/labs/index.ts) — append a `Lab` object with
   `slug`, `title`, `topic`, `apis[]`, `status: 'ready'`, `requiresBackend`, `goal`, `guidance[]` (5–7
   exploratory hints, no spoilers), `docsUrl`.
2. **Page component** at `client/src/pages/practice/<PascalCase>.tsx` — exports a named function
   matching the file, looks up its lab via `labs.find((l) => l.slug === '<slug>')!`, renders
   `<LabHeader lab={lab} />` then `<section aria-labelledby>` blocks. Use semantic HTML + Tailwind
   tokens (`text-content`, `text-muted`, `bg-surface`, `border-edge`, `bg-canvas`). Prefer role/label
   locators; add `data-testid` only where semantics are insufficient (matching `EmulationInput.tsx`).
3. **Route registration** in [client/src/App.tsx](client/src/App.tsx) — add one entry to
   `labComponentMap` keyed by slug via `lazyNamed(() => import('./pages/practice/<PascalCase>'), '<PascalCase>')`.
   Routes are auto-derived (`/practice/<slug>`); no other change needed.
4. **E2E spec** at `e2e/labs/<slug>.spec.ts` — `test.describe` + `beforeEach` `page.goto('/practice/<slug>')`,
   following the assertion style in [e2e/labs/emulation-input.spec.ts](e2e/labs/emulation-input.spec.ts).

Backend lab (Scroll & Lazy Loading) additionally needs:

- **Route file** `server/src/routes/feed.ts` (Express `Router`, in-memory data, mirrors
  [server/src/routes/products.ts](server/src/routes/products.ts)).
- **Registration** in [server/src/app.ts](server/src/app.ts) at line ~133: `app.use('/api/feed', feedRouter);` + import.
- **OpenAPI doc** entry in `server/src/openapi.ts` (path + `FeedItem` schema), matching existing products docs.

---

## Lab-by-lab design

### 1. Geolocation & Permissions (`geolocation-permissions`, frontend-only)

- **UI:** A "Find nearby cafés" panel with a "Use my location" button that calls
  `navigator.geolocation.getCurrentPosition`. On success, renders the resolved lat/long and a
  filtered list of mock cafés "near" those coords; on permission denial, shows an error state
  (`role="alert"`). Second panel: a "Copy share link" button using `navigator.clipboard.writeText`
  plus a "Paste" box reading `navigator.clipboard.readText`, each surfacing success/blocked states.
- **Teaches:** Granting `geolocation`/`clipboard-read`/`clipboard-write` via `context.grantPermissions`,
  injecting coords via `context.setGeolocation`, and asserting the permission-denied path (no grant).
- **Files:** `GeolocationPermissions.tsx`, registry entry, App.tsx map, `geolocation-permissions.spec.ts`.

### 2. Locator Handlers (`locator-handlers`, frontend-only)

- **UI:** A multi-step "checkout" flow (3 steps with Next buttons) that **randomly** injects
  interrupting overlays mid-flow: a cookie-consent banner, a newsletter modal, and a "session
  survey" dialog — each with a dismiss button and `role="dialog"`/`role="alertdialog"`. A toggle lets
  the user force overlays on every step for deterministic manual exploration.
- **Teaches:** `page.addLocatorHandler(locator, handler)` to auto-dismiss the interrupters so the
  main flow proceeds, plus `{ noWaitAfter }`/`times` options and `removeLocatorHandler`.
- **Files:** `LocatorHandlers.tsx`, registry entry, App.tsx map, `locator-handlers.spec.ts`.

### 3. Media & Locale Emulation (`media-locale`, frontend-only)

- **UI:** Three panels driven purely by CSS media queries / JS locale APIs (not the app's existing
  class-based dark toggle): (a) a card styled via `@media (prefers-color-scheme: dark)` showing a
  "Light/Dark" label using `window.matchMedia`; (b) an animation block that reads
  `prefers-reduced-motion` and shows "Motion on/reduced"; (c) a panel rendering a date + currency via
  `Intl.DateTimeFormat`/`Intl.NumberFormat` (no explicit locale) so output reflects the emulated
  `locale` + `timezoneId`.
- **Teaches:** `page.emulateMedia({ colorScheme, reducedMotion, forcedColors, media: 'print' })` and
  the `locale`/`timezoneId` `newContext` options; asserting UI reacts to each.
- **Files:** `MediaLocale.tsx`, registry entry, App.tsx map, `media-locale.spec.ts`.

### 4. Scroll & Lazy Loading (`scroll-lazy-loading`, backend)

- **UI:** An infinite-scroll activity feed. Initial page loads page 1 from `GET /api/feed?page=1&pageSize=8`;
  an `IntersectionObserver` sentinel at the list bottom fetches the next page as it scrolls into view,
  appending items, until `hasMore` is false (then a "You're all caught up" end marker). A "Jump to
  item #N" input scrolls a target row into view.
- **Backend:** `server/src/routes/feed.ts` serves a static array of ~40 `FeedItem`s
  (`{ id, title, body, createdAt }`) sliced by `page`/`pageSize` query params, returning
  `{ items, page, pageSize, total, hasMore }`. Register in `app.ts`; document in `openapi.ts`.
- **Teaches:** `locator.scrollIntoViewIfNeeded`, the `toBeInViewport` assertion, auto-waiting on
  lazily-appended content, and `page.route` stubbing of the paginated endpoint.
- **Files:** `ScrollLazyLoading.tsx`, registry entry (`requiresBackend: true`), App.tsx map,
  `feed.ts` + app.ts + openapi.ts, `scroll-lazy-loading.spec.ts`.

### 5. Accessibility Scanning (`accessibility-scanning`, frontend-only)

- **UI:** A "settings form" panel that contains **seeded, fixable a11y violations** (e.g. an input
  with no associated label, a low-contrast button, an image missing alt text) alongside a correctly
  built control group, plus a toggle that swaps the broken widgets for accessible versions so a scan
  can flip from "violations found" to "clean".
- **Teaches:** `new AxeBuilder({ page }).analyze()`, asserting `results.violations` length, scoping a
  scan with `.include(selector)`, and filtering by WCAG tags with `.withTags(...)`. `@axe-core/playwright`
  is already a devDependency.
- **Files:** `AccessibilityScanning.tsx`, registry entry, App.tsx map, `accessibility-scanning.spec.ts`.

---

## Critical files to create / modify

**Create (frontend pages):**

- `client/src/pages/practice/GeolocationPermissions.tsx`
- `client/src/pages/practice/LocatorHandlers.tsx`
- `client/src/pages/practice/MediaLocale.tsx`
- `client/src/pages/practice/ScrollLazyLoading.tsx`
- `client/src/pages/practice/AccessibilityScanning.tsx`

**Create (backend + e2e):**

- `server/src/routes/feed.ts`
- `e2e/labs/geolocation-permissions.spec.ts`
- `e2e/labs/locator-handlers.spec.ts`
- `e2e/labs/media-locale.spec.ts`
- `e2e/labs/scroll-lazy-loading.spec.ts`
- `e2e/labs/accessibility-scanning.spec.ts`

**Modify:**

- `client/src/labs/index.ts` — append 5 `Lab` entries.
- `client/src/App.tsx` — add 5 entries to `labComponentMap`.
- `server/src/app.ts` — import + `app.use('/api/feed', feedRouter)`.
- `server/src/openapi.ts` — `/api/feed` path + `FeedItem` schema.

No changes needed to `Home.tsx`/`LabCard.tsx` (they render the registry automatically), bumping the
home grid to 25 labs.

## Verification

1. `npm run dev` — confirm all 5 new cards appear on the home grid and each `/practice/<slug>` route
   loads with its `LabHeader` (goal/guidance/docs).
2. Manually exercise each lab in the browser (golden path + the failure/blocked path where relevant —
   e.g. geolocation denied, axe toggle clean vs. violations, feed reaches "all caught up").
3. `npm run lint` and `npm run typecheck` — must pass.
4. `npm run test:e2e` — all 25 lab specs green (server auto-starts via `playwright.config.ts`
   webServer; the feed lab needs the backend up, which the config handles).
5. For the backend lab, hit `GET /api/feed?page=1&pageSize=8` and confirm `hasMore` paginates and
   `/api-docs` shows the new endpoint.
