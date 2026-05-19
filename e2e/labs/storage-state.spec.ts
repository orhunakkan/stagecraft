import { expect, test, type Page } from '@playwright/test';

async function loginAs(page: Page, username: string, password: string) {
  await page.goto('/practice/fake-auth');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/practice/fake-auth/dashboard');
}

test.describe('Storage State lab', () => {
  test('shows admin-only content after logging in as alice', async ({ page }) => {
    await loginAs(page, 'alice', 'password123');

    await page.goto('/practice/storage-state');

    await expect(page.getByTestId('display-name')).toHaveText('Alice Chen');
    await expect(page.getByTestId('admin-panel')).toBeVisible();
  });

  test('shows the unauthenticated state without a saved session', async ({ page }) => {
    await page.goto('/practice/storage-state');

    await expect(page.getByTestId('not-authenticated')).toContainText('Not authenticated');
    await expect(page.getByTestId('admin-panel')).not.toBeVisible();
  });

  test('hides admin-only content for a regular user session', async ({ page }) => {
    await loginAs(page, 'bob', 'letmein');

    await page.goto('/practice/storage-state');

    await expect(page.getByTestId('display-name')).toHaveText('Robert Smith');
    await expect(page.getByTestId('user-role')).toHaveText('user');
    await expect(page.getByTestId('admin-panel')).not.toBeVisible();
  });

  test('admin panel renders total user and pending review counts as numbers', async ({ page }) => {
    await loginAs(page, 'alice', 'password123');
    await page.goto('/practice/storage-state');

    await expect(page.getByTestId('total-users')).toHaveText(/^\d+$/);
    await expect(page.getByTestId('pending-reviews')).toHaveText(/^\d+$/);
  });

  test('saved storage state is reusable in a fresh context (skipping the login flow)', async ({
    browser,
  }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAs(adminPage, 'alice', 'password123');
    const state = await adminContext.storageState();
    await adminContext.close();

    const reusedContext = await browser.newContext({ storageState: state });
    const reusedPage = await reusedContext.newPage();
    await reusedPage.goto('/practice/storage-state');

    await expect(reusedPage.getByTestId('display-name')).toHaveText('Alice Chen');
    await expect(reusedPage.getByTestId('admin-panel')).toBeVisible();

    await reusedContext.close();
  });
});
