/**
 * Functional API tests for all practice API routes.
 *
 * APIs under test:
 *   /api/practice/runs        — CRUD for test runs (in-memory store)
 *   /api/practice/runs/[id]   — Single-run read and delete
 *   /api/practice/network/items — Read-only support tickets
 *   /api/practice/websockets  — WebSocket upgrade placeholder
 */

import { expect, test } from '@playwright/test';

// ─── Runs API ─────────────────────────────────────────────────────────────────
//
// The runs store is a shared singleton. Tests that mutate it run serially and
// reset before each case so they are fully independent of one another.

const RUNS_URL = '/api/practice/runs';

test.describe('Runs API', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ request }) => {
    await request.get(`${RUNS_URL}?reset=true`);
  });

  // ── GET /api/practice/runs ────────────────────────────────────────────────

  test.describe('GET /api/practice/runs', () => {
    test('returns HTTP 200', async ({ request }) => {
      const response = await request.get(RUNS_URL);
      expect(response.status()).toBe(200);
    });

    test('response body has runs, total, and seeded fields', async ({ request }) => {
      const body = await request.get(RUNS_URL).then((r) => r.json());
      expect(body).toHaveProperty('runs');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('seeded');
      expect(Array.isArray(body.runs)).toBe(true);
    });

    test('total always equals runs.length', async ({ request }) => {
      const body = await request.get(RUNS_URL).then((r) => r.json());
      expect(body.total).toBe(body.runs.length);
    });

    test('fresh store reports seeded: true', async ({ request }) => {
      const body = await request.get(RUNS_URL).then((r) => r.json());
      expect(body.seeded).toBe(true);
    });

    test('each seed run has id, name, status, durationMs, and createdAt', async ({ request }) => {
      const body = await request.get(RUNS_URL).then((r) => r.json()) as { runs: unknown[] };
      for (const run of body.runs) {
        const r = run as Record<string, unknown>;
        expect(r).toHaveProperty('id');
        expect(r).toHaveProperty('name');
        expect(r).toHaveProperty('status');
        expect(r).toHaveProperty('durationMs');
        expect(r).toHaveProperty('createdAt');
      }
    });

    test('seed contains exactly 5 runs', async ({ request }) => {
      const body = await request.get(RUNS_URL).then((r) => r.json()) as { total: number };
      expect(body.total).toBe(5);
    });

    test('?reset=true restores the seed data after mutations', async ({ request }) => {
      await request.delete(`${RUNS_URL}/run-001`);
      await request.delete(`${RUNS_URL}/run-002`);

      await request.get(`${RUNS_URL}?reset=true`);

      const body = await request.get(RUNS_URL).then((r) => r.json()) as { total: number; seeded: boolean };
      expect(body.total).toBe(5);
      expect(body.seeded).toBe(true);
    });
  });

  // ── POST /api/practice/runs ───────────────────────────────────────────────

  test.describe('POST /api/practice/runs', () => {
    test('returns HTTP 201 and the created run', async ({ request }) => {
      const response = await request.post(RUNS_URL, {
        data: { name: 'Smoke test', status: 'passed' },
      });
      expect(response.status()).toBe(201);

      const run = await response.json() as Record<string, unknown>;
      expect(run.name).toBe('Smoke test');
      expect(run.status).toBe('passed');
    });

    test('assigns a string id to the new run', async ({ request }) => {
      const run = await request
        .post(RUNS_URL, { data: { name: 'ID test', status: 'passed' } })
        .then((r) => r.json()) as Record<string, unknown>;
      expect(typeof run.id).toBe('string');
      expect((run.id as string).length).toBeGreaterThan(0);
    });

    test('assigns a valid ISO 8601 createdAt timestamp', async ({ request }) => {
      const run = await request
        .post(RUNS_URL, { data: { name: 'Timestamp test', status: 'passed' } })
        .then((r) => r.json()) as Record<string, unknown>;
      expect(typeof run.createdAt).toBe('string');
      expect(() => new Date(run.createdAt as string).toISOString()).not.toThrow();
    });

    test('accepts status: passed', async ({ request }) => {
      const response = await request.post(RUNS_URL, { data: { name: 'T', status: 'passed' } });
      expect(response.status()).toBe(201);
    });

    test('accepts status: failed', async ({ request }) => {
      const response = await request.post(RUNS_URL, { data: { name: 'T', status: 'failed' } });
      expect(response.status()).toBe(201);
    });

    test('accepts status: skipped', async ({ request }) => {
      const response = await request.post(RUNS_URL, { data: { name: 'T', status: 'skipped' } });
      expect(response.status()).toBe(201);
    });

    test('accepts status: pending', async ({ request }) => {
      const response = await request.post(RUNS_URL, { data: { name: 'T', status: 'pending' } });
      expect(response.status()).toBe(201);
    });

    test('durationMs defaults to null when omitted', async ({ request }) => {
      const run = await request
        .post(RUNS_URL, { data: { name: 'No duration', status: 'skipped' } })
        .then((r) => r.json()) as Record<string, unknown>;
      expect(run.durationMs).toBeNull();
    });

    test('stores an explicit durationMs value', async ({ request }) => {
      const run = await request
        .post(RUNS_URL, { data: { name: 'With duration', status: 'passed', durationMs: 4200 } })
        .then((r) => r.json()) as Record<string, unknown>;
      expect(run.durationMs).toBe(4200);
    });

    test('creates a new run visible in the list', async ({ request }) => {
      const created = await request
        .post(RUNS_URL, { data: { name: 'Visible run', status: 'passed' } })
        .then((r) => r.json()) as { id: string };

      const list = await request.get(RUNS_URL).then((r) => r.json()) as { runs: Array<{ id: string }> };
      expect(list.runs.some((r) => r.id === created.id)).toBe(true);
    });

    test('creating a run sets seeded: false', async ({ request }) => {
      await request.post(RUNS_URL, { data: { name: 'Mutation', status: 'failed' } });
      const body = await request.get(RUNS_URL).then((r) => r.json()) as { seeded: boolean };
      expect(body.seeded).toBe(false);
    });

    // ── Validation ────────────────────────────────────────────────────────────

    test('missing name returns 400 with field: name', async ({ request }) => {
      const response = await request.post(RUNS_URL, { data: { status: 'passed' } });
      expect(response.status()).toBe(400);
      const body = await response.json() as { field: string };
      expect(body.field).toBe('name');
    });

    test('empty string name returns 400 with field: name', async ({ request }) => {
      const response = await request.post(RUNS_URL, { data: { name: '', status: 'passed' } });
      expect(response.status()).toBe(400);
      const body = await response.json() as { field: string };
      expect(body.field).toBe('name');
    });

    test('name over 120 characters returns 400 with field: name', async ({ request }) => {
      const response = await request.post(RUNS_URL, {
        data: { name: 'a'.repeat(121), status: 'passed' },
      });
      expect(response.status()).toBe(400);
      const body = await response.json() as { field: string };
      expect(body.field).toBe('name');
    });

    test('name of exactly 120 characters is accepted', async ({ request }) => {
      const response = await request.post(RUNS_URL, {
        data: { name: 'a'.repeat(120), status: 'passed' },
      });
      expect(response.status()).toBe(201);
    });

    test('missing status returns 400 with field: status', async ({ request }) => {
      const response = await request.post(RUNS_URL, { data: { name: 'No status' } });
      expect(response.status()).toBe(400);
      const body = await response.json() as { field: string };
      expect(body.field).toBe('status');
    });

    test('invalid status returns 400 with field: status', async ({ request }) => {
      const response = await request.post(RUNS_URL, {
        data: { name: 'Bad status', status: 'running' },
      });
      expect(response.status()).toBe(400);
      const body = await response.json() as { field: string };
      expect(body.field).toBe('status');
    });

    test('400 body includes an error message', async ({ request }) => {
      const response = await request.post(RUNS_URL, { data: { status: 'passed' } });
      const body = await response.json() as { error: string };
      expect(typeof body.error).toBe('string');
      expect(body.error.length).toBeGreaterThan(0);
    });

    test('non-JSON body returns 400 with field: body', async ({ request }) => {
      const response = await request.post(RUNS_URL, {
        data: 'not-json',
        headers: { 'Content-Type': 'text/plain' },
      });
      expect(response.status()).toBe(400);
    });
  });

  // ── GET /api/practice/runs/[id] ───────────────────────────────────────────

  test.describe('GET /api/practice/runs/[id]', () => {
    test('returns HTTP 200 and the run for a known seed id', async ({ request }) => {
      const response = await request.get(`${RUNS_URL}/run-001`);
      expect(response.status()).toBe(200);

      const run = await response.json() as Record<string, unknown>;
      expect(run.id).toBe('run-001');
      expect(run.name).toBe('Homepage smoke test');
    });

    test('returned run has all required fields', async ({ request }) => {
      const run = await request.get(`${RUNS_URL}/run-001`).then((r) => r.json()) as Record<string, unknown>;
      expect(run).toHaveProperty('id');
      expect(run).toHaveProperty('name');
      expect(run).toHaveProperty('status');
      expect(run).toHaveProperty('durationMs');
      expect(run).toHaveProperty('createdAt');
    });

    test('returns 404 for an unknown id', async ({ request }) => {
      const response = await request.get(`${RUNS_URL}/run-999`);
      expect(response.status()).toBe(404);
    });

    test('404 body includes an error field', async ({ request }) => {
      const body = await request.get(`${RUNS_URL}/run-999`).then((r) => r.json()) as { error: string };
      expect(typeof body.error).toBe('string');
    });

    test('newly created run is retrievable by id', async ({ request }) => {
      const created = await request
        .post(RUNS_URL, { data: { name: 'Retrievable run', status: 'pending' } })
        .then((r) => r.json()) as { id: string };

      const retrieved = await request.get(`${RUNS_URL}/${created.id}`).then((r) => r.json()) as Record<string, unknown>;
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Retrievable run');
    });
  });

  // ── DELETE /api/practice/runs/[id] ───────────────────────────────────────

  test.describe('DELETE /api/practice/runs/[id]', () => {
    test('returns HTTP 204 for a known seed id', async ({ request }) => {
      const response = await request.delete(`${RUNS_URL}/run-001`);
      expect(response.status()).toBe(204);
    });

    test('204 response has no body', async ({ request }) => {
      const response = await request.delete(`${RUNS_URL}/run-002`);
      const text = await response.text();
      expect(text).toBe('');
    });

    test('deleted run is no longer in the list', async ({ request }) => {
      await request.delete(`${RUNS_URL}/run-001`);
      const list = await request.get(RUNS_URL).then((r) => r.json()) as { runs: Array<{ id: string }> };
      expect(list.runs.every((r) => r.id !== 'run-001')).toBe(true);
    });

    test('deleted run returns 404 on subsequent GET', async ({ request }) => {
      await request.delete(`${RUNS_URL}/run-001`);
      const response = await request.get(`${RUNS_URL}/run-001`);
      expect(response.status()).toBe(404);
    });

    test('deleting reduces total by one', async ({ request }) => {
      const before = await request.get(RUNS_URL).then((r) => r.json()) as { total: number };
      await request.delete(`${RUNS_URL}/run-001`);
      const after = await request.get(RUNS_URL).then((r) => r.json()) as { total: number };
      expect(after.total).toBe(before.total - 1);
    });

    test('returns 404 for an unknown id', async ({ request }) => {
      const response = await request.delete(`${RUNS_URL}/run-999`);
      expect(response.status()).toBe(404);
    });

    test('second DELETE on the same id returns 404', async ({ request }) => {
      await request.delete(`${RUNS_URL}/run-001`);
      const response = await request.delete(`${RUNS_URL}/run-001`);
      expect(response.status()).toBe(404);
    });
  });
});

