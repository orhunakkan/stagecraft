import { expect, test } from '@playwright/test';

test.describe('Network API lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/network-api');
  });

  test('page loads with correct title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Network API Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: /network api lab/i }),
    ).toBeVisible();
  });

  // ─── Initial load ──────────────────────────────────────────────────────────

  // Auto-waiting: toBeVisible() waits for loading to complete and data to appear
  test('ticket table is visible after the initial load', async ({ page }) => {
    await expect(page.getByRole('table', { name: /support tickets/i })).toBeVisible();
  });

  // Verify column headers are accessible by role
  test('table has the expected column headers', async ({ page }) => {
    await expect(page.getByRole('table', { name: /support tickets/i })).toBeVisible();

    const table = page.getByRole('table');
    await expect(table.getByRole('columnheader', { name: /id/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /title/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /status/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /priority/i })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: /assignee/i })).toBeVisible();
  });

  // Row-scoped locator: target a row by its accessible name (ticket title)
  test('each ticket row is locatable by its title', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();

    await expect(
      page.getByRole('row', { name: /login page throws 500 on mobile safari/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('row', { name: /password reset email not delivered/i }),
    ).toBeVisible();
  });

  // Row-scoped assertion: status badge is inside the specific row
  test('ticket row shows a status badge scoped to that row', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();

    const criticalRow = page.getByRole('row', {
      name: /login page throws 500 on mobile safari/i,
    });
    await expect(criticalRow.getByText('Open')).toBeVisible();
    await expect(criticalRow.getByText('Critical')).toBeVisible();
  });

  // Timestamp appears after data loads
  test('last fetched timestamp is visible after data loads', async ({ page }) => {
    await expect(page.getByText(/last fetched/i)).toBeVisible();
  });

  // ─── Request observation ────────────────────────────────────────────────────

  // page.waitForResponse: wait for the API response explicitly
  test('initial load triggers a GET request to the tickets endpoint', async ({ page }) => {
    // Navigate fresh, observing the request as it happens
    const responsePromise = page.waitForResponse('/api/practice/network/items');
    await page.goto('/practice/network-api');
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(response.url()).toContain('/api/practice/network/items');
  });

  test('GET /api/practice/network/items returns items and fetchedAt fields', async ({
    request,
  }) => {
    const response = await request.get('/api/practice/network/items');
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('fetchedAt');
    expect(body).toHaveProperty('total');
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeGreaterThan(0);
  });

  // ─── Refresh ───────────────────────────────────────────────────────────────

  // page.waitForResponse: explicit network wait tied to a UI action
  test('Refresh sends a new GET request and shows the table again', async ({ page }) => {
    // Wait for the initial load to complete
    await expect(page.getByRole('table', { name: /support tickets/i })).toBeVisible();

    // Set up the response waiter before clicking
    const refreshResponse = page.waitForResponse('/api/practice/network/items');
    await page.getByRole('button', { name: /refresh ticket list/i }).click();

    const response = await refreshResponse;
    expect(response.status()).toBe(200);

    // Table is still visible after refresh
    await expect(page.getByRole('table', { name: /support tickets/i })).toBeVisible();
  });

  test('Refresh button is disabled while a request is in flight', async ({ page }) => {
    let releaseResponse: () => void = () => undefined;
    let markRequestStarted: () => void = () => undefined;
    const requestStarted = new Promise<void>((resolve) => {
      markRequestStarted = resolve;
    });
    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });

    await page.route('/api/practice/network/items', async (route) => {
      markRequestStarted();
      await responseGate;
      await route.continue();
    });

    const navigation = page.goto('/practice/network-api');
    await requestStarted;

    await expect(page.getByRole('button', { name: /refresh ticket list/i })).toBeDisabled();

    releaseResponse();
    await navigation;
    await expect(page.getByRole('table', { name: /support tickets/i })).toBeVisible();
    await page.unrouteAll({ behavior: 'wait' });
  });

  // ─── Error simulation ──────────────────────────────────────────────────────

  // Clicking "Simulate error response" sends ?scenario=error → 503 → error state
  test('Simulate error response shows the error state', async ({ page }) => {
    await expect(page.getByRole('table', { name: /support tickets/i })).toBeVisible();

    await page.getByRole('button', { name: /simulate error response/i }).click();

    // Playwright auto-waits for the error alert to appear
    // Scope to avoid the Next.js route announcer
    const content = page.getByRole('main');
    await expect(content.getByRole('alert')).toBeVisible();
    await expect(page.getByText(/service temporarily unavailable/i)).toBeVisible();
  });

  test('error simulation request includes ?scenario=error', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();

    const errorResponsePromise = page.waitForResponse((res) =>
      res.url().includes('scenario=error'),
    );
    await page.getByRole('button', { name: /simulate error response/i }).click();

    const errorResponse = await errorResponsePromise;
    expect(errorResponse.status()).toBe(503);
  });

  // ─── Route mocking practice ────────────────────────────────────────────────

  // page.route: intercept and replace the API response with controlled data
  test('route mock — injected response data appears in the UI', async ({ page }) => {
    const controlledItem = {
      id: 'T-999',
      title: 'Controlled test ticket',
      status: 'open',
      priority: 'low',
      category: 'Test',
      assignee: 'Test User',
      created: '2025-01-01',
    };

    await page.route('/api/practice/network/items', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [controlledItem],
          fetchedAt: new Date().toISOString(),
          total: 1,
        }),
      });
    });

    await page.goto('/practice/network-api');

    await expect(
      page.getByRole('row', { name: /controlled test ticket/i }),
    ).toBeVisible();
  });

  // ─── Error recovery ────────────────────────────────────────────────────────

  test('Retry button recovers from error state to ticket table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();

    // Trigger error
    await page.getByRole('button', { name: /simulate error response/i }).click();
    const content = page.getByRole('main');
    await expect(content.getByRole('alert')).toBeVisible();

    // Retry should call the normal endpoint and succeed
    await page.getByRole('button', { name: /retry/i }).click();
    await expect(page.getByRole('table', { name: /support tickets/i })).toBeVisible();
  });

  // ─── Challenge navigation ──────────────────────────────────────────────────

  test('challenge detail page links to this lab', async ({ page }) => {
    await page.goto('/challenges/network-api');
    await page.getByRole('link', { name: /open network api lab/i }).click();
    await expect(page).toHaveURL('/practice/network-api');
  });

  // ─── Reset ────────────────────────────────────────────────────────────────

  test('Reset lab re-fetches and restores the ticket table', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();

    // Trigger error to put the lab in a non-default state
    await page.getByRole('button', { name: /simulate error response/i }).click();
    const content = page.getByRole('main');
    await expect(content.getByRole('alert')).toBeVisible();

    // Reset restores the lab (remounts the content component, re-fetches)
    await page.getByRole('button', { name: /reset lab/i }).click();
    await expect(page.getByRole('table', { name: /support tickets/i })).toBeVisible();
  });
});
