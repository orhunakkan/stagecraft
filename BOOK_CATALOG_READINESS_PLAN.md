# Book Catalog Readiness Plan

## Goal

Reduce the delay before the Book Catalog table appears after the site has been idle, while first identifying whether the delay comes from App Service startup, Azure SQL serverless resume, or both.

## Scope

This plan covers only the first two agreed steps:

1. Enable App Service Always On.
2. Capture evidence from a deliberately idle Book Catalog request.

It does not change the Azure SQL tier, disable SQL auto-pause, add scheduled keep-alive traffic, or implement user-interface retries/caching.

## Reproduction URL

Use this exact public route for all browser observations in Task 3:

`https://stagecraftlabs.com/practice/book-catalog`

## Confirmed Starting State

- App Service: `stagecraft-orhun-b7779b` on the Basic B1 plan.
- App Service `alwaysOn` is currently `false`.
- Azure SQL database: `stagecraft-audit-log`, General Purpose serverless, with a 60-minute auto-pause delay.
- Book Catalog initially fetches `/api/book-catalog/authors` when its Authors panel mounts.
- The server already uses a 60-second SQL timeout and retries SQL connection attempts after 2, 5, and 10 seconds.
- The Book Catalog routes currently return a generic `503` response when their store operation fails; they do not record request duration or return a failure category to the browser.

## Desired Evidence

For an idle-to-first-Book-Catalog visit, collect:

- browser request start/end time and HTTP status for `/api/book-catalog/authors`;
- App Service process-start evidence, if a restart/unload occurred;
- SQL connection attempt count, elapsed duration, and sanitized error code/message;
- Azure SQL status and free-offer metric around the event.

No connection string, session secret, SQL password, or request payload must be logged.

## Task 1: Enable Always On

**Description:** Enable the existing App Service Always On setting. Azure will then make a root request every five minutes, preventing the web application from being unloaded after idle time.

**Azure resource:** `stagecraft-orhun-b7779b` in `rg-stagecraft-free`

**Implementation:**

1. Record the existing setting (`alwaysOn: false`) and current App Service plan/SKU.
2. Set the App Service `alwaysOn` property to `true` in the Azure portal or with Azure CLI.
3. Do not change the App Service plan, App Settings, SQL settings, DNS, or certificates.

**Acceptance criteria:**

- [ ] Azure reports `alwaysOn: true` for `stagecraft-orhun-b7779b`.
- [ ] The App Service remains on the existing Basic B1 plan with one worker.
- [ ] No application settings or secrets are changed.
- [ ] After at least 20 minutes without user traffic, a request to the non-SQL `/health` endpoint does not exhibit an app-unload warm-up delay.

**Verification:**

- [ ] Run `az webapp config show` and verify `alwaysOn` is `true`.
- [ ] Run `az appservice plan show` and verify the SKU remains B1 and the worker count remains one.
- [ ] Record a timestamped `/health` request before and after an idle interval.

**Rollback:** Set `alwaysOn` back to `false`; this changes only the web-app configuration.

**Dependencies:** None.

**Estimated scope:** XS — Azure configuration only.

## Task 2: Add Sanitized Book Catalog Readiness Telemetry

**Description:** Make the first Book Catalog request diagnosable without exposing secrets. The telemetry must separate app-level request duration, SQL-connection retries, and final HTTP outcome.

**Likely files:**

- `server/src/lib/db.ts`
- `server/src/routes/bookCatalog.ts`
- `server/src/lib/bookCatalogStore.azureSql.test.ts`
- `server/src/routes/bookCatalog.test.ts` (new or existing route coverage, if appropriate)

**Implementation:**

1. Record a monotonic start time around the SQL connection operation and log only: attempt number, elapsed milliseconds, and sanitized SQL error code/name.
2. Record route-level elapsed time and outcome for the three read endpoints (`authors`, `books`, and `catalog`).
3. Preserve the existing public API response shape for successful requests.
4. For failures, retain a safe generic client error; do not send raw Azure SQL errors to the browser.
5. Ensure logs do not include connection strings, credentials, session data, query parameters, or full stack traces that could contain sensitive values.

