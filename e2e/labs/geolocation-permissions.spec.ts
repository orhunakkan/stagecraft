import { test, expect } from '@playwright/test';

test.describe('Geolocation & Permissions lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/geolocation-permissions');
  });

  test('grant geolocation: coords and café list are visible', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 });

    await page.getByRole('button', { name: 'Find Cafés Near Me' }).click();

    await expect(page.getByTestId('coords')).toBeVisible();
    const list = page.getByRole('list', { name: 'Nearby cafés' });
    await expect(list).toBeVisible();
    await expect(list.getByRole('listitem').first()).toBeVisible();
  });

  test('deny geolocation: error alert is shown', async ({ page }) => {
    // No grantPermissions call — browser blocks geolocation by default in Playwright
    await page.getByRole('button', { name: 'Find Cafés Near Me' }).click();

    const alert = page.getByRole('alert').first();
    await expect(alert).toBeVisible();
  });

  test('grant clipboard: copy and paste flow succeeds', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.getByRole('button', { name: 'Copy Share Link' }).click();
    await expect(page.getByRole('status').first()).toContainText('copied');

    await page.getByRole('button', { name: 'Paste' }).click();
    const pastedInput = page.getByLabel('Pasted URL');
    await expect(pastedInput).toBeVisible();
    await expect(pastedInput).not.toHaveValue('');
  });
});
