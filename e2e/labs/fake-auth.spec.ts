import { test, expect } from '@playwright/test';
import { signIn } from './auth-helpers';

test.describe('Fake Auth lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/fake-auth');
  });

  test('shows the login form', async ({ page }) => {
    await expect(page.getByRole('form', { name: 'Login form' })).toBeVisible();
  });

  test('Sign in button is disabled when fields are empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });

  test('Sign in button is disabled with only username filled', async ({ page }) => {
    await page.getByLabel('Username').fill('alice');
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });

  test('wrong credentials show an error alert', async ({ page }) => {
    await signIn(page, 'alice', 'wrongpassword');
    await expect(page.getByRole('alert')).toContainText('Invalid username or password');
  });

  test('correct credentials navigate to the dashboard', async ({ page }) => {
    await signIn(page, 'alice', 'password123');
    await expect(page).toHaveURL('/practice/fake-auth/dashboard');
  });

  test('dashboard shows the authenticated username', async ({ page }) => {
    await signIn(page, 'alice', 'password123');
    await expect(page.getByText('alice', { exact: true })).toBeVisible();
    await expect(page.getByText('Authenticated', { exact: true })).toBeVisible();
  });

  test('sign out redirects back to the login page', async ({ page }) => {
    await signIn(page, 'alice', 'password123');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL('/practice/fake-auth');
    await expect(page.getByRole('form', { name: 'Login form' })).toBeVisible();
  });

  test('visiting dashboard without a session redirects to login', async ({ page }) => {
    await page.goto('/practice/fake-auth/dashboard');
    await expect(page).toHaveURL('/practice/fake-auth');
  });

  test('second user bob can also log in', async ({ page }) => {
    await signIn(page, 'bob', 'letmein');
    await expect(page).toHaveURL('/practice/fake-auth/dashboard');
    await expect(page.getByText('bob')).toBeVisible();
  });
});
