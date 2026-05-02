import { expect, test } from '@playwright/test';

test.describe('challenge detail page', () => {
  test('renders all required sections for the Accessible Locators challenge', async ({ page }) => {
    await page.goto('/challenges/accessible-locators');

    // Page title
    await expect(page).toHaveTitle(/Accessible Locators Lab — Stagecraft/);

    // Main heading
    await expect(
      page.getByRole('heading', { level: 1, name: 'Accessible Locators Lab' }),
    ).toBeVisible();

    // Metadata badges
    await expect(page.getByText('beginner')).toBeVisible();
    await expect(page.getByText('20 min')).toBeVisible();
    await expect(page.getByText('Accessible locators', { exact: true })).toBeVisible();

    // Content sections
    await expect(page.getByRole('heading', { name: /scenario/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /learning objective/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /instructions/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /acceptance criteria/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /constraints/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /hints/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /playwright concepts/i })).toBeVisible();
  });

  test('practice link is accessible and points to the correct route', async ({ page }) => {
    await page.goto('/challenges/accessible-locators');

    const practiceLink = page.getByRole('link', { name: /open accessible locators lab/i });
    await expect(practiceLink).toBeVisible();
    await expect(practiceLink).toHaveAttribute('href', '/practice/accessible-locators');
  });

  test('breadcrumb link navigates back to the challenge catalog', async ({ page }) => {
    await page.goto('/challenges/accessible-locators');

    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    const catalogLink = breadcrumb.getByRole('link', { name: 'Challenge catalog' });
    await expect(catalogLink).toBeVisible();

    await catalogLink.click();

    await expect(page).toHaveURL('/challenges');
    await expect(page.getByRole('heading', { name: 'Challenge catalog' })).toBeVisible();
  });

  test('renders a different challenge — Network API Lab', async ({ page }) => {
    await page.goto('/challenges/network-api');

    await expect(page.getByRole('heading', { level: 1, name: 'Network API Lab' })).toBeVisible();
    await expect(page.getByText('intermediate')).toBeVisible();
    await expect(page.getByText('35 min')).toBeVisible();

    const practiceLink = page.getByRole('link', { name: /open network api lab/i });
    await expect(practiceLink).toHaveAttribute('href', '/practice/network-api');
  });

  test('challenge card on catalog links to the detail page', async ({ page }) => {
    await page.goto('/challenges');

    const openLink = page
      .getByRole('article', { name: /accessible locators lab/i })
      .getByRole('link', { name: /open accessible locators lab/i });

    await openLink.click();

    await expect(page).toHaveURL('/challenges/accessible-locators');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Accessible Locators Lab' }),
    ).toBeVisible();
  });

  test('shows a friendly not-found page for an unknown challenge id', async ({ page }) => {
    const response = await page.goto('/challenges/does-not-exist');

    // Next.js renders a 404 page with a descriptive heading
    await expect(page.getByRole('heading', { name: /challenge not found/i })).toBeVisible();
    await expect(response?.status()).toBe(404);

    // Back link navigates to catalog
    const backLink = page.getByRole('link', { name: /back to challenge catalog/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL('/challenges');
  });

  test('detail page does not expose complete Playwright solution scripts', async ({ page }) => {
    await page.goto('/challenges/forms-validation');

    const pageText = await page.locator('body').innerText();

    // Should not contain test function signatures that would give away solutions
    expect(pageText).not.toMatch(/\btest\s*\(\s*['"`]/);
    expect(pageText).not.toMatch(/\bexpect\s*\(/);
    expect(pageText).not.toMatch(/await\s+page\.(goto|click|fill|locator)\(/);
    expect(pageText).not.toMatch(/playwright\.config/i);
  });
});
