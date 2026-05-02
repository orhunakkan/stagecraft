# Stagecraft

Stagecraft is a local web application for practicing modern Playwright test automation skills. It provides a catalog of hands-on browser challenges across topics like accessible locators, forms, async UI, network interception, fake auth, and more.

The app teaches by letting you practice, not by giving you finished answers. You read a challenge, interact with a realistic UI inside Stagecraft, then write your own Playwright tests in a **separate project** outside this app.

---

## Quick start

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js (default: http://localhost:3000).

---

## How to use Stagecraft

1. Open the app locally.
2. Browse the **Challenges** catalog and pick a topic.
3. Read the challenge scenario, learning objective, and acceptance criteria.
4. Follow the **Open practice lab** link to the interactive practice surface.
5. In your **own separate Playwright project**, write tests against the local Stagecraft URL.
6. Use the challenge acceptance criteria as your test goals — not as code to copy.

Stagecraft does not grade your tests or provide solution scripts. Progress tracking is self-marked and stored locally in your browser.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run lint` | Check for lint errors |
| `npm run typecheck` | Check TypeScript types |
| `npm test` | Run unit and component tests |
| `npm test -- --coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:e2e:ui` | Open Playwright UI mode |
| `npm run verify` | Run all quality gates (lint, types, tests, e2e, build) |

Run `npm run verify` before committing to confirm everything passes.

---

## Writing your own Playwright tests

Stagecraft is the **target app** for your automation practice. Set your Playwright `baseURL` to the local dev server:

```typescript
// playwright.config.ts (in your own project)
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

Start `npm run dev` in this repo first, then run your tests from your own project.

---

## Practice labs

| Lab route | Topic |
|---|---|
| `/practice/accessible-locators` | Roles, labels, headings, alt text, accessible names |
| `/practice/forms-validation` | Form controls, validation messages, submit states |
| `/practice/tables-filtering` | Search, sort, filter, pagination, row actions |
| `/practice/async-ui` | Loading states, retries, delayed updates |
| `/practice/network-api` | API-backed UI, request/response, mock opportunities |
| `/practice/fake-auth` | Login flow, protected routes, logout, session state |
| `/practice/browser-events` | Dialogs, file uploads/downloads, popups, navigation |
| `/practice/frames-contexts` | Iframes, frame locators, isolated context concepts |
| `/practice/emulation-input` | Keyboard, mouse, viewport, responsive behavior |
| `/practice/debugging-reporting` | Trace viewer, screenshots, retries, timeout concepts |

---

## Contributor guidelines

- **TypeScript only.** Do not create `.js` or `.jsx` source, test, or config files. Prefer `.ts`, `.tsx`, `.json`, `.css`, and Markdown.
- **No solution scripts in the UI.** Challenge instructions may include conceptual hints but must not contain complete Playwright scripts or copy-pasteable locator answers.
- **No official docs in the app.** The `docs/` directory is an internal reference; do not render or link its content inside the app.
- **Keep labs deterministic and resettable.** Every practice lab must have a reset control and produce the same UI state on each visit.
- **Run `npm run verify` before any commit** and fix all failures.
- Architecture decisions are recorded under `docs/adr/`.
- The product specification, implementation plan, and task breakdown live in `SPEC.md`, `PLAN.md`, and `TASKS.md`.
