# Spec: Stagecraft

## Objective

Stagecraft is a web application that provides hands-on Playwright practice labs for developers who already know JavaScript/TypeScript and want to master the Playwright testing framework. Each lab presents a realistic, interactive browser UI that users test against by writing their own Playwright tests in a separate project. The app teaches by letting you practice, not by giving you finished answers.

**Target user:** Mid-level frontend/fullstack developers learning Playwright automation.

**Success looks like:**

- A developer can navigate to any of the 36 lab routes and interact with a realistic UI
- Each lab clearly explains its topic, the Playwright APIs involved, and what the user is expected to test
- Labs that require API, WebSocket, or auth scenarios have a working Express backend supporting them
- All 36 labs are production-ready and covered by focused regression tests

**User stories:**

- As a learner, I can browse a home page listing all available labs with their topics
- As a learner, I can navigate to a lab route (`/practice/<slug>`) and see a topic description and interactive UI
- As a learner, I can interact with the lab UI in my browser while writing Playwright tests in a separate project
- As a learner, I receive clear hints about which Playwright APIs apply to each lab
- As a developer, any future incomplete lab can show a "Coming Soon" placeholder so routing never breaks

---

## Tech Stack

| Layer          | Technology                     | Version  |
| -------------- | ------------------------------ | -------- |
| Frontend       | React + TypeScript             | React 19 |
| Frontend Build | Vite                           | ^8       |
| Backend        | Express.js + TypeScript        | ^5       |
| Styling        | Tailwind CSS                   | ^4       |
| Unit Tests     | Vitest + React Testing Library | ^4       |
| E2E Tests      | Playwright                     | ^1.60    |
| Package Mgr    | npm workspaces (monorepo)      | npm 10+  |
| Runtime        | Node.js                        | 24.x     |

---

## Commands

Run all commands from the **repository root** unless otherwise noted.

```bash
# Install all workspace dependencies
npm install

# Start both client (Vite dev) and server (tsx watch) concurrently
npm run dev

# Start only the frontend (port 5173)
npm run dev:client

# Start only the backend (port 3001)
npm run dev:server

# Build both client and server for production
npm run build

# Run Vitest unit tests (watch mode)
npm run test

# Run Vitest unit tests once (CI mode)
npm run test:run

# Run Playwright E2E tests
npm run test:e2e

# Run Playwright E2E tests with UI
npm run test:e2e:ui

# Lint all workspaces
npm run lint

# Type-check all workspaces
npm run typecheck
```

---

## Project Structure

```
stagecraft/
├── package.json              # Root — workspaces, shared dev scripts
├── tsconfig.base.json        # Shared TypeScript config
├── playwright.config.ts      # Playwright config (baseURL: http://localhost:5173)
├── SPEC.md                   # This file
├── README.md
│
├── client/                   # Vite + React frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx          # App entry point
│   │   ├── App.tsx           # Router root
│   │   ├── components/       # Shared UI components (Button, Badge, etc.)
│   │   ├── layouts/          # Page shell / nav layout
│   │   ├── pages/
│   │   │   ├── Home.tsx      # Lab catalog / index page
│   │   │   └── practice/     # One file per lab, e.g. AccessibleLocators.tsx
│   │   ├── labs/             # Lab metadata registry (slugs, titles, status)
│   │   └── lib/              # Utility functions, API client
│   └── tests/                # Vitest unit tests (mirrors src/)
│
├── server/                   # Express backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts          # Express app entry (listen)
│   │   ├── app.ts            # Express app setup (routes, middleware)
│   │   ├── routes/           # Route files per lab domain
│   │   │   ├── auth.ts       # /api/auth/* (fake-auth lab)
│   │   │   ├── network.ts    # /api/items/* (network-api lab)
│   │   │   ├── bookCatalog.ts # /api/book-catalog/* (book-catalog lab)
│   │   │   └── ...
│   │   └── lib/              # Shared server utilities
│   │       ├── db.ts               # Azure SQL connection pool (book-catalog lab)
│   │       └── bookCatalogStore.ts # BookCatalogStore interface + SQL/in-memory implementations
│   └── tests/                # Vitest unit tests for server logic
│
└── e2e/                      # Playwright E2E tests
    ├── home.spec.ts           # Lab catalog renders correctly
    └── labs/                  # One spec per fully implemented lab
        ├── accessible-locators.spec.ts
        └── ...
```

