import { expect, test } from '@playwright/test';

test.describe('Emulation and Input lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/emulation-input');
  });

  test('page loads with viewport, keyboard, pointer, and touch sections', async ({ page }) => {
    await expect(page).toHaveTitle(/Emulation and Input Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: /emulation and input lab/i }),
    ).toBeVisible();
    await expect(page.getByRole('region', { name: /viewport-aware dashboard/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /keyboard command center/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /pointer practice pad/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /touch-friendly controls/i })).toBeVisible();
  });

  test('compact viewport shows mobile layout guidance', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await page.goto('/practice/emulation-input');

    await expect(page.getByText(/viewport mode: compact mobile layout/i)).toBeVisible();
  });

  test('tablet viewport shows tablet layout guidance', async ({ page }) => {
    await page.setViewportSize({ width: 760, height: 900 });
    await page.goto('/practice/emulation-input');

    await expect(page.getByText(/viewport mode: tablet layout/i)).toBeVisible();
  });

  test('desktop viewport shows expanded layout guidance', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/practice/emulation-input');

    await expect(page.getByText(/viewport mode: expanded desktop layout/i)).toBeVisible();
  });

  test('keyboard Enter submits command text', async ({ page }) => {
    const commandInput = page.getByRole('textbox', { name: /command input/i });

    await commandInput.fill('deploy preview');
    await commandInput.press('Enter');

    await expect(page.getByRole('status', { name: /keyboard result/i })).toHaveText(
      /command submitted: deploy preview/i,
    );
  });

  test('keyboard Escape clears command text', async ({ page }) => {
    const commandInput = page.getByRole('textbox', { name: /command input/i });

    await commandInput.fill('draft command');
    await commandInput.press('Escape');

    await expect(commandInput).toHaveValue('');
    await expect(page.getByRole('status', { name: /keyboard result/i })).toHaveText(
      /command input cleared/i,
    );
  });

  test('pointer hover, click, and double-click update visible status', async ({ page }) => {
    await page.getByRole('button', { name: /hover pointer target/i }).hover();
    await expect(page.getByRole('status', { name: /pointer status/i })).toHaveText(
      /pointer is hovering/i,
    );

    await page.getByRole('button', { name: /click pointer target/i }).click();
    await expect(page.getByRole('status', { name: /pointer status/i })).toHaveText(
      /pointer click recorded \(1\)/i,
    );

    await page.getByRole('button', { name: /double-click target/i }).dblclick();
    await expect(page.getByRole('status', { name: /pointer status/i })).toHaveText(
      /double-click action confirmed/i,
    );
  });

  test('touch-friendly checklist expands on a compact viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await page.goto('/practice/emulation-input');

    await page.getByRole('button', { name: /toggle mobile checklist/i }).click();

    await expect(page.getByRole('status', { name: /touch control status/i })).toHaveText(
      /mobile checklist expanded/i,
    );
    await expect(page.getByRole('list', { name: /mobile checklist/i })).toBeVisible();
  });

  test('challenge detail page links to this lab', async ({ page }) => {
    await page.goto('/challenges/emulation-input');
    await page.getByRole('link', { name: /open emulation and input lab/i }).click();
    await expect(page).toHaveURL('/practice/emulation-input');
  });

  test('Reset lab restores input and touch state', async ({ page }) => {
    await page.getByRole('textbox', { name: /command input/i }).fill('deploy');
    await page.getByRole('textbox', { name: /command input/i }).press('Enter');
    await page.getByRole('button', { name: /toggle mobile checklist/i }).click();

    await page.getByRole('button', { name: /reset lab/i }).click();

    await expect(page.getByRole('textbox', { name: /command input/i })).toHaveValue('');
    await expect(page.getByRole('status', { name: /keyboard result/i })).toHaveText(
      /no command submitted yet/i,
    );
    await expect(page.getByRole('status', { name: /touch control status/i })).toHaveText(
      /mobile checklist collapsed/i,
    );
  });
});
