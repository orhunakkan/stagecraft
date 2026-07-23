import { test, expect, type Page } from '@playwright/test';
import { checkA11y } from '../axe-helper';
import { signIn, signInAndExpectDashboard } from './auth-helpers';

async function signInAsAdminAndReseed(page: Page) {
  await signInAndExpectDashboard(page, 'alice', 'password123');
  await page.request.post('/api/audit-log/reseed');
  await page.goto('/practice/audit-log-search');
}

test.describe('Audit Log & Search lab', () => {
  // Every test reseeds the *same* shared Azure SQL / in-memory table on the
  // dev server this suite runs against. Parallel workers reseeding
  // concurrently would stomp on each other's expected row counts, so this
  // spec runs serially rather than using the per-item unique-data trick
  // other labs use (reseed's blast radius is the whole table, not one row).
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/fake-auth');
  });

  test('shows an unauthenticated message with no session', async ({ page }) => {
    await page.goto('/practice/audit-log-search');

    await expect(page.getByRole('alert')).toContainText('must be signed in as an admin');
  });

  test('shows a forbidden message for a non-admin session', async ({ page }) => {
    await signInAndExpectDashboard(page, 'bob', 'letmein');
    await page.goto('/practice/audit-log-search');

    await expect(page.getByRole('alert')).toContainText('does not have admin access');
  });

  test('admin sees seeded audit log entries with pagination', async ({ page }) => {
    await signInAsAdminAndReseed(page);

    await expect(page.getByRole('list', { name: 'Audit log entries' })).toBeVisible();
    await expect(page.getByText('Page 1 of 6 (120 total)')).toBeVisible();
  });

  test('paginates with Next and Prev', async ({ page }) => {
    await signInAsAdminAndReseed(page);
    const entries = page.getByRole('list', { name: 'Audit log entries' }).getByRole('listitem');
    const firstPageFirstItem = await entries.first().textContent();

    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Page 2 of 6 (120 total)')).toBeVisible();
    const secondPageFirstItem = await entries.first().textContent();
    expect(secondPageFirstItem).not.toBe(firstPageFirstItem);

    await page.getByRole('button', { name: 'Prev' }).click();
    await expect(page.getByText('Page 1 of 6 (120 total)')).toBeVisible();
  });

  test('filters by username search', async ({ page }) => {
    await signInAsAdminAndReseed(page);

    await page.getByLabel('Username contains').fill('carol');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText(/\(24 total\)/)).toBeVisible();
    const items = page.getByRole('list', { name: 'Audit log entries' }).getByRole('listitem');
    await expect(items.first()).toContainText('carol');
  });

  test('filters by date range', async ({ page }) => {
    await signInAsAdminAndReseed(page);

    await page.getByLabel('From date').fill('2026-01-01');
    await page.getByLabel('To date').fill('2026-01-05');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText(/Page 1 of 1/)).toBeVisible();
  });

  test('treats a SQL-injection-style search as a safe, literal substring', async ({ page }) => {
    await signInAsAdminAndReseed(page);

    await page.getByLabel('Username contains').fill("' OR '1'='1' --");
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('No audit log entries match this search.')).toBeVisible();

    // A normal search afterward proves the data and the app still work.
    await page.getByLabel('Username contains').fill('');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText(/\(120 total\)/)).toBeVisible();
  });

  test('a fresh event is immediately queryable, proving real persistence', async ({ page }) => {
    await signInAsAdminAndReseed(page);

    const uniqueUsername = `e2e-fresh-${Date.now()}`;
    await page.goto('/practice/fake-auth');
    await signIn(page, uniqueUsername, 'wrong-password');
    await expect(page.getByRole('alert')).toBeVisible();

    await page.goto('/practice/audit-log-search');
    await page.getByLabel('Username contains').fill(uniqueUsername);
    await page.getByRole('button', { name: 'Search' }).click();

    const items = page.getByRole('list', { name: 'Audit log entries' }).getByRole('listitem');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('failed_login');
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await signInAsAdminAndReseed(page);
    await checkA11y(page);
  });
});