---

## Lab Registry

All 36 labs are registered in `client/src/labs/index.ts`. Each entry carries:

```ts
export interface Lab {
  slug: string; // URL path segment, e.g. "accessible-locators"
  title: string; // Display title
  topic: string; // One-line topic summary
  apis: string[]; // Key Playwright APIs covered
  status: 'ready' | 'coming-soon';
  requiresBackend: boolean;
  goal?: string; // Learner-facing outcome
  guidance?: string[]; // Hints shown in the lab header
  docsUrl?: string; // Relevant Playwright docs
}
```

Labs that require a backend (`requiresBackend: true`): `network-api`, `fake-auth`, `websocket-interception`, `har-recording`, `api-request-context`, `storage-state`, `scroll-lazy-loading`, `server-sent-events`, `book-catalog`.

**Feed API (scroll-lazy-loading lab):** `GET /api/feed` serves deterministic in-memory feed items with `page`, `pageSize`, `total`, and `hasMore` metadata. It supports infinite-scroll practice without external services or persistent storage.

**Authentication (fake-auth lab):** `express-session` with a signed cookie (server-side session). The session cookie is intentionally capturable by Playwright's `storageState`, making it the natural predecessor to the `storage-state` lab.

**WebSocket (websocket-interception lab):** The `ws` library upgrades connections from the same Express HTTP server on the same port (`server.on('upgrade', wsHandler)`). Single port, no CORS config required.

**Book catalog (book-catalog lab):** The only lab backed by real, persistent storage — an Azure SQL Database free-tier instance — behind a `BookCatalogStore` interface that falls back to an in-memory implementation when `AZURE_SQL_CONNECTION_STRING` is unset (including in CI); the deployed practice site always has it configured, so the live lab always runs against the real database. Fully self-contained (no dependency on any other lab): a public page runs a small set of named, parameterized queries — two plain `SELECT`s (Authors, Books) and two `JOIN` variants (Catalog) — with server-side pagination, sorting, and a search box that must safely neutralize SQL-injection-style input. The UI displays the literal SQL executed for each query. See [docs/azure-sql.md](docs/azure-sql.md) and Resolved Decisions #5 below.

**Current lab status:**

| Status        | Labs                   |
| ------------- | ---------------------- |
| `ready`       | All 36 registered labs |
| `coming-soon` | None                   |

**Lab completion tracking:** Tracked client-side in `localStorage` as a `Set` of completed slugs (`stagecraft:completed`). No user accounts or backend storage required. The home page reads this on mount to render completion badges.

---

## Deployment

The app is structured to be platform-agnostic. Any host that can run a Node.js process and serve static files works (Railway, Render, Fly.io, Docker, etc.).

- **Production build:** `npm run build` outputs `client/dist/` (static) and `server/dist/` (compiled JS)
- **Serving:** In production the Express server serves `client/dist/` as static files — no separate static host needed
- **Environment variables** (never hardcoded):
  - `PORT` — Express listen port (default: `3001`)
  - `SESSION_SECRET` — `express-session` signing secret (required in production)
  - `CLIENT_ORIGIN` — Allowed CORS origin (default: `http://localhost:5173`)
  - `NODE_ENV` — `development` | `production`
  - `AZURE_SQL_CONNECTION_STRING` — optional for local dev/CI; Azure SQL connection string for the `book-catalog` lab. Falls back to an in-memory store when unset; the deployed practice site always has this configured.
- **Docker:** A `Dockerfile` at the repo root builds a single image running the Express server (which serves the built client)

---

## Code Style

TypeScript is strict everywhere (`"strict": true`). Prefer explicit types on function signatures; let inference work for local variables.

**React components — functional, named exports:**

```tsx
// client/src/components/LabCard.tsx
interface LabCardProps {
  lab: Lab;
}

export function LabCard({ lab }: LabCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200 p-4 hover:border-zinc-400 transition-colors">
      <h2 className="text-lg font-semibold">{lab.title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{lab.topic}</p>
    </article>
  );
}
```

