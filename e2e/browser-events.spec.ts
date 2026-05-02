import { expect, test } from '@playwright/test';

test.describe('Browser Events lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/browser-events');
  });

  test('page loads with correct title and all event scenario sections', async ({ page }) => {
    await expect(page).toHaveTitle(/Browser Events Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: /browser events lab/i }),
    ).toBeVisible();
    await expect(page.getByRole('region', { name: /native dialogs/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /file upload/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /file download/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /popup and new tab/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /navigation events/i })).toBeVisible();
  });

  // ─── Scenario 1: Native Dialogs ────────────────────────────────────────────

  // page.on('dialog') — alert: register BEFORE clicking
  test('alert dialog can be dismissed and the result is visible', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /trigger alert/i }).click();

    await expect(page.getByText(/alert dismissed/i)).toBeVisible();
  });

  // page.on('dialog') + dialog.accept() — confirm accepted
  test('confirm dialog accepted shows the accepted result', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /trigger confirm/i }).click();

    await expect(page.getByText(/confirm: accepted/i)).toBeVisible();
  });

  // page.on('dialog') + dialog.dismiss() — confirm dismissed
  test('confirm dialog dismissed shows the dismissed result', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: /trigger confirm/i }).click();

    await expect(page.getByText(/confirm: dismissed/i)).toBeVisible();
  });

  // page.on('dialog') + dialog.accept(promptText) — prompt with value
  test('prompt dialog accepts and shows the entered value', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept('playwright'));
    await page.getByRole('button', { name: /trigger prompt/i }).click();

    await expect(page.getByText(/prompt value: "playwright"/i)).toBeVisible();
  });

  // dialog.dismiss() on a prompt returns null — UI shows "cancelled"
  test('prompt dialog dismissed shows the cancelled result', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: /trigger prompt/i }).click();

    await expect(page.getByText(/prompt: cancelled/i)).toBeVisible();
  });

  // dialog.message() — reading the dialog message before acting
  test('alert dialog message contains the expected text', async ({ page }) => {
    let dialogMessage = '';
    page.on('dialog', (dialog) => {
      dialogMessage = dialog.message();
      dialog.accept();
    });
    await page.getByRole('button', { name: /trigger alert/i }).click();

    await expect(page.getByText(/alert dismissed/i)).toBeVisible();
    expect(dialogMessage).toContain('practice alert');
  });

  // ─── Scenario 2: File Upload ───────────────────────────────────────────────

  test('file upload input is visible and labelled', async ({ page }) => {
    await expect(page.getByLabel(/choose file/i)).toBeVisible();
  });

  // locator.setInputFiles() — single file
  test('setInputFiles shows filename and size in the UI', async ({ page }) => {
    await page.getByLabel(/choose file/i).setInputFiles({
      name: 'test-report.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Playwright test content'),
    });

    await expect(page.getByRole('listitem', { name: /test-report\.txt/i })).toBeVisible();
    await expect(page.getByText('test-report.txt')).toBeVisible();
  });

  // locator.setInputFiles() — multiple files
  test('setInputFiles with multiple files shows all filenames', async ({ page }) => {
    await page.getByLabel(/choose file/i).setInputFiles([
      {
        name: 'alpha.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from('a,b,c'),
      },
      {
        name: 'beta.json',
        mimeType: 'application/json',
        buffer: Buffer.from('{}'),
      },
    ]);

    await expect(page.getByRole('listitem', { name: /alpha\.csv/i })).toBeVisible();
    await expect(page.getByRole('listitem', { name: /beta\.json/i })).toBeVisible();
  });

  // ─── Scenario 3: File Download ─────────────────────────────────────────────

  // page.waitForEvent('download') — must be set up BEFORE clicking
  test('download event is emitted with the expected suggested filename', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download sample report/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('stagecraft-sample-report.txt');
  });

  // UI shows the "Download initiated" status after the click
  test('UI shows "Download initiated" after the download button is clicked', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download sample report/i }).click();
    await downloadPromise;

    await expect(page.getByRole('status', { name: /download initiated/i })).toBeVisible();
  });

  // ─── Scenario 4: Popup / New Tab ───────────────────────────────────────────

  test('popup event opens a same-origin tab at the popup note target', async ({ page }) => {
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('link', { name: /open popup note in new tab/i }).click();
    const popup = await popupPromise;

    await popup.waitForLoadState();
    await expect(popup).toHaveURL(/\/practice\/browser-events#popup-note$/);
    await expect(popup.getByText(/popup note target/i)).toBeVisible();
    await popup.close();
  });

  // ─── Scenario 5: Navigation Events ─────────────────────────────────────────

  test('waitForURL observes navigation to the challenge detail page', async ({ page }) => {
    const navigationPromise = page.waitForURL('**/challenges/browser-events');
    await page.getByRole('link', { name: /navigate to browser events challenge detail/i }).click();
    await navigationPromise;

    await expect(
      page.getByRole('heading', { level: 1, name: /browser events lab/i }),
    ).toBeVisible();
  });

  // ─── Challenge navigation ──────────────────────────────────────────────────

  test('challenge detail page links to this lab', async ({ page }) => {
    await page.goto('/challenges/browser-events');
    await page.getByRole('link', { name: /open browser events lab/i }).click();
    await expect(page).toHaveURL('/practice/browser-events');
  });

  // ─── Reset ────────────────────────────────────────────────────────────────

  test('Reset lab clears all panel states', async ({ page }) => {
    // Trigger an alert result
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: /trigger alert/i }).click();
    await expect(page.getByText(/alert dismissed/i)).toBeVisible();

    await page.getByRole('button', { name: /reset lab/i }).click();

    await expect(page.getByText(/no dialog triggered yet/i)).toBeVisible();
    await expect(page.getByText(/alert dismissed/i)).not.toBeVisible();
  });
});
