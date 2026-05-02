import { expect, test } from '@playwright/test';

test.describe('Async UI lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/async-ui');
  });

  test('page loads with correct title and all three scenario sections', async ({ page }) => {
    await expect(page).toHaveTitle(/Async UI Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: /async ui lab/i }),
    ).toBeVisible();

    await expect(page.getByRole('region', { name: /basic success flow/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /retry error flow/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /staged updates flow/i })).toBeVisible();
  });

  // getByRole('status') — idle state is announced via role=status
  test('all three scenarios start in idle state', async ({ page }) => {
    await expect(page.getByText(/workflow not started/i)).toBeVisible();
    await expect(page.getByText(/retry flow not started/i)).toBeVisible();
    await expect(page.getByText(/staged flow not started/i)).toBeVisible();
  });

  // ─── Scenario 1: Basic Success ─────────────────────────────────────────────

  // Web-first assertion: toBeVisible() auto-waits for loading state to appear
  test('basic success — loading state is visible after clicking Start', async ({ page }) => {
    await page.getByRole('button', { name: /start basic success workflow/i }).click();

    // Auto-waits for the role=status element with the loading label to appear
    await expect(
      page.getByRole('status', { name: /loading workflow data/i }),
    ).toBeVisible();
  });

  // Web-first assertion: toBeVisible() auto-waits until success state replaces loading
  test('basic success — success state appears without a fixed sleep', async ({ page }) => {
    await page.getByRole('button', { name: /start basic success workflow/i }).click();

    // Playwright auto-waits here — no page.waitForTimeout needed
    await expect(page.getByText(/workflow complete/i)).toBeVisible();
  });

  // Asserting list items in success state — getByRole('list') + getByText
  test('basic success — success state exposes a list of processed items', async ({ page }) => {
    await page.getByRole('button', { name: /start basic success workflow/i }).click();

    const list = page.getByRole('list', { name: /processed items/i });
    await expect(list).toBeVisible();
    await expect(list.getByText(/report generated/i)).toBeVisible();
    await expect(list.getByText(/notifications sent/i)).toBeVisible();
    await expect(list.getByText(/log entry saved/i)).toBeVisible();
  });

  // ─── Scenario 2: Retry Error ───────────────────────────────────────────────

  // getByRole('status') while loading
  test('retry error — loading state is visible after clicking Start', async ({ page }) => {
    await page.getByRole('button', { name: /start retry error flow/i }).click();

    await expect(
      page.getByRole('status', { name: /connecting to service/i }),
    ).toBeVisible();
  });

  // getByRole('alert') — error state uses role=alert so it is announced immediately
  test('retry error — error alert appears after the loading delay', async ({ page }) => {
    await page.getByRole('button', { name: /start retry error flow/i }).click();

    // Scope to the scenario section to avoid the Next.js route announcer alert
    const retrySection = page.getByRole('region', { name: /retry error flow/i });

    // Playwright auto-waits for the alert to appear
    await expect(retrySection.getByRole('alert')).toBeVisible();
    await expect(retrySection.getByRole('alert')).toContainText(/connection failed \(simulated\)/i);
  });

  // Retry button is the only way to advance past the error state
  test('retry error — Retry button is visible in the error state', async ({ page }) => {
    await page.getByRole('button', { name: /start retry error flow/i }).click();
    const retrySection = page.getByRole('region', { name: /retry error flow/i });
    await expect(retrySection.getByRole('alert')).toBeVisible();

    await expect(page.getByRole('button', { name: /retry connection/i })).toBeVisible();
  });

  // Full retry-error flow: start → error → retry → success
  test('retry error — clicking Retry resolves to a success state', async ({ page }) => {
    await page.getByRole('button', { name: /start retry error flow/i }).click();

    // Wait for the error state
    await expect(page.getByRole('button', { name: /retry connection/i })).toBeVisible();

    // Retry: clicking the button is both an action and proof the error appeared
    await page.getByRole('button', { name: /retry connection/i }).click();

    // Playwright auto-waits for the success text
    await expect(page.getByText(/connection restored after 1 retry attempt/i)).toBeVisible();
  });

  // ─── Scenario 3: Staged Updates ───────────────────────────────────────────

  // getByRole('status') while loading
  test('staged updates — loading state is visible after clicking Start', async ({ page }) => {
    await page.getByRole('button', { name: /start staged updates flow/i }).click();

    await expect(
      page.getByRole('status', { name: /initializing pipeline/i }),
    ).toBeVisible();
  });

  // Assert the partial state — 2 of 4 items visible
  test('staged updates — partial state shows 2 of 4 stages', async ({ page }) => {
    await page.getByRole('button', { name: /start staged updates flow/i }).click();

    // Auto-waits for the partial status to appear
    await expect(page.getByText(/loading more… \(2 of 4 items\)/i)).toBeVisible();

    const partialList = page.getByRole('list', { name: /pipeline stages loaded so far/i });
    await expect(partialList.getByText(/stage 1: authentication verified/i)).toBeVisible();
    await expect(partialList.getByText(/stage 2: data validated/i)).toBeVisible();
  });

  // Assert all four stages in the success state
  test('staged updates — success state shows all 4 stages', async ({ page }) => {
    await page.getByRole('button', { name: /start staged updates flow/i }).click();

    await expect(page.getByText(/pipeline complete \(4 of 4 items\)/i)).toBeVisible({
      timeout: 10_000,
    });

    const allList = page.getByRole('list', { name: /pipeline stages/i });
    await expect(allList.getByText(/stage 3: report generated/i)).toBeVisible();
    await expect(allList.getByText(/stage 4: notifications sent/i)).toBeVisible();
  });

  // ─── Challenge catalog link ────────────────────────────────────────────────

  test('challenge detail page links to this lab', async ({ page }) => {
    await page.goto('/challenges/async-ui');
    await page.getByRole('link', { name: /open async ui lab/i }).click();
    await expect(page).toHaveURL('/practice/async-ui');
  });

  // ─── Reset ────────────────────────────────────────────────────────────────

  test('Reset lab restores all scenarios to idle', async ({ page }) => {
    // Advance basic-success to completion
    await page.getByRole('button', { name: /start basic success workflow/i }).click();
    await expect(page.getByText(/workflow complete/i)).toBeVisible();

    await page.getByRole('button', { name: /reset lab/i }).click();

    // All idle texts should be visible again
    await expect(page.getByText(/workflow not started/i)).toBeVisible();
    await expect(page.getByText(/retry flow not started/i)).toBeVisible();
    await expect(page.getByText(/staged flow not started/i)).toBeVisible();
  });
});