**Express routes — thin controllers, extracted logic:**

```ts
// server/src/routes/auth.ts
router.post('/login', (req, res) => {
  const { username, password } = req.body as LoginBody;
  const user = findUser(username, password); // logic in lib/
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.userId = user.id;
  res.json({ ok: true });
});
```

**Key conventions:**

- File names: `kebab-case.tsx` for components, `camelCase.ts` for utilities
- Components: `PascalCase`; hooks: `useNoun`, utilities: `verbNoun`
- No default exports (except where framework requires, e.g. Vite config)
- Tailwind class order: layout → spacing → typography → color → interactive
- No `any`; use `unknown` + type narrowing when type is genuinely dynamic

---

## Testing Strategy

### Unit / Component Tests (Vitest + React Testing Library)

- **Location:** `client/tests/` and `server/tests/`, mirroring `src/`
- **Scope:** Pure functions, utility logic, component render correctness
- **Coverage target:** 80% line coverage on `src/lib/` utilities
- **Run:** `npm run test:run`

```ts
// client/tests/labs/registry.test.ts
import { labs } from '../../src/labs';

test('every lab has a unique slug', () => {
  const slugs = labs.map((l) => l.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
});
```

### E2E Tests (Playwright)

- **Location:** `e2e/`
- **Scope:** Each ready lab has a spec that verifies the page loads, the UI is interactive, and the key learner-facing elements are present
- **Purpose:** Prevent regressions in the UI that learners test against — the labs themselves must stay reliable
- **Run:** `npm run test:e2e`
- **Config:** `playwright.config.ts` at root; `baseURL: http://localhost:5173`; `webServer` auto-starts `npm run dev`

```ts
// e2e/labs/accessible-locators.spec.ts
test('form has labeled inputs', async ({ page }) => {
  await page.goto('/practice/accessible-locators');
  await expect(page.getByRole('textbox', { name: 'First name' })).toBeVisible();
});
```

### What is NOT tested here

Learners write their own Playwright tests in a separate project. Stagecraft itself does not validate or execute learner tests.

---

## Boundaries

### Always do

- Run `npm run typecheck` and `npm run lint` before committing
- Keep every lab route reachable — use `coming-soon` status, never remove routes
- Validate all request bodies in Express routes (use `zod` or manual checks)
- Keep lab UIs free of real auth tokens, PII, or external API keys

### Ask first

- Adding a new npm dependency to any workspace
- Changing the URL structure of existing lab routes
- Adding a new Express route that changes server port or CORS policy
- Modifying the `Lab` interface shape (breaks registry consumers)
- Enabling any persistent storage (DB, file writes) on the server — approved once, as a scoped exception for the `book-catalog` lab's Azure SQL Database, on 2026-07-23 (see Resolved Decisions #5). This does not blanket-approve persistent storage for any other lab; ask again per lab.

### Never do

- Commit secrets, API keys, or real credentials to the repo
- Remove or redirect an existing `/practice/<slug>` route
- Use `any` type in TypeScript source files
- Vendor or copy third-party code inline without attribution
- Break the Playwright E2E suite without an approved plan to fix it

---

## Success Criteria

The spec is complete when:

- [ ] `npm run dev` starts both client (port 5173) and server (port 3001) cleanly
- [ ] The home page lists all 36 labs with correct status badges
- [ ] All 36 ready labs have fully functional interactive UIs
- [ ] Any future `coming-soon` lab renders a placeholder page instead of a 404
- [ ] `npm run test:run` passes with ≥80% coverage on utility code
- [ ] `npm run test:e2e` passes for all 36 ready labs
- [ ] `npm run typecheck` and `npm run lint` exit with 0 errors

---

## Implementation Plan

### Phase order and dependencies

```
Phase 1: Monorepo scaffold            (no deps)
Phase 2: Shell UI + lab registry      (needs Phase 1)
Phase 3: Express server baseline      (needs Phase 1)
Phase 4: Initial ready labs (client UI) (needs Phase 2)
Phase 5: Backend routes for 3 labs    (needs Phase 3)
Phase 6: Lab completion tracking      (needs Phase 2)
Phase 7: Deployment setup             (needs Phase 4+5)
Phase 8: E2E test suite               (needs Phase 4+5)
```

