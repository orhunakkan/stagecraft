import { expect, test } from '@playwright/test';

test.describe('Page Object Model lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/page-objects');
  });

  test('page loads with correct title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Page Object Model Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: /page object model lab/i }),
    ).toBeVisible();
  });

  test('shows the concept practice badge', async ({ page }) => {
    await expect(page.getByText('Concept practice').first()).toBeVisible();
  });

  test('renders the four practice prompts', async ({ page }) => {
    const list = page.getByRole('list', { name: /page object model practice prompts/i });
    await expect(list).toBeVisible();
    await expect(list.getByRole('listitem')).toHaveCount(4);
  });

  test('renders all five concept sections', async ({ page }) => {
    const expectedHeadings = [
      /when to use page objects/i,
      /encapsulating locators/i,
      /composing actions/i,
      /combining pom with fixtures/i,
      /naming and file organisation/i,
    ];

    for (const name of expectedHeadings) {
      await expect(page.getByRole('heading', { name })).toBeVisible();
    }
  });

  test('each concept section has a checklist', async ({ page }) => {
    const checklists = page.getByRole('list', { name: /checklist/i });
    await expect(checklists).toHaveCount(5);
  });

  test('breadcrumb links are accessible', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /challenge catalog/i }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /page object model lab/i }),
    ).toBeVisible();
  });

  test('breadcrumb challenge link navigates to the challenge detail', async ({ page }) => {
    await page.getByRole('link', { name: /page object model lab/i }).click();
    await expect(page).toHaveURL('/challenges/page-objects');
  });

  test('challenge detail page links to this concept lab', async ({ page }) => {
    await page.goto('/challenges/page-objects');
    await page.getByRole('link', { name: /open page object model lab/i }).click();
    await expect(page).toHaveURL('/practice/page-objects');
  });
});
