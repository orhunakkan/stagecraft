import { expect, test } from '@playwright/test';

test.describe('Clock & Timers lab', () => {
    test('renders a fixed current date when browser time is controlled', async ({ page }) => {
        await page.clock.install({ time: new Date('2026-01-15T12:00:00') });
        await page.goto('/practice/clock-timers');

        await expect(page.getByTestId('current-date')).toHaveText('Thursday, January 15, 2026');
    });

    test('fast-forwards a countdown timer to expiration and resets', async ({ page }) => {
        await page.clock.install();
        await page.goto('/practice/clock-timers');

        await page.getByRole('button', { name: 'Start' }).first().click();
        await page.clock.runFor(60_000);

        await expect(page.getByTestId('countdown')).toHaveText('00:00');
        await expect(page.getByRole('alert')).toContainText("Time's up!");

        await page.getByRole('button', { name: 'Reset' }).first().click();
        await expect(page.getByTestId('countdown')).toHaveText('01:00');
    });

    test('pausing the countdown stops it from progressing', async ({ page }) => {
        await page.clock.install();
        await page.goto('/practice/clock-timers');

        await page.getByRole('button', { name: 'Start' }).first().click();
        await page.clock.runFor(10_000);
        await page.getByRole('button', { name: 'Pause' }).click();
        await page.clock.runFor(10_000);

        await expect(page.getByTestId('countdown')).toHaveText('00:50');
    });

    test('session toast appears after the 5s delay and counts down', async ({ page }) => {
        await page.clock.install();
        await page.goto('/practice/clock-timers');

        await page.getByTestId('start-session').click();
        await page.clock.runFor(5_000);

        await expect(page.getByTestId('expiry-toast')).toBeVisible();
        const countdown = page.getByTestId('expiry-countdown');
        const start = Number((await countdown.textContent())?.replace('s', '') ?? 0);
        expect(start).toBeGreaterThan(0);

        await page.clock.runFor(1_000);
        await expect
            .poll(async () => Number((await countdown.textContent())?.replace('s', '') ?? 0))
            .toBeLessThan(start);
    });

    test('polling component increments after 30 seconds', async ({ page }) => {
        await page.clock.install();
        await page.goto('/practice/clock-timers');

        await expect(page.getByTestId('refresh-count')).toHaveText('Refresh #0');
        await page.clock.fastForward(30_000);
        await expect(page.getByTestId('refresh-count')).toHaveText('Refresh #1');
    });
});
