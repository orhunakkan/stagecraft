import { expect, test } from '@playwright/test';

test.describe('theme toggle', () => {
  test('persists the selected theme across reloads', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /switch to dark theme/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: /switch to light theme/i })).toBeVisible();
  });
});
