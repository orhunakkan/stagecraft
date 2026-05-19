import { test } from '@playwright/test';
import { checkA11y } from './axe-helper';

test.describe('accessibility', () => {
  test('home page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');
    await checkA11y(page);
  });
});
