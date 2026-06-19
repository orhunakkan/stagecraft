import { test, expect } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('Media & Locale Emulation lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/media-locale');
  });

  test('emulateMedia dark: colour-scheme label shows Dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.getByTestId('color-scheme-label')).toHaveText('Dark');
  });

  test('emulateMedia light: colour-scheme label shows Light', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.getByTestId('color-scheme-label')).toHaveText('Light');
  });

  test('emulateMedia reducedMotion reduce: motion label shows Reduced', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.getByTestId('motion-label')).toHaveText('Reduced');
  });

  test('emulateMedia reducedMotion no-preference: motion label shows Motion on', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.getByTestId('motion-label')).toHaveText('Motion on');
  });

  test('emulateMedia print: print banner is visible', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByTestId('print-banner')).toBeVisible();
  });

  test('context locale de-DE: date and currency are German-formatted', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'de-DE', timezoneId: 'Europe/Berlin' });
    const localePage = await context.newPage();
    await localePage.goto('/practice/media-locale');

    const dateText = await localePage.getByTestId('locale-date').textContent();
    // German date format includes "Mai" (May in German)
    expect(dateText).toContain('Mai');

    const currencyText = await localePage.getByTestId('locale-currency').textContent();
    // German currency uses comma as decimal separator
    expect(currencyText).toMatch(/1\.234/);

    await context.close();
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
