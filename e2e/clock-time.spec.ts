import { expect, test } from '@playwright/test';

test.describe('Clock and Time Control lab', () => {
  test('page loads with correct title and heading', async ({ page }) => {
    await page.goto('/practice/clock-time');

    await expect(page).toHaveTitle(/Clock and Time Control Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: /clock and time control lab/i }),
    ).toBeVisible();
  });

  // ─── Scenario 1: Live Clock Display ─────────────────────────────────────────

  test('live clock renders a time element with a date/time value', async ({ page }) => {
    await page.goto('/practice/clock-time');

    await expect(page.getByLabel(/current date and time/i)).toBeVisible();
  });

  test('clock install + runFor controls the live clock display', async ({ page }) => {
    // install() with a specific time replaces Date.now() and new Date()
    // for the full page lifetime, including inside setInterval callbacks.
    await page.clock.install({ time: new Date('2024-02-02T10:00:00') });
    await page.goto('/practice/clock-time');

    // Advance the clock by one tick so the setInterval callback fires and
    // the live clock re-renders with the controlled time.
    await page.clock.runFor(1000); // one clockTick

    const clockEl = page.getByLabel(/current date and time/i);
    await expect(clockEl).toBeVisible();
    await expect(clockEl).toContainText('2024-02-02');
  });

  // ─── Scenario 2: Session Countdown ──────────────────────────────────────────

  test('countdown is in idle state on load', async ({ page }) => {
    await page.goto('/practice/clock-time');

    await expect(
      page.getByRole('status', { name: /session countdown not started/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /start countdown/i })).toBeVisible();
  });

  test('countdown shows running state after Start is clicked', async ({ page }) => {
    await page.goto('/practice/clock-time');

    await page.getByRole('button', { name: /start countdown/i }).click();

    await expect(page.getByRole('status', { name: /session expires in/i })).toBeVisible();
    // The initial display shows the full 5 minutes (or one tick behind — use
    // containText so the assertion passes regardless of one elapsed tick).
    await expect(page.getByRole('status', { name: /session expires in/i })).toContainText(':');
  });

  test('fastForward triggers the session expired alert', async ({ page }) => {
    // Install the clock before navigation so all timer globals are controlled.
    await page.clock.install();
    await page.goto('/practice/clock-time');

    await page.getByRole('button', { name: /start countdown/i }).click();
    await expect(page.getByRole('status', { name: /session expires in/i })).toBeVisible();

    await page.clock.fastForward('05:00');

    await expect(
      page.getByRole('alert', { name: /session expired/i }),
    ).toBeVisible();
    await expect(
      page.getByText(/session expired — please sign in again/i),
    ).toBeVisible();
  });

  // ─── Scenario 3: Scheduled Auto-refresh ─────────────────────────────────────

  test('auto-refresh is in idle state on load', async ({ page }) => {
    await page.goto('/practice/clock-time');

    await expect(
      page.getByRole('status', { name: /auto-refresh not started/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /start auto-refresh/i })).toBeVisible();
  });

  test('fastForward twice advances the refresh counter to 2', async ({ page }) => {
    await page.clock.install();
    await page.goto('/practice/clock-time');

    await page.getByRole('button', { name: /start auto-refresh/i }).click();
    await expect(page.getByRole('status', { name: /refreshed 0 times/i })).toBeVisible();

    // First 30-second advance — counter should reach 1.
    await page.clock.fastForward('00:30');
    await expect(page.getByRole('status', { name: /refreshed 1 time/i })).toBeVisible();

    // Second 30-second advance — counter should reach 2.
    await page.clock.fastForward('00:30');
    await expect(page.getByRole('status', { name: /refreshed 2 times/i })).toBeVisible();

    // A last-refreshed timestamp should now be visible.
    await expect(page.locator('time')).toHaveCount(2); // live clock + last-refreshed
  });

  // ─── Reset ───────────────────────────────────────────────────────────────────

  test('reset restores all scenarios to their initial state', async ({ page }) => {
    await page.clock.install();
    await page.goto('/practice/clock-time');

    // Put both scenarios in a non-idle state.
    await page.getByRole('button', { name: /start countdown/i }).click();
    await page.getByRole('button', { name: /start auto-refresh/i }).click();
    await page.clock.fastForward('00:30');

    await expect(page.getByRole('status', { name: /session expires in/i })).toBeVisible();
    await expect(page.getByRole('status', { name: /refreshed 1 time/i })).toBeVisible();

    await page.getByRole('button', { name: /reset lab/i }).click();

    await expect(
      page.getByRole('status', { name: /session countdown not started/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('status', { name: /auto-refresh not started/i }),
    ).toBeVisible();
  });

  // ─── Challenge navigation ────────────────────────────────────────────────────

  test('challenge detail page links to this lab', async ({ page }) => {
    await page.goto('/challenges/clock-time');
    await page.getByRole('link', { name: /open clock and time control lab/i }).click();
    await expect(page).toHaveURL('/practice/clock-time');
  });
});
