import { expect, test } from '@playwright/test';

test.describe('challenge catalog', () => {
  test('lists current challenges and filters by user-facing controls', async ({ page }) => {
    await page.goto('/challenges');

    await expect(page.getByRole('heading', { name: 'Challenge catalog' })).toBeVisible();
    await expect(page.getByText('19 challenges')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Accessible Locators Lab' })).toBeVisible();

    await page.getByRole('searchbox', { name: /search challenges/i }).fill('network');
    await page.getByLabel(/difficulty/i).selectOption('intermediate');
    await page.getByLabel(/primary concept/i).selectOption('Network observation and API mocking');

    await expect(page.getByText('1 challenge')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Network API Lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Accessible Locators Lab' })).toBeHidden();
  });
});
