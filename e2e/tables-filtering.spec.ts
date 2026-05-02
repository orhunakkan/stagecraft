import { expect, test } from '@playwright/test';

test.describe('Tables and Filtering lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/tables-filtering');
  });

  test('page loads with correct title and table', async ({ page }) => {
    await expect(page).toHaveTitle(/Tables and Filtering Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: /tables and filtering lab/i }),
    ).toBeVisible();
    await expect(page.getByRole('table', { name: /release tasks/i })).toBeVisible();
  });

  // getByRole('table') and row counting
  test('shows 5 rows on page 1 of the deterministic dataset', async ({ page }) => {
    // 1 header row + 5 data rows = 6 total
    await expect(page.getByRole('row')).toHaveCount(6);
  });

  // getByRole('columnheader') — column headers
  test('column headers are locatable by role', async ({ page }) => {
    await expect(page.getByRole('columnheader', { name: /task/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /priority/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /assignee/i })).toBeVisible();
  });

  // Search — getByRole('searchbox') + filter
  test('search filters rows to matching task names', async ({ page }) => {
    await page.getByRole('searchbox', { name: /search tasks/i }).fill('fix');

    // Both "Fix cart calculation" and "Fix image upload bug" should appear
    const table = page.getByRole('table', { name: /release tasks/i });
    await expect(table.getByRole('row', { name: /fix cart calculation/i })).toBeVisible();
    await expect(table.getByRole('row', { name: /fix image upload bug/i })).toBeVisible();
    // Tasks not matching should not appear
    await expect(table.getByRole('row', { name: /write api docs/i })).toBeHidden();
  });

  // Status filter — getByRole('combobox')
  test('status filter shows only matching rows', async ({ page }) => {
    await page.getByRole('combobox', { name: /filter by status/i }).selectOption('blocked');

    await expect(page.getByRole('row', { name: /resolve checkout error/i })).toBeVisible();
    // Rows with other statuses should not appear in the body
    const allDataRows = page
      .getByRole('table')
      .getByRole('row')
      .filter({ hasNot: page.getByRole('columnheader') });
    await expect(allDataRows).toHaveCount(1);
  });

  // Empty state
  test('shows empty state when no tasks match filters', async ({ page }) => {
    await page.getByRole('searchbox', { name: /search tasks/i }).fill('zzznomatch');
    await expect(page.getByRole('status')).toContainText(/no tasks match/i);
  });

  // Clear filters restores rows
  test('Clear filters button restores all rows', async ({ page }) => {
    await page.getByRole('searchbox', { name: /search tasks/i }).fill('zzznomatch');
    await page.getByRole('button', { name: /clear filters/i }).click();

    // 1 header row + 5 data rows on page 1
    await expect(page.getByRole('row')).toHaveCount(6);
  });

  // Sort — click column header button
  test('clicking Task column header sorts rows alphabetically', async ({ page }) => {
    await page.getByRole('button', { name: /sort by task/i }).click();

    const table = page.getByRole('table', { name: /release tasks/i });
    const firstDataRow = table.getByRole('row').nth(1);
    // "Add dark mode toggle" is alphabetically first in the first-page results
    await expect(firstDataRow).toContainText('Add dark mode toggle');
  });

  // Row scoping — locator.filter({ hasText }) + scoped action
  test('View details button is scoped to its row and shows a detail panel', async ({ page }) => {
    // Scope to the specific row, then find the action button within it
    const targetRow = page.getByRole('row', { name: 'Update login page' });
    await targetRow.getByRole('button', { name: /view details/i }).click();

    const panel = page.getByRole('region', { name: /task details/i });
    await expect(panel).toBeVisible();
    await expect(panel.getByText('Update login page')).toBeVisible();
  });

  // Row action — Mark complete changes status in-row
  test('Mark complete changes the task status in the same row', async ({ page }) => {
    const targetRow = page.getByRole('row', { name: 'Fix cart calculation' });
    await expect(targetRow.getByText('In progress')).toBeVisible();

    await targetRow.getByRole('button', { name: /mark complete/i }).click();

    await expect(targetRow.getByText('Done')).toBeVisible();
    await expect(targetRow.getByRole('button', { name: /mark complete/i })).toBeHidden();
  });

  // Pagination
  test('Next page button navigates to page 2', async ({ page }) => {
    await page.getByRole('button', { name: /next page/i }).click();
    // Scope to the pagination nav to avoid matching the live region summary text
    const paginationNav = page.getByRole('navigation', { name: /table pagination/i });
    await expect(paginationNav.getByText('Page 2 of 2')).toBeVisible();
  });

  test('Previous page button is disabled on page 1', async ({ page }) => {
    await expect(page.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });

  // Challenge detail links to this lab
  test('challenge detail page links to this lab', async ({ page }) => {
    await page.goto('/challenges/tables-filtering');
    await page.getByRole('link', { name: /open tables and filtering lab/i }).click();
    await expect(page).toHaveURL('/practice/tables-filtering');
  });

  // Reset lab restores initial state
  test('Reset lab clears search and restores page 1', async ({ page }) => {
    // Searching 'fix' reduces to 2 results — no pagination shown
    await page.getByRole('searchbox', { name: /search tasks/i }).fill('fix');
    // Confirm filter applied: 1 header + 2 data rows
    await expect(page.getByRole('row')).toHaveCount(3);

    await page.getByRole('button', { name: /reset lab/i }).click();

    // After reset: search cleared, back to 10 tasks, 6 rows on page 1
    await expect(page.getByRole('searchbox', { name: /search tasks/i })).toHaveValue('');
    await expect(page.getByRole('row')).toHaveCount(6);
  });
});
