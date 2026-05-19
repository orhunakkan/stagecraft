# Stagecraft

Stagecraft is a hands-on Playwright practice application for developers who already know JavaScript or TypeScript and want realistic browser automation scenarios. It provides 20 interactive labs that learners can open in the browser, explore manually, and test from a separate Playwright project.

The app intentionally does not ship answer tests for learners. Its job is to provide stable, realistic UI and API surfaces for practicing locators, network interception, storage state, WebSockets, visual assertions, service workers, multi-tab flows, and other Playwright APIs.

## Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Playwright MCP](#playwright-mcp)
- [Application URLs](#application-urls)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Labs](#labs)
- [Backend Fixtures](#backend-fixtures)
- [Testing](#testing)
- [Configuration](#configuration)
- [Production Build and Docker](#production-build-and-docker)
- [Azure App Service Free Hosting](#azure-app-service-free-hosting)
- [Development Guidelines](#development-guidelines)
- [Troubleshooting](#troubleshooting)

## Tech Stack

| Area                 | Technology                                           |
| -------------------- | ---------------------------------------------------- |
| Frontend             | React 18, TypeScript, React Router                   |
| Frontend build       | Vite 6                                               |
| Styling              | Tailwind CSS 4 via `@tailwindcss/vite`               |
| Backend              | Express 5, TypeScript                                |
| Sessions             | `express-session`                                    |
| WebSockets           | `ws`                                                 |
| Unit/component tests | Vitest, React Testing Library, jsdom                 |
| End-to-end tests     | Playwright                                           |
| Package manager      | npm workspaces                                       |
| Runtime              | Node.js 22                                           |
| Deployment           | Single Node process serving the built client and API |

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer
- Playwright browser binaries for E2E tests

Install Playwright browsers once after dependency installation:

```bash
npx playwright install
```

Docker is optional and only needed for containerized production runs.

## Quick Start

Run commands from the repository root.

```bash
npm install
npx playwright install
npm run dev
```

Then open:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:3001/health`

The root `npm run dev` command starts both workspaces concurrently: the Vite client on port `5173` and the Express server on port `3001`.

## Available Scripts

| Command                 | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `npm run dev`           | Start client and server together for local development.   |
| `npm run dev:client`    | Start only the Vite client on `http://localhost:5173`.    |
| `npm run dev:server`    | Start only the Express server on `http://localhost:3001`. |
| `npm run build`         | Build both workspaces for production.                     |
| `npm run test`          | Run client and server Vitest suites in watch mode.        |
| `npm run test:run`      | Run client and server Vitest suites once.                 |
| `npm run test:coverage` | Run Vitest coverage for both workspaces.                  |
| `npm run test:e2e`      | Run the Playwright E2E suite.                             |
| `npm run test:e2e:ui`   | Open Playwright UI mode.                                  |
| `npm run lint`          | Run TypeScript-based lint checks for both workspaces.     |
| `npm run package:azure` | Build a ZIP package for Azure App Service.                |
| `npm run typecheck`     | Type-check the root project and both workspaces.          |

Workspace-specific scripts are also available:

```bash
npm run test:run --workspace=client
npm run test:run --workspace=server
npm run typecheck --workspace=client
npm run typecheck --workspace=server
```

## Playwright MCP

This repo includes a `.mcp.json` file with the standard Playwright MCP server configuration:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

MCP clients that support repo-local configuration can load it directly. For clients that require user-level setup, add the same server configuration in the client settings.

## Application URLs

| URL                                                  | Purpose                        |
| ---------------------------------------------------- | ------------------------------ |
| `http://localhost:5173/`                             | Lab catalog.                   |
| `http://localhost:5173/practice/<slug>`              | Individual lab route.          |
| `http://localhost:5173/practice/fake-auth/dashboard` | Protected fake-auth dashboard. |
| `http://localhost:3001/health`                       | Server health check.           |
| `http://localhost:3001/openapi.json`                 | OpenAPI contract.              |
| `http://localhost:3001/api-docs`                     | Swagger API documentation.     |
| `ws://localhost:3001/ws`                             | WebSocket lab endpoint.        |

In development, Vite proxies `/api` and `/ws` traffic to the backend, so frontend code can call relative URLs such as `/api/auth/me`.
The OpenAPI JSON and Swagger UI are served directly by the backend on port `3001`.

## Project Structure

```text
stagecraft/
|-- client/                  # Vite + React application
|   |-- public/              # Static client assets, including service worker fixture
|   |-- src/
|   |   |-- components/      # Shared UI components
|   |   |-- labs/            # Lab registry and metadata
|   |   |-- layouts/         # Application shell
|   |   |-- lib/             # Client utilities and hooks
|   |   `-- pages/           # Home page and practice lab pages
|   `-- tests/               # Vitest component and utility tests
|-- e2e/                     # Playwright E2E specs
|   `-- labs/                # One spec per lab area
|-- server/                  # Express API and WebSocket server
|   `-- src/
|       |-- lib/             # Server utilities, including WebSocket setup
|       `-- routes/          # API route modules used by labs
|-- Dockerfile               # Production container image
|-- docker-compose.yml       # Local production-like container run
|-- playwright.config.ts     # E2E test config and webServer setup
|-- SPEC.md                  # Product and implementation specification
`-- package.json             # Root workspace scripts
```

## Architecture

Stagecraft is an npm-workspaces monorepo with two runtime workspaces:

- `client`: a Vite React single-page app. It owns routing, lab UI, lab metadata, and local completion tracking.
- `server`: an Express app. It owns fake API data, fake authentication, sessions, and the WebSocket endpoint.

During local development, the client and server run as separate processes. The Vite dev server proxies API and WebSocket traffic to Express.

In production, the client is built to `client/dist`, the server is built to `server/dist`, and Express serves the static client bundle from the same Node process that handles `/api/*`, `/health`, and `/ws`.

### Important Design Choices

- Lab completion is stored in browser `localStorage` under `stagecraft:completed`.
- Fake authentication uses server-side sessions via `express-session`.
- The fake-auth session cookie is httpOnly; Playwright can still persist it through `storageState` for the auth-state lab.
- WebSockets are attached to the same HTTP server as Express and are available at `/ws`.
- Backend data is in-memory and resets when the server restarts.

## Labs

All labs are registered in `client/src/labs/index.ts`. Each registry entry defines the route slug, display title, topic, relevant Playwright APIs, status, and whether the lab needs the backend.

| Slug                     | Lab                    | Backend | Focus                                                       |
| ------------------------ | ---------------------- | ------- | ----------------------------------------------------------- |
| `accessible-locators`    | Accessible Locators    | No      | Roles, labels, headings, alt text, accessible names.        |
| `forms-validation`       | Forms & Validation     | No      | Form controls, validation messages, disabled submit states. |
| `tables-filtering`       | Tables & Filtering     | No      | Search, sort, filter, pagination, row actions.              |
| `async-ui`               | Async UI               | No      | Loading states, retries, delayed UI changes.                |
| `network-api`            | Network & API          | Yes     | API-backed UI and network synchronization.                  |
| `fake-auth`              | Fake Auth              | Yes     | Login, protected routes, logout, session state.             |
| `browser-events`         | Browser Events         | No      | Dialogs, files, downloads, browser events.                  |
| `frames-contexts`        | Frames & Contexts      | No      | Iframes and browser context concepts.                       |
| `emulation-input`        | Emulation & Input      | No      | Keyboard, mouse, viewport, device emulation.                |
| `debugging-reporting`    | Debugging & Reporting  | No      | Trace viewer, screenshots, retries, timeouts.               |
| `websocket-interception` | WebSocket Interception | Yes     | WebSocket messages and interception.                        |
| `aria-snapshots`         | ARIA Snapshots         | No      | Accessibility tree regression assertions.                   |
| `clock-timers`           | Clock & Timers         | No      | Controlling time with Playwright clock APIs.                |
| `api-request-context`    | API Request Context    | Yes     | Using Playwright's HTTP client fixture.                     |
| `storage-state`          | Storage State          | Yes     | Auth serialization and multi-user contexts.                 |
| `visual-regression`      | Visual Regression      | No      | Screenshots and visual diffing.                             |
| `drag-and-drop`          | Drag & Drop            | No      | Drag actions, drop zones, DataTransfer.                     |
| `har-recording`          | HAR Recording          | Yes     | HAR recording, replay, and network stubs.                   |
| `multi-tab`              | Multi-Tab              | No      | Popups, multiple pages, shared same-origin state.           |
| `service-workers`        | Service Workers        | Yes     | Service worker interception and offline testing.            |

## Backend Fixtures

The backend exists to support realistic Playwright practice. It is not a production data service.

### API Documentation

| URL                                  | Purpose                               |
| ------------------------------------ | ------------------------------------- |
| `http://localhost:3001/openapi.json` | OpenAPI 3.0.3 contract for HTTP APIs. |
| `http://localhost:3001/api-docs`     | Swagger UI for the OpenAPI contract.  |

The WebSocket fixture remains documented in this README rather than in OpenAPI.

### Health

| Method | Path      | Purpose                   |
| ------ | --------- | ------------------------- |
| `GET`  | `/health` | Returns `{ "ok": true }`. |

### Auth

| Method | Path                    | Purpose                                        |
| ------ | ----------------------- | ---------------------------------------------- |
| `POST` | `/api/auth/login`       | Create a fake session.                         |
| `GET`  | `/api/auth/me`          | Return the current session user.               |
| `POST` | `/api/auth/logout`      | Destroy the current session.                   |
| `GET`  | `/api/auth/admin/stats` | Admin-only fixture for storage-state practice. |

Fake users:

| Username | Password      | Role    |
| -------- | ------------- | ------- |
| `alice`  | `password123` | `admin` |
| `bob`    | `letmein`     | `user`  |

### Lab Data APIs

| Method                         | Path                | Purpose                                                                        |
| ------------------------------ | ------------------- | ------------------------------------------------------------------------------ |
| `GET`, `POST`, `DELETE`        | `/api/notes`        | Mutable notes fixture for network practice.                                    |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/tasks`        | Mutable task fixture for API request context practice.                         |
| `GET`                          | `/api/products`     | Product list fixture.                                                          |
| `GET`                          | `/api/products/:id` | Product detail fixture.                                                        |
| `GET`                          | `/api/sw-items`     | Fresh server data used by the service worker lab.                              |
| WebSocket                      | `/ws`               | Sends a welcome message, periodic ticker messages, and echoes client messages. |

## Testing

Stagecraft has three test layers.

### Unit and Component Tests

Client tests live in `client/tests`. Server tests live next to server source where applicable.

```bash
npm run test:run
```

Use these tests for lab registry checks, component behavior, hooks such as `useLabProgress`, Express routes, and WebSocket utilities.

### End-to-End Tests

Playwright specs live in `e2e`. The Playwright config starts both the server and client automatically before the suite.

```bash
npm run test:e2e
```

Use UI mode while authoring or debugging:

```bash
npm run test:e2e:ui
```

The E2E suite verifies that the practice app itself remains stable. It is separate from learner-written tests.

### Type and Lint Checks

This project uses TypeScript checks as the lint gate.

```bash
npm run typecheck
npm run lint
```

## Configuration

Local development works with defaults. Production and Docker runs should provide explicit environment variables.

| Variable         | Default                 | Required          | Description                                              |
| ---------------- | ----------------------- | ----------------- | -------------------------------------------------------- |
| `PORT`           | `3001`                  | No                | Express listen port.                                     |
| `CLIENT_ORIGIN`  | `http://localhost:5173` | No                | CORS origin allowed by the API in development.           |
| `SESSION_SECRET` | Development fallback    | Yes in production | Secret used to sign session cookies.                     |
| `NODE_ENV`       | unset                   | No                | Use `production` to serve the built client from Express. |

PowerShell example:

```powershell
$env:SESSION_SECRET = "replace-with-a-long-random-value"
$env:NODE_ENV = "production"
$env:PORT = "3001"
npm run build
node server/dist/index.js
```

## Production Build and Docker

Build the application:

```bash
npm run build
```

Run the compiled server locally:

```bash
SESSION_SECRET=replace-with-a-long-random-value NODE_ENV=production node server/dist/index.js
```

Build and run the Docker image:

```bash
docker build -t stagecraft .
docker run --rm -p 3001:3001 -e SESSION_SECRET=replace-with-a-long-random-value stagecraft
```

Or use Docker Compose:

```bash
SESSION_SECRET=replace-with-a-long-random-value docker compose up --build
```

The production app is then served at `http://localhost:3001`.

## Azure App Service Free Hosting

The cheapest full-app Azure target is Azure App Service on the Linux Free F1 tier. Use this when you want the built React SPA, Express APIs, session cookies, and `/ws` WebSocket endpoint to stay together under one Azure-hosted origin.

Create a deployment ZIP without deploying:

```powershell
npm run package:azure
```

The package is written to `.azure-publish/stagecraft-appservice.zip`, which is ignored by git.

When you are ready to create Azure resources, use the detailed checklist in [docs/azure-app-service.md](docs/azure-app-service.md). The required App Service settings are:

| Setting          | Value                                    |
| ---------------- | ---------------------------------------- |
| Runtime          | `NODE\|22-lts`                           |
| Startup command  | `node server/dist/index.js`              |
| `NODE_ENV`       | `production`                             |
| `SESSION_SECRET` | A long generated secret stored in Azure  |
| `CLIENT_ORIGIN`  | `https://<app-name>.azurewebsites.net`   |
| WebSockets       | Enabled in the App Service configuration |

## Development Guidelines

- Keep every lab route reachable. If a lab is not ready, use a placeholder rather than removing the route.
- Keep lab UIs deterministic enough for Playwright tests, while still feeling like realistic browser workflows.
- Add or update E2E coverage when a lab's user-facing behavior changes.
- Keep backend fixtures intentionally fake and in-memory unless there is an approved reason to add persistence.
- Do not commit real credentials, tokens, API keys, or personal data.
- Prefer named React component exports and strict TypeScript types.
- Avoid `any`; use `unknown` plus narrowing for dynamic request or browser data.
- Update `client/src/labs/index.ts` when adding, renaming, or changing lab status.
- Update this README and `SPEC.md` when behavior or architecture changes in a way future contributors need to understand.

## Troubleshooting

### `npm run test:e2e` cannot find a browser

Install Playwright browser binaries:

```bash
npx playwright install
```

### Port `5173` or `3001` is already in use

Stop the existing process or run the client/server individually with adjusted configuration. The checked-in Playwright config expects the default ports.

### API calls fail from the client in development

Make sure the backend is running on `http://localhost:3001`. The Vite client proxies `/api` and `/ws` to that port.

```bash
npm run dev:server
```

### Production server exits with `SESSION_SECRET environment variable is required in production`

Set `SESSION_SECRET` before starting the production server or Docker container.

### Test data changed unexpectedly

Most backend fixtures are in-memory arrays. Restarting the server resets them to their initial state.