// ─── Network Items API ────────────────────────────────────────────────────────
//
// Read-only; no state mutations. Tests can run in parallel.

const ITEMS_URL = '/api/practice/network/items';

test.describe('Network Items API', () => {
  test.describe('GET /api/practice/network/items', () => {
    test('returns HTTP 200', async ({ request }) => {
      const response = await request.get(ITEMS_URL);
      expect(response.status()).toBe(200);
    });

    test('response body has items, total, and fetchedAt fields', async ({ request }) => {
      const body = await request.get(ITEMS_URL).then((r) => r.json());
      expect(body).toHaveProperty('items');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('fetchedAt');
      expect(Array.isArray(body.items)).toBe(true);
    });

    test('total equals items.length', async ({ request }) => {
      const body = await request.get(ITEMS_URL).then((r) => r.json()) as { items: unknown[]; total: number };
      expect(body.total).toBe(body.items.length);
    });

    test('returns all 8 support tickets', async ({ request }) => {
      const body = await request.get(ITEMS_URL).then((r) => r.json()) as { total: number };
      expect(body.total).toBe(8);
    });

    test('fetchedAt is a valid ISO 8601 string', async ({ request }) => {
      const body = await request.get(ITEMS_URL).then((r) => r.json()) as { fetchedAt: string };
      expect(typeof body.fetchedAt).toBe('string');
      expect(() => new Date(body.fetchedAt).toISOString()).not.toThrow();
    });

    test('fetchedAt reflects approximately the request time', async ({ request }) => {
      const before = Date.now();
      const body = await request.get(ITEMS_URL).then((r) => r.json()) as { fetchedAt: string };
      const after = Date.now();

      const fetchedAt = new Date(body.fetchedAt).getTime();
      expect(fetchedAt).toBeGreaterThanOrEqual(before - 1000);
      expect(fetchedAt).toBeLessThanOrEqual(after + 1000);
    });

    test('each ticket has id, title, status, priority, category, assignee, and created', async ({ request }) => {
      const body = await request.get(ITEMS_URL).then((r) => r.json()) as { items: unknown[] };
      for (const item of body.items) {
        const t = item as Record<string, unknown>;
        expect(t).toHaveProperty('id');
        expect(t).toHaveProperty('title');
        expect(t).toHaveProperty('status');
        expect(t).toHaveProperty('priority');
        expect(t).toHaveProperty('category');
        expect(t).toHaveProperty('assignee');
        expect(t).toHaveProperty('created');
      }
    });

    test('ticket statuses are valid enum values', async ({ request }) => {
      const body = await request.get(ITEMS_URL).then((r) => r.json()) as { items: Array<{ status: string }> };
      const validStatuses = new Set(['open', 'in-progress', 'resolved', 'closed']);
      for (const item of body.items) {
        expect(validStatuses).toContain(item.status);
      }
    });

    test('ticket priorities are valid enum values', async ({ request }) => {
      const body = await request.get(ITEMS_URL).then((r) => r.json()) as { items: Array<{ priority: string }> };
      const validPriorities = new Set(['low', 'medium', 'high', 'critical']);
      for (const item of body.items) {
        expect(validPriorities).toContain(item.priority);
      }
    });

    test('includes the known seed ticket T-001', async ({ request }) => {
      const body = await request.get(ITEMS_URL).then((r) => r.json()) as { items: Array<{ id: string; title: string }> };
      const t001 = body.items.find((t) => t.id === 'T-001');
      expect(t001).toBeDefined();
      expect(t001?.title).toBe('Login page throws 500 on mobile Safari');
    });

    test('unknown query params do not trigger error mode', async ({ request }) => {
      const response = await request.get(`${ITEMS_URL}?scenario=unknown`);
      expect(response.status()).toBe(200);
    });
  });

  test.describe('GET /api/practice/network/items?scenario=error', () => {
    test('returns HTTP 503', async ({ request }) => {
      const response = await request.get(`${ITEMS_URL}?scenario=error`);
      expect(response.status()).toBe(503);
    });

    test('error body has error and code fields', async ({ request }) => {
      const body = await request.get(`${ITEMS_URL}?scenario=error`).then((r) => r.json());
      expect(body).toHaveProperty('error');
      expect(body).toHaveProperty('code');
    });

    test('error body code matches the HTTP status', async ({ request }) => {
      const body = await request.get(`${ITEMS_URL}?scenario=error`).then((r) => r.json()) as { code: number };
      expect(body.code).toBe(503);
    });

    test('error body has a non-empty error message', async ({ request }) => {
      const body = await request.get(`${ITEMS_URL}?scenario=error`).then((r) => r.json()) as { error: string };
      expect(typeof body.error).toBe('string');
      expect(body.error.length).toBeGreaterThan(0);
    });
  });
});

// ─── WebSocket Placeholder API ────────────────────────────────────────────────
//
// Confirms the route exists and signals the WebSocket upgrade protocol.

const WS_URL = '/api/practice/websockets';

test.describe('WebSocket Placeholder API', () => {
  test.describe('GET /api/practice/websockets', () => {
    test('returns HTTP 426 Upgrade Required', async ({ request }) => {
      const response = await request.get(WS_URL);
      expect(response.status()).toBe(426);
    });

    test('response includes Upgrade: WebSocket header', async ({ request }) => {
      const response = await request.get(WS_URL);
      expect(response.headers()['upgrade']).toMatch(/websocket/i);
    });

    test('response includes Connection: Upgrade header', async ({ request }) => {
      const response = await request.get(WS_URL);
      expect(response.headers()['connection']).toMatch(/upgrade/i);
    });

    test('response body is a plain text explanation', async ({ request }) => {
      const text = await request.get(WS_URL).then((r) => r.text());
      expect(text.length).toBeGreaterThan(0);
    });
  });
});