**Phases 1–3 must be sequential.** Phases 4–6 can proceed in parallel once Phase 2 is done. Phase 7 and 8 require all prior phases.

### Risks

| Risk                                                                       | Mitigation                                                                    |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| WebSocket upgrade conflicts with Express middleware                        | Wire `ws` after all Express routes are registered                             |
| `express-session` cookie not captured by Playwright in `storage-state` lab | Use `sameSite: 'lax'`; Playwright `storageState` can capture httpOnly cookies |
| Tailwind CSS source discovery missing dynamic lab classes                  | Keep lab source under `client/src` so Tailwind 4 scans the same app tree      |
| Vite proxy to Express needed in dev                                        | Configure `server.proxy` in `vite.config.ts` for `/api` and `/ws`             |

---

## Task Breakdown

### Phase 1 — Monorepo Scaffold

- [ ] **Task 1.1:** Initialise npm workspaces root
  - Acceptance: `package.json` has `workspaces: ["client","server"]`; `npm install` succeeds
  - Verify: `npm ls --workspaces` exits 0
  - Files: `package.json`, `tsconfig.base.json`, `.gitignore`, `.env.example`

- [ ] **Task 1.2:** Scaffold `client/` with Vite + React + TypeScript + Tailwind
  - Acceptance: `npm run dev:client` serves on port 5173; Tailwind classes render
  - Verify: Browser shows default Vite+React page with a Tailwind-styled element
  - Files: `client/package.json`, `client/vite.config.ts`, `client/src/main.tsx`, `client/index.html`

- [ ] **Task 1.3:** Scaffold `server/` with Express + TypeScript
  - Acceptance: `npm run dev:server` starts on port 3001; `GET /health` returns `{ ok: true }`
  - Verify: `curl http://localhost:3001/health` returns 200
  - Files: `server/package.json`, `server/tsconfig.json`, `server/src/index.ts`, `server/src/app.ts`

- [ ] **Task 1.4:** Root `npm run dev` runs both concurrently
  - Acceptance: Single command boots client + server; both ports respond
  - Verify: Manual check — both ports live after `npm run dev`
  - Files: `package.json` (concurrently script)

### Phase 2 — Shell UI + Lab Registry

- [ ] **Task 2.1:** Define `Lab` interface and registry (`client/src/labs/index.ts`)
  - Acceptance: All registered labs have correct slugs, status, `requiresBackend`, learner goals, guidance, and docs links
  - Verify: `npm run test:run` — registry uniqueness test passes
  - Files: `client/src/labs/index.ts`, `client/tests/labs/registry.test.ts`

- [ ] **Task 2.2:** Navigation layout and home page (`/`)
  - Acceptance: Home lists all registered labs; `coming-soon` labs have a distinct badge; `ready` labs link to `/practice/<slug>`
  - Verify: Playwright smoke test — home page renders all registry cards
  - Files: `client/src/layouts/Shell.tsx`, `client/src/pages/Home.tsx`, `client/src/components/LabCard.tsx`

- [ ] **Task 2.3:** `coming-soon` placeholder page
  - Acceptance: Any lab with `status: "coming-soon"` renders a placeholder; no 404
  - Verify: Navigate to `/practice/clock-timers` — placeholder renders
  - Files: `client/src/pages/practice/ComingSoon.tsx`, `client/src/App.tsx` (router)

### Phase 3 — Express Server Baseline

- [ ] **Task 3.1:** CORS, JSON body parser, session middleware
  - Acceptance: `express-session` configured; `SESSION_SECRET` read from env; CORS allows `CLIENT_ORIGIN`
  - Verify: `curl -X POST http://localhost:3001/api/auth/login` returns 401 (route exists)
  - Files: `server/src/app.ts`, `.env.example`

- [ ] **Task 3.2:** Vite proxy for `/api` → Express in development
  - Acceptance: `fetch('/api/health')` from the React app returns `{ ok: true }` (no CORS error in browser)
  - Verify: Browser network tab shows 200 for `/api/health`
  - Files: `client/vite.config.ts`

