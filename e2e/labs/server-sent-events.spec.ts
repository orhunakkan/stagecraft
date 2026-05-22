import { test, expect } from '@playwright/test';

test.describe('Server-Sent Events lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/server-sent-events');
  });

  test('event log is empty before starting stream', async ({ page }) => {
    await expect(page.getByLabel('Empty log message')).toBeVisible();
  });

  test('stream delivers events that appear in the log', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Stream' }).click();

    // Wait until at least 3 entries are visible via expect.poll
    await expect
      .poll(
        async () => {
          return await page.getByLabel('SSE event log').getByRole('listitem').count();
        },
        { timeout: 10_000 },
      )
      .toBeGreaterThanOrEqual(3);
  });

  test('stream includes warn and error event types', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Stream' }).click();

    // Wait for the full stream to complete
    await expect(page.getByLabel('Stream done')).toBeVisible({ timeout: 15_000 });

    await expect(page.getByLabel('warn badge').first()).toBeVisible();
    await expect(page.getByLabel('error badge').first()).toBeVisible();
  });

  test('stop stream halts new entries', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Stream' }).click();

    // Wait for a few events
    await expect
      .poll(async () => page.getByLabel('SSE event log').getByRole('listitem').count(), {
        timeout: 8_000,
      })
      .toBeGreaterThanOrEqual(2);

    await page.getByRole('button', { name: 'Stop Stream' }).click();

    const countBefore = await page.getByLabel('SSE event log').getByRole('listitem').count();
    await page.waitForTimeout(1_000);
    const countAfter = await page.getByLabel('SSE event log').getByRole('listitem').count();
    expect(countAfter).toBe(countBefore);
  });

  test('page.route stubs the SSE stream with controlled events', async ({ page }) => {
    const ssePayload = [
      'event: log\ndata: {"type":"info","message":"Stubbed build started"}\n\n',
      'event: log\ndata: {"type":"warn","message":"Stubbed warning"}\n\n',
      'event: done\ndata: {}\n\n',
    ].join('');

    await page.route('/api/sse', (route) => {
      route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: ssePayload,
      });
    });

    await page.getByRole('button', { name: 'Start Stream' }).click();

    await expect(page.getByLabel('Stream done')).toBeVisible({ timeout: 5_000 });

    const items = page.getByLabel('SSE event log').getByRole('listitem');
    // system "Connecting" + 2 stubbed events + system "Stream complete"
    await expect(items).toHaveCount(4);
    await expect(items.nth(1)).toContainText('Stubbed build started');
    await expect(items.nth(2)).toContainText('Stubbed warning');
  });

  test('SSE response has text/event-stream content-type', async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse('/api/sse'),
      page.getByRole('button', { name: 'Start Stream' }).click(),
    ]);
    expect(response.headers()['content-type']).toContain('text/event-stream');
  });
});
