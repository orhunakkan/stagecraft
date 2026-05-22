import { test, expect } from '@playwright/test';

let readyLabCount = 0;
let comingSoonLabCount = 0;

test.describe('Home page', () => {
  test.beforeAll(async () => {
    const { labs } = await import('../client/src/labs/index.js');
    readyLabCount = labs.filter((lab) => lab.status === 'ready').length;
    comingSoonLabCount = labs.filter((lab) => lab.status === 'coming-soon').length;
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the Practice Labs heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Practice Labs', level: 1 })).toBeVisible();
  });

  test('ready labs section contains every ready lab card', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Ready labs' });
    await expect(section.getByRole('article')).toHaveCount(readyLabCount);
  });

  test('coming soon section contains every coming soon lab card', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Coming soon labs' });
    await expect(section.getByRole('article')).toHaveCount(comingSoonLabCount);
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
