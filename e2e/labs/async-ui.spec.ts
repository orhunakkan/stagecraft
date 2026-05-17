import { test, expect } from '@playwright/test';

test.describe('Async UI lab', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/practice/async-ui');
    });

    test('stock ticker displays a price on load', async ({ page }) => {
        await expect(page.getByTestId('stock-price')).toBeVisible();
        await expect(page.getByTestId('stock-price')).toContainText('$');
    });

    test('stock price updates over time', async ({ page }) => {
        const initial = await page.getByTestId('stock-price').textContent();
        // Wait for at least two polling cycles (2 s each)
        await expect
            .poll(() => page.getByTestId('stock-price').textContent(), { timeout: 8000 })
            .not.toBe(initial);
    });

    test('Load articles shows a spinner then renders articles', async ({ page }) => {
        await page.getByRole('button', { name: 'Load articles' }).click();
        // Spinner appears immediately
        await expect(page.getByRole('status', { name: 'Loading articles' })).toBeVisible();
        // After ~1.5 s the articles arrive
        await expect(page.getByRole('article').first()).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('status', { name: 'Loading articles' })).not.toBeVisible();
    });

    test('Load articles renders all 4 fake articles', async ({ page }) => {
        await page.getByRole('button', { name: 'Load articles' }).click();
        await expect(page.getByRole('article')).toHaveCount(4, { timeout: 5000 });
    });

    test('Load with error shows an error alert with a Retry button', async ({ page }) => {
        await page.getByRole('button', { name: 'Load with error' }).click();
        await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('alert')).toContainText('Failed to load articles');
        await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
    });

    test('Retry after error successfully loads articles', async ({ page }) => {
        await page.getByRole('button', { name: 'Load with error' }).click();
        await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: 'Retry' }).click();
        await expect(page.getByRole('article').first()).toBeVisible({ timeout: 5000 });
    });

    test('Trigger notification shows a toast after a short delay', async ({ page }) => {
        await page.getByRole('button', { name: 'Trigger notification' }).click();
        await expect(page.getByRole('alert', { name: /notification/i })).not.toBeVisible();
        // Toast appears after ~800 ms
        await expect(page.getByRole('alert').filter({ hasText: 'Notification sent' })).toBeVisible({
            timeout: 3000,
        });
    });

    test('Dismiss notification hides the toast', async ({ page }) => {
        await page.getByRole('button', { name: 'Trigger notification' }).click();
        const toast = page.getByRole('alert').filter({ hasText: 'Notification sent' });
        await expect(toast).toBeVisible({ timeout: 3000 });
        await page.getByRole('button', { name: 'Dismiss notification' }).click();
        await expect(toast).not.toBeVisible();
    });
});
