# Dependency Upgrade Plan

## Summary

Upgrade all dependencies with `npx npm-check-updates`, but land them in staged PRs against Node 22 so local, CI, Docker, and Azure each get a clear rollback point. Do not merge a batch unless the full validation matrix passes.

Current high-risk upgrades include React 19, React Router 7, Vite 8, Vitest 4, TypeScript 6, jsdom 29, and Playwright 1.60.

## Key Changes

- Preserve Node 22 as the target runtime, matching `package.json`, GitHub Actions, Docker, and Azure App Service.
- Use `npm-check-updates` in filtered batches, not one global `-u`.
- Refresh `package-lock.json` with `npm install` after each batch, then verify with `npm ci`.
- Keep npm workspaces and lockfile v3; no package manager migration.
- No intentional public app API changes. Any React Router or Express behavior changes must preserve existing routes, sessions, health checks, API responses, SPA refreshes, and WebSocket behavior.

## Upgrade Batches

1. Baseline before upgrades:
   - Run `npm ci`
   - Run `npm run format:check`
   - Run `npm run lint`
   - Run `npm run typecheck`
   - Run `npm run test:coverage`
   - Run `npm run build`
   - Run `npm run test:e2e`
   - Run `docker build --pull --target runtime --tag stagecraft:baseline .`
   - Run `npm run package:azure`

2. PR 1: patch/minor dependencies except Playwright:
   - Use `npx npm-check-updates --workspaces --target minor --reject @playwright/test -u`
   - Run `npm install`
   - Run the full validation matrix.

3. PR 2: Playwright:
   - Use `npx npm-check-updates --workspaces --filter @playwright/test -u`
   - Run `npm install`
   - Run `npx playwright install chromium`
   - Run unit, build, and e2e validation locally and in CI.

4. PR 3: test stack majors:
   - Upgrade `vitest`, `@vitest/coverage-v8`, and `jsdom` together.
   - Fix only test/config breakage caused by those packages.
   - Require coverage output and CI artifact upload to keep working.

5. PR 4: build/type toolchain majors:
   - Upgrade `typescript`, `vite`, and `@vitejs/plugin-react` together.
   - Fix TypeScript, Vite config, module resolution, and build output issues.
   - Require clean client/server builds and Docker runtime image build.

6. PR 5: React runtime:
   - Upgrade `react`, `react-dom`, `@types/react`, and `@types/react-dom`.
   - Fix rendering, testing, and typing issues without changing app behavior.
   - Verify core UI flows through Playwright.

7. PR 6: React Router:
   - Upgrade `react-router-dom` to v7.
   - Preserve existing route URLs, SPA refresh behavior, navigation, and e2e route coverage.
   - Treat any route API migration as app-facing risk.

## Test Plan

Every PR must pass:

- `npm ci`
- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run test:coverage`
- `npm run build`
- `npm audit --audit-level=high`
- `npm run test:e2e`
- `docker build --pull --target runtime --tag stagecraft:<branch> .`
- `npm run package:azure`

Final major-upgrade PRs must also be smoke-tested from the packaged artifact:

- Start `server/dist/index.js` with `NODE_ENV=production` and a test `SESSION_SECRET`.
- Verify `/`, `/health`, `/api/tasks`, `/practice/network-api`, and `/practice/websocket-interception`.
- Deploy the ZIP to a non-production Azure App Service with Node 22 settings before merging to `main`.

## Assumptions

- Upgrade strategy is staged PRs.
- Runtime target remains Node 22.
- The production deploy still happens only after push to `main`.
- If no Azure staging app exists, create a temporary one with the same App Service settings before merging the final major batches.
