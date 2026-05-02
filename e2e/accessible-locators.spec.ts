import { expect, test } from '@playwright/test';

test.describe('Accessible Locators lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/accessible-locators');
  });

  test('page loads with title and lab heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Accessible Locators Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Accessible Locators Lab' }),
    ).toBeVisible();
  });

  // getByRole('alert') practice
  test('notification alert is present and dismissible', async ({ page }) => {
    const alert = page.getByRole('alert', { name: /practice tip/i });
    await expect(alert).toBeVisible();

    await page.getByRole('button', { name: /dismiss notification/i }).click();

    await expect(page.getByRole('alert', { name: /practice tip/i })).toBeHidden();
  });

  // getByRole('navigation') practice
  test('site navigation is reachable by role and accessible name', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: /site navigation/i });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Features' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();
  });

  // getByRole('heading') at multiple levels
  test('headings are locatable by role and level', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /build resilient test automation/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /why accessible locators/i })).toBeVisible();

    // Three feature cards each with h3
    const featureHeadings = page.getByRole('heading', { level: 3 });
    await expect(featureHeadings).toHaveCount(3);
  });

  // getByAltText() practice
  test('image is locatable by its alt text', async ({ page }) => {
    await expect(page.getByAltText(/diagram showing/i)).toBeVisible();
  });

  // getByRole('button', { name }) practice — primary CTA
  test('Start demo button is locatable by role and name', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Start demo' })).toBeVisible();
  });

  // State change after interaction — getByRole('status') practice
  test('clicking Start demo shows a message in the status region', async ({ page }) => {
    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeEmpty();

    await page.getByRole('button', { name: 'Start demo' }).click();

    await expect(statusRegion).toContainText(/demo activated/i);
  });

  // getByRole('link') for secondary link
  test('secondary View features link is locatable by role and name', async ({ page }) => {
    await expect(page.getByRole('link', { name: /view features/i })).toBeVisible();
  });

  // getByRole('contentinfo') and getByTitle() practice
  test('footer is present and settings button has a title attribute', async ({ page }) => {
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();

    const settingsButton = page.getByTitle('Customize lab preferences');
    await expect(settingsButton).toBeVisible();
    await expect(settingsButton).toHaveRole('button');
  });

  // Reset lab restores initial state
  test('Reset lab button restores the lab to its initial state', async ({ page }) => {
    // Activate demo and dismiss notification
    await page.getByRole('button', { name: 'Start demo' }).click();
    await expect(page.getByRole('status')).toContainText(/demo activated/i);

    await page.getByRole('button', { name: /dismiss notification/i }).click();
    await expect(page.getByRole('alert', { name: /practice tip/i })).toBeHidden();

    // Reset
    await page.getByRole('button', { name: /reset lab/i }).click();

    // Initial state restored
    await expect(page.getByRole('status')).toBeEmpty();
    await expect(page.getByRole('alert', { name: /practice tip/i })).toBeVisible();
  });

  // Breadcrumb back to challenge detail
  test('breadcrumb links back to the challenge detail and catalog', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumb.getByRole('link', { name: 'Challenge catalog' })).toHaveAttribute(
      'href',
      '/challenges',
    );
    await expect(
      breadcrumb.getByRole('link', { name: 'Accessible Locators Lab' }),
    ).toHaveAttribute('href', '/challenges/accessible-locators');
  });

  // Practice link on challenge detail routes to this lab
  test('challenge detail page links to this practice lab', async ({ page }) => {
    await page.goto('/challenges/accessible-locators');

    const practiceLink = page.getByRole('link', { name: /open accessible locators lab/i });
    await practiceLink.click();

    await expect(page).toHaveURL('/practice/accessible-locators');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Accessible Locators Lab' }),
    ).toBeVisible();
  });
});
