import { expect, test } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('Tables & Filtering lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/tables-filtering');
  });

  test('filters employee rows by search query', async ({ page }) => {
    await page.getByLabel('Search').fill('Alice');

    await expect(page.getByRole('status')).toContainText('1 employees');
    await expect(page.getByRole('cell', { name: 'Alice Chen', exact: true })).toBeVisible();
  });

  test('removes a row from the action menu and updates the result count', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions for Alice Chen' }).click();
    await page.getByRole('menuitem', { name: 'Remove' }).click();

    await expect(page.getByRole('alert')).toContainText('Alice Chen removed.');
    await expect(page.getByRole('status')).toContainText('22 employees');
    await expect(page.getByRole('cell', { name: 'Alice Chen', exact: true })).not.toBeVisible();
  });

  test('department filtering resets pagination to the first page', async ({ page }) => {
    await page.getByRole('button', { name: '2' }).click();
    await expect(page.getByText('Page 2 of 4')).toBeVisible();
    await page.getByLabel('Department', { exact: true }).selectOption('HR');

    await expect(page.getByText('Page 1 of 1')).toBeVisible();
    await expect(page.getByRole('status')).toContainText('3 employees');
    await expect(page.getByRole('cell', { name: 'Iris Johnson', exact: true })).toBeVisible();
  });

  test('clicking the Name header sorts the first column and toggles direction on second click', async ({
    page,
  }) => {
    const firstNameCell = page.getByRole('row').nth(1).getByRole('cell').first();

    await expect(firstNameCell).toHaveText('Alice Chen');

    await page.getByRole('button', { name: /Sort by name/ }).click();
    await expect(firstNameCell).toHaveText('Wendy Hall');
  });

  test('shows an empty state when search has no matches', async ({ page }) => {
    await page.getByLabel('Search').fill('zzz-no-match');

    await expect(page.getByRole('status')).toContainText('No employees found.');
    await expect(page.getByText('No employees match your filters.')).toBeVisible();
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