### Phase 4 — Five Ready Labs (Client UI)

Each lab sub-task follows the same pattern: build the interactive UI, add a descriptive header (topic + relevant APIs), ensure it's reachable at its route.

- [ ] **Task 4.1:** `/practice/accessible-locators`
  - UI: A form with labelled inputs, buttons with accessible names, images with alt text, heading hierarchy
  - Verify: E2E spec `accessible-locators.spec.ts` passes
  - Files: `client/src/pages/practice/AccessibleLocators.tsx`

- [ ] **Task 4.2:** `/practice/forms-validation`
  - UI: Multi-field form with required fields, select, checkbox, file input; submit disabled until valid; inline error messages
  - Verify: E2E spec `forms-validation.spec.ts` passes
  - Files: `client/src/pages/practice/FormsValidation.tsx`

- [ ] **Task 4.3:** `/practice/async-ui`
  - UI: Button triggers a 1.5 s fake fetch; spinner shown during load; content replaces spinner; error state on retry
  - Verify: E2E spec `async-ui.spec.ts` passes
  - Files: `client/src/pages/practice/AsyncUi.tsx`

- [ ] **Task 4.4:** `/practice/network-api`
  - UI: Page fetches `/api/items` on load; displays list; "Add item" POSTs to `/api/items`; "Delete" sends DELETE
  - Verify: E2E spec `network-api.spec.ts` passes
  - Files: `client/src/pages/practice/NetworkApi.tsx`, `server/src/routes/network.ts`

- [ ] **Task 4.5:** `/practice/fake-auth`
  - UI: Login form → POST `/api/auth/login` → redirects to `/practice/fake-auth/dashboard`; logout clears session
  - Verify: E2E spec `fake-auth.spec.ts` passes (login, protected route, logout)
  - Files: `client/src/pages/practice/FakeAuth.tsx`, `client/src/pages/practice/FakeAuthDashboard.tsx`, `server/src/routes/auth.ts`

### Phase 5 — Backend Routes for Network + Auth Labs

Covered inline in Tasks 4.4 and 4.5 above. Separate task for WebSocket:

- [ ] **Task 5.1:** WebSocket server (same-port upgrade)
  - Acceptance: Connecting to `ws://localhost:3001/ws` receives a welcome message; server echoes client messages
  - Verify: `wscat -c ws://localhost:3001/ws` — message roundtrip works
  - Files: `server/src/lib/websocket.ts`, `server/src/index.ts` (wire upgrade)

### Phase 6 — Lab Completion Tracking

- [ ] **Task 6.1:** `useLabProgress` hook + `localStorage` persistence
  - Acceptance: Calling `markComplete(slug)` persists to `localStorage`; home page shows completion badge on next load
  - Verify: Vitest unit test for hook; manual check in browser
  - Files: `client/src/lib/useLabProgress.ts`, `client/tests/lib/useLabProgress.test.ts`

- [ ] **Task 6.2:** Completion badges on home page and lab headers
  - Acceptance: Completed labs show a distinct visual indicator; clicking "Mark complete" on a lab page saves state
  - Verify: Mark a lab complete → refresh home page → badge visible
  - Files: `client/src/pages/Home.tsx`, `client/src/components/LabCard.tsx`, lab page components

### Phase 7 — Deployment Setup

- [ ] **Task 7.1:** Production build script and static file serving
  - Acceptance: `npm run build` compiles both workspaces; `NODE_ENV=production node server/dist/index.js` serves the React app
  - Verify: Visit `http://localhost:3001` in production mode — home page loads
  - Files: `package.json` (build script), `server/src/index.ts` (static middleware)

- [ ] **Task 7.2:** `Dockerfile` for single-image deployment
  - Acceptance: `docker build -t stagecraft .` succeeds; `docker run -p 3001:3001 stagecraft` serves the app
  - Verify: Home page loads from Docker container
  - Files: `Dockerfile`, `.dockerignore`

