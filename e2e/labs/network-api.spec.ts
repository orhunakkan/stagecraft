import { test, expect } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('Network & API lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/network-api');
  });

  test('notes list is visible and loads seed data', async ({ page }) => {
    const list = page.getByRole('list', { name: 'Notes list' });
    await expect(list).toBeVisible();
    // Server seeds 3 notes; at least one item should be present
    await expect(list.getByRole('listitem').first()).toBeVisible();
  });

  test('can add a new note', async ({ page }) => {
    const unique = `E2E note ${Date.now()}`;
    await page.getByLabel('Add note').fill(unique);
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByRole('list', { name: 'Notes list' }).getByText(unique)).toBeVisible();
  });

  test('can delete a note', async ({ page }) => {
    // Add a note we control so we know exactly what to delete
    const unique = `Delete me ${Date.now()}`;
    await page.getByLabel('Add note').fill(unique);
    await page.getByRole('button', { name: 'Add' }).click();
    const noteText = page.getByRole('list', { name: 'Notes list' }).getByText(unique);
    await expect(noteText).toBeVisible();

    await page.getByRole('button', { name: `Delete note: ${unique}` }).click();
    await expect(noteText).not.toBeVisible();
  });

  test('Add button is disabled when the input is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  test('intercept: can stub GET /api/notes with page.route', async ({ page }) => {
    await page.route('/api/notes', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 99, text: 'Stubbed note', createdAt: new Date().toISOString() },
        ]),
      }),
    );
    await page.reload();
    await expect(
      page.getByRole('list', { name: 'Notes list' }).getByText('Stubbed note'),
    ).toBeVisible();
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
