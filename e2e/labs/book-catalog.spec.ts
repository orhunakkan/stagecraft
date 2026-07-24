import { test, expect } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('Book Catalog lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/book-catalog');
  });

  test('runs the Authors SELECT query on load, with no sign-in required', async ({ page }) => {
    await expect(page.getByRole('table', { name: 'authors' })).toBeVisible();
    await expect(page.getByText(/SELECT Id, Name, Country, BirthYear FROM Authors/)).toBeVisible();
    await expect(page.getByText(/\(12 total\)/)).toBeVisible();
  });

  test('searches authors by name after clicking Run Query', async ({ page }) => {
    await page.getByLabel('Name contains').fill('Austen');
    await page.getByRole('button', { name: 'Run Query' }).click();

    const rows = page.getByRole('table', { name: 'authors' }).getByRole('row');
    await expect(rows).toHaveCount(2); // header row + 1 match
    await expect(page.getByText(/\(1 total\)/)).toBeVisible();
  });

  test('filters authors by country', async ({ page }) => {
    await page.getByLabel('Country').selectOption('Japan');
    await page.getByRole('button', { name: 'Run Query' }).click();

    await expect(page.getByText('Haruki Murakami')).toBeVisible();
    await expect(page.getByText('Jane Austen')).not.toBeVisible();
  });

  test('paginates authors with Next and Prev', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption('name');
    await page.getByRole('button', { name: 'Run Query' }).click();
    const firstPageFirstRow = await page
      .getByRole('table', { name: 'authors' })
      .getByRole('row')
      .nth(1)
      .textContent();

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText(/Page 2 of/)).toBeVisible();
    const secondPageFirstRow = await page
      .getByRole('table', { name: 'authors' })
      .getByRole('row')
      .nth(1)
      .textContent();
    expect(secondPageFirstRow).not.toBe(firstPageFirstRow);

    await page.getByRole('button', { name: 'Prev' }).click();
    await expect(page.getByText(/Page 1 of/)).toBeVisible();
  });

  test('treats a SQL-injection-style search as a safe, literal substring', async ({ page }) => {
    await page.getByRole('tab', { name: 'Books' }).click();
    await expect(page.getByRole('table', { name: 'books' })).toBeVisible();

    await page.getByLabel('Title contains').fill("' OR '1'='1' --");
    await page.getByRole('button', { name: 'Run Query' }).click();
    await expect(page.getByText('No books match this query.')).toBeVisible();

    await page.getByLabel('Title contains').fill('');
    await page.getByRole('button', { name: 'Run Query' }).click();
    await expect(page.getByText(/\(30 total\)/)).toBeVisible();
  });

  test('runs the Catalog JOIN query and filters on the joined author country', async ({ page }) => {
    await page.getByRole('tab', { name: 'Catalog (JOIN)' }).click();
    await expect(page.getByRole('table', { name: 'catalog entries' })).toBeVisible();
    await expect(page.getByText(/JOIN Authors a ON b\.AuthorId = a\.Id/)).toBeVisible();

    await page.getByLabel('Author country').selectOption('Nigeria');
    await page.getByRole('button', { name: 'Run Query' }).click();

    await expect(page.getByText('Chimamanda Ngozi Adichie').first()).toBeVisible();
    const rows = page.getByRole('table', { name: 'catalog entries' }).getByRole('row');
    // header row + Nigerian authors' books only
    const count = await rows.count();
    expect(count).toBeGreaterThan(1);
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});

// The reset action mutates the shared table, so it's isolated in its own
// serial block rather than forcing the whole file to run serially — every
// other test in this file only reads the stable, deterministically-seeded
// data and can safely run in parallel with the others.
test.describe('Book Catalog lab — reset', () => {
  test.describe.configure({ mode: 'serial' });

  test('resets catalog data after confirming the dialog', async ({ page }) => {
    await page.goto('/practice/book-catalog');

    page.once('dialog', (dialog) => {
      void dialog.accept();
    });
    await page.getByRole('button', { name: 'Reset catalog data' }).click();

    await expect(page.getByText(/\(12 total\)/)).toBeVisible();
  });

  test('does not reset when the confirmation dialog is dismissed', async ({ page }) => {
    await page.goto('/practice/book-catalog');
    await page.getByLabel('Name contains').fill('Austen');
    await page.getByRole('button', { name: 'Run Query' }).click();
    await expect(page.getByText(/\(1 total\)/)).toBeVisible();

    page.once('dialog', (dialog) => {
      void dialog.dismiss();
    });
    await page.getByRole('button', { name: 'Reset catalog data' }).click();

    // Still showing the filtered result from before — nothing was reset.
    await expect(page.getByText(/\(1 total\)/)).toBeVisible();
  });
});
