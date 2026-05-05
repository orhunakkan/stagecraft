import { expect, test } from '@playwright/test';

const RUNS_URL = '/api/practice/runs';

// The entire spec is serial because all tests share a single in-memory store
// on the dev server. Running tests in parallel would cause resets from one
// test to corrupt the state of another.
test.describe.configure({ mode: 'serial' });

// Reset the store before every test that touches real API state.
test.beforeEach(async ({ request }) => {
  await request.get(`${RUNS_URL}?reset=true`);
});

test.describe('API Request Testing lab — page', () => {
  test('page loads with correct title and heading', async ({ page }) => {
    await page.goto('/practice/api-request-testing');

    await expect(page).toHaveTitle(/API Request Testing Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: /api request testing lab/i }),
    ).toBeVisible();
  });

  test('run registry table is visible on load', async ({ page }) => {
    await page.goto('/practice/api-request-testing');

    await expect(
      page.getByRole('table', { name: /test run registry/i }),
    ).toBeVisible();
  });

  test('seeded runs appear in the table', async ({ page }) => {
    await page.goto('/practice/api-request-testing');

    const table = page.getByRole('table', { name: /test run registry/i });
    await expect(table).toBeVisible();
    await expect(table.getByRole('cell', { name: 'Homepage smoke test', exact: true })).toBeVisible();
    await expect(table.getByRole('cell', { name: 'Cart total calculation', exact: true })).toBeVisible();
  });

  test('each row has an accessible delete button', async ({ page }) => {
    await page.goto('/practice/api-request-testing');

    await expect(page.getByRole('table', { name: /test run registry/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /delete homepage smoke test/i }),
    ).toBeVisible();
  });

  test('clicking delete removes the run from the table', async ({ page }) => {
    await page.goto('/practice/api-request-testing');

    await expect(page.getByRole('table')).toBeVisible();
    await page.getByRole('button', { name: /delete login form validation/i }).click();

    // After deletion the row should disappear
    await expect(
      page.getByRole('cell', { name: 'Login form validation', exact: true }),
    ).not.toBeVisible();
  });

  test('add-run form creates a run visible in the table', async ({ page }) => {
    await page.goto('/practice/api-request-testing');

    await page.getByLabel(/name/i).fill('Checkout accessibility test');
    await page.getByRole('button', { name: /add run/i }).click();

    const table = page.getByRole('table', { name: /test run registry/i });
    await expect(
      table.getByRole('cell', { name: 'Checkout accessibility test', exact: true }),
    ).toBeVisible();
  });

  test('API reference panel shows all four endpoints', async ({ page }) => {
    await page.goto('/practice/api-request-testing');

    const list = page.getByRole('list', { name: /available api endpoints/i });
    await expect(list).toBeVisible();
    await expect(list.getByText('/api/practice/runs').first()).toBeVisible();
    await expect(list.getByText('/api/practice/runs/{id}').first()).toBeVisible();
  });

  test('challenge detail page links to this lab', async ({ page }) => {
    await page.goto('/challenges/api-request-testing');
    await page.getByRole('link', { name: /open api request testing lab/i }).click();
    await expect(page).toHaveURL('/practice/api-request-testing');
  });
});

test.describe('API Request Testing lab — request fixture', () => {
  test('GET /api/practice/runs returns 200 with runs array and total', async ({ request }) => {
    const response = await request.get(RUNS_URL);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('runs');
    expect(body).toHaveProperty('total');
    expect(Array.isArray(body.runs)).toBe(true);
    expect(body.total).toBe(body.runs.length);
  });

  test('GET returns seeded flag true on fresh store', async ({ request }) => {
    const response = await request.get(RUNS_URL);
    const body = await response.json();
    expect(body.seeded).toBe(true);
  });

  test('GET run list includes the expected seed run shape', async ({ request }) => {
    const response = await request.get(RUNS_URL);
    const body = (await response.json()) as { runs: Array<Record<string, unknown>> };
    const first = body.runs[0];

    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('status');
    expect(first).toHaveProperty('durationMs');
    expect(first).toHaveProperty('createdAt');
  });

  test('POST creates a run and returns 201 with the new run', async ({ request }) => {
    const response = await request.post(RUNS_URL, {
      data: { name: 'E2E smoke test', status: 'passed' },
    });

    expect(response.status()).toBe(201);
    const run = (await response.json()) as Record<string, unknown>;
    expect(run.name).toBe('E2E smoke test');
    expect(run.status).toBe('passed');
    expect(typeof run.id).toBe('string');
    expect(typeof run.createdAt).toBe('string');
  });

  test('created run appears in subsequent GET', async ({ request }) => {
    const createResponse = await request.post(RUNS_URL, {
      data: { name: 'Unique run for GET test', status: 'skipped' },
    });
    const created = (await createResponse.json()) as { id: string };

    const listResponse = await request.get(RUNS_URL);
    const body = (await listResponse.json()) as { runs: Array<{ id: string }> };
    expect(body.runs.some((r) => r.id === created.id)).toBe(true);
  });

  test('POST with missing name returns 400 with field: name', async ({ request }) => {
    const response = await request.post(RUNS_URL, {
      data: { status: 'passed' },
    });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as { field: string };
    expect(body.field).toBe('name');
  });

  test('POST with invalid status returns 400 with field: status', async ({ request }) => {
    const response = await request.post(RUNS_URL, {
      data: { name: 'Bad status', status: 'invalid' },
    });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as { field: string };
    expect(body.field).toBe('status');
  });

  test('GET /api/practice/runs/[id] returns a single run', async ({ request }) => {
    const response = await request.get(`${RUNS_URL}/run-001`);

    expect(response.status()).toBe(200);
    const run = (await response.json()) as { id: string; name: string };
    expect(run.id).toBe('run-001');
    expect(run.name).toBe('Homepage smoke test');
  });

  test('GET /api/practice/runs/[id] returns 404 for unknown id', async ({ request }) => {
    const response = await request.get(`${RUNS_URL}/run-999`);
    expect(response.status()).toBe(404);
  });

  test('DELETE removes a run and returns 204', async ({ request }) => {
    const response = await request.delete(`${RUNS_URL}/run-001`);
    expect(response.status()).toBe(204);

    // Verify the run is gone
    const getResponse = await request.get(`${RUNS_URL}/run-001`);
    expect(getResponse.status()).toBe(404);
  });

  test('DELETE non-existent run returns 404', async ({ request }) => {
    const response = await request.delete(`${RUNS_URL}/run-999`);
    expect(response.status()).toBe(404);
  });

  test('hybrid: create via API then verify in UI table', async ({ page, request }) => {
    // Seed a known run via API before navigating.
    const createResponse = await request.post(RUNS_URL, {
      data: { name: 'Hybrid API-plus-UI run', status: 'passed', durationMs: 999 },
    });
    expect(createResponse.status()).toBe(201);

    // Navigate to the lab — the UI fetches from the same in-memory store.
    await page.goto('/practice/api-request-testing');

    const table = page.getByRole('table', { name: /test run registry/i });
    await expect(table).toBeVisible();
    await expect(
      table.getByRole('cell', { name: 'Hybrid API-plus-UI run', exact: true }),
    ).toBeVisible();
  });
});
