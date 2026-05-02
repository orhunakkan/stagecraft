import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('introduces Stagecraft as a Playwright practice app', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Stagecraft/);
    await expect(page.getByRole('heading', { name: 'Stagecraft' })).toBeVisible();
    await expect(
      page.getByText(/practice modern playwright test automation skills/i),
    ).toBeVisible();
  });
});
