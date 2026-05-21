import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Scanning lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/accessibility-scanning');
    // Wait for the form region to be present in the DOM before scanning
    await page.locator('#form-region').waitFor();
  });

  test('broken state: full-page scan has at least 1 violation', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.length).toBeGreaterThanOrEqual(1);
  });

  test('accessible state: scan has 0 violations', async ({ page }) => {
    await page.getByLabel('Show accessible controls').check();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toHaveLength(0);
  });

  test('scoped scan with .include on the form region', async ({ page }) => {
    const results = await new AxeBuilder({ page }).include('#form-region').analyze();
    // The broken form has at least an unlabelled input and a missing-alt image
    expect(results.violations.length).toBeGreaterThanOrEqual(1);
  });

  test('tag-filtered scan with wcag2a and wcag2aa finds violations in broken state', async ({
    page,
  }) => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.length).toBeGreaterThanOrEqual(1);
  });

  test('tag-filtered scan with wcag2a passes in accessible state', async ({ page }) => {
    await page.getByLabel('Show accessible controls').check();
    await page.locator('#form-region').waitFor();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations).toHaveLength(0);
  });
});