**Acceptance criteria:**

- [ ] A successful Book Catalog request has one structured timing record with endpoint, outcome, and elapsed milliseconds.
- [ ] A failed SQL connection records a retry attempt and sanitized error classification without secrets.
- [ ] The browser continues to receive the same successful response schema.
- [ ] A Book Catalog failure remains a safe generic `503` response.

**Verification:**

- [ ] Add or update tests for successful route output and a simulated store failure.
- [ ] Run the targeted Book Catalog/server tests.
- [ ] Run the relevant build and lint commands.
- [ ] Review a sample production-shaped log line manually to confirm it contains no secret values.

**Dependencies:** Task 1 should be completed first, so app-unload delay is removed before interpreting the telemetry.

**Estimated scope:** S — 2–4 server/test files.

## Task 3: Run the Idle-to-First-Request Experiment

**Description:** With Always On enabled and telemetry deployed, gather evidence from a controlled idle interval without changing the SQL tier or its auto-pause policy.

**Procedure:**

1. Confirm the app stays responsive through `/health` after an idle interval.
2. Confirm Azure SQL is paused before the Book Catalog request, when safe to observe.
3. Open the Book Catalog Authors panel once and record browser timing, HTTP status, route timing, SQL retry events, and SQL state after the request.
4. Repeat on a separate idle interval to avoid acting on a single sample.

**Decision rules:**

| Evidence                                                        | Conclusion                            | Next discussion                                              |
| --------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| `/health` is slow after idle                                    | App startup is still involved         | Recheck Always On configuration and App Service diagnostics. |
| `/health` is fast; Book Catalog waits during SQL retries/resume | SQL auto-pause is the bottleneck      | Discuss UX retry/cache versus a paid always-ready SQL tier.  |
| Book Catalog returns `503` without a SQL-resume signature       | Another SQL/connectivity issue exists | Diagnose the captured error before changing tiers.           |
| Book Catalog is fast while SQL reports active                   | Pause is not reproducibly the cause   | Investigate browser/API-specific latency.                    |

**Acceptance criteria:**

- [ ] At least two idle-to-first-request samples include the requested timing and error evidence.
- [ ] The cause is classified using the decision rules, or explicitly recorded as inconclusive.
- [ ] No Azure SKU, database tier, or keep-alive schedule is changed during the experiment.

**Dependencies:** Tasks 1 and 2.

**Estimated scope:** XS — operational verification only.

## Checkpoint: Decision Review

Before any further change, review the experiment results and choose one path:

- keep the free SQL database and improve loading/retry messaging;
- add an application-level cache/fallback for catalog reads;
- accept a paid, non-serverless Azure SQL tier; or
- diagnose a different identified cause.

## Risks and Mitigations

| Risk                                                        | Impact                 | Mitigation                                                                                |
| ----------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------- |
| Always On is mistaken for a SQL keep-alive                  | Database delay remains | Treat Task 1 as app-only; confirm SQL behavior with Task 3.                               |
| Logging exposes secrets                                     | High                   | Log classifications and durations only; never log connection strings or raw request data. |
| One successful or failed sample leads to a false conclusion | Medium                 | Require two separate idle-to-first-request samples.                                       |
| SQL pause is prevented during observation                   | Low                    | Record SQL status before each test and avoid unrelated catalog requests.                  |

## Out of Scope

- Changing `stagecraft-audit-log` to Basic B or any other paid tier.
- Disabling SQL auto-pause or scheduling database keep-alive traffic.
- Changing Book Catalog behavior, caching responses, or modifying the UI.
- Enabling HTTP logging, detailed error logging, or external monitoring beyond the narrowly scoped telemetry above.
