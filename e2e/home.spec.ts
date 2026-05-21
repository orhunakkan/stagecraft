import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the Practice Labs heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Practice Labs', level: 1 })).toBeVisible();
  });

  test('ready labs section contains all 25 lab cards', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Ready labs' });
    await expect(section.getByRole('article')).toHaveCount(25);
  });

  test('coming soon section contains no lab cards', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Coming soon labs' });
    await expect(section.getByRole('article')).toHaveCount(0);
  });

  test('clicking a ready lab card navigates to the lab page', async ({ page }) => {
    await page.getByRole('link', { name: /Accessible Locators/i }).click();
    await expect(page).toHaveURL('/practice/accessible-locators');
  });

  test('coming soon lab cards are not links', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Coming soon labs' });
    // No anchors wrapping the coming-soon cards
    await expect(section.getByRole('link')).toHaveCount(0);
  });
});