- [ ] **Task 7.3:** `docker-compose.yml` for local dev parity
  - Acceptance: `docker compose up` starts the production image locally
  - Verify: Same as 7.2
  - Files: `docker-compose.yml`

### Phase 8 — E2E Test Suite

- [ ] **Task 8.1:** Playwright config at repo root
  - Acceptance: `npm run test:e2e` auto-starts dev server, runs all specs, exits cleanly
  - Verify: `npm run test:e2e` — all specs pass
  - Files: `playwright.config.ts`

- [ ] **Task 8.2:** Home page smoke spec
  - Acceptance: All registered lab cards rendered; no broken links for `ready` labs
  - Files: `e2e/home.spec.ts`

- [ ] **Task 8.3–8.7:** One E2E spec per ready lab (Tasks 4.1–4.5)
  - See Task 4.x "Verify" steps for acceptance criteria
  - Files: `e2e/labs/accessible-locators.spec.ts`, `forms-validation.spec.ts`, `async-ui.spec.ts`, `network-api.spec.ts`, `fake-auth.spec.ts`

### Phase 9 — Book Catalog Lab (Real Persistence)

- [ ] **Task 9.1:** Azure SQL-backed `BookCatalogStore` with in-memory fallback
  - Acceptance: `SqlBookCatalogStore` and `InMemoryBookCatalogStore` both implement `listAuthors`/`listBooks`/`listCatalog`/`reseed`; the store is picked once by `AZURE_SQL_CONNECTION_STRING` presence; all queries against the SQL store are parameterized, and each result page includes the literal SQL text executed for UI display
  - Verify: `npm run test:run --workspace=server` passes on the in-memory fallback; guarded `bookCatalogStore.azureSql.test.ts` passes when a real connection string is set locally
  - Files: `server/src/lib/bookCatalogStore.ts`, `server/src/lib/db.ts`

- [ ] **Task 9.2:** `/api/book-catalog` routes (fully public, no auth dependency)
  - Acceptance: `GET /api/book-catalog/authors`, `/books`, and `/catalog` (paginated/filtered/sorted) and `POST /api/book-catalog/reseed` require no session — this lab has no dependency on `fake-auth` or any other lab
  - Verify: `npm run test:run --workspace=server` — `book catalog API` describe block passes, including the SQL-injection-safety case
  - Files: `server/src/routes/bookCatalog.ts`, `server/src/lib/schemas.ts`

- [ ] **Task 9.3:** `/practice/book-catalog` UI
  - UI: Three tabs (Authors, Books, Catalog) each with search/filter/sort controls, an explicit "Run Query" action, visible SQL text, pagination, and a "Reset catalog data" action behind a confirm dialog
  - Verify: E2E spec `book-catalog.spec.ts` passes, including pagination, filtering, the injection-safety scenario, and the reset confirm-dialog flow
  - Files: `client/src/pages/practice/BookCatalog.tsx`, `client/src/labs/index.ts`, `client/src/App.tsx`

---

## Resolved Decisions

| #   | Question                              | Decision                                                                                                                                            | Rationale                                                                                                                                                                                                                                     |
| --- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Auth mechanism for `fake-auth`        | `express-session` (cookie-session)                                                                                                                  | Complements `storage-state` lab — learners capture the session cookie in `storageState`                                                                                                                                                       |
| 2   | WebSocket server                      | Same-port upgrade via `ws`                                                                                                                          | Single port, no CORS config, standard Node.js pattern                                                                                                                                                                                         |
| 3   | Deployment                            | Platform-agnostic (Docker + env vars)                                                                                                               | Platform TBD; Express serves static build in production                                                                                                                                                                                       |
| 4   | Lab completion tracking               | `localStorage` on client                                                                                                                            | No accounts needed; persists on device; zero backend complexity                                                                                                                                                                               |
| 5   | Persistent storage for `book-catalog` | Azure SQL Database (free tier) behind a `BookCatalogStore` interface, with an in-memory fallback selected by `AZURE_SQL_CONNECTION_STRING` presence | First lab needing real cross-restart persistence and SQL-injection-safety testing; the fallback keeps CI hermetic without new secrets or service containers; approved as a scoped, one-lab exception to "no persistent storage" on 2026-07-23 |
