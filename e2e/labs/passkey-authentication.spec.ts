import { test, expect } from '@playwright/test';
import { checkA11y } from '../axe-helper';
import { addVirtualAuthenticator } from './passkey-helpers';

test.describe('Passkey Authentication lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/passkey-authentication');
    await addVirtualAuthenticator(page);
  });

  test('shows the registration panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Passkey for alice' })).toBeVisible();
  });

  test('registers a passkey with the virtual authenticator', async ({ page }) => {
    await page.getByRole('button', { name: 'Register passkey' }).click();
    await expect(page.getByText('A passkey is registered for this session.')).toBeVisible();
  });

  test('signs in with the registered passkey and reaches the dashboard', async ({ page }) => {
    await page.getByRole('button', { name: 'Register passkey' }).click();
    await expect(page.getByText('A passkey is registered for this session.')).toBeVisible();

    await page.getByRole('button', { name: 'Sign in with passkey' }).click();
    await expect(page).toHaveURL('/practice/passkey-authentication/dashboard');
    await expect(page.getByText('Alice Chen')).toBeVisible();
  });

  test('sign out redirects back to the registration page', async ({ page }) => {
    await page.getByRole('button', { name: 'Register passkey' }).click();
    await page.getByRole('button', { name: 'Sign in with passkey' }).click();
    await expect(page).toHaveURL('/practice/passkey-authentication/dashboard');

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL('/practice/passkey-authentication');
  });

  test('visiting the dashboard without a session redirects to the registration page', async ({
    page,
  }) => {
    await page.goto('/practice/passkey-authentication/dashboard');
    await expect(page).toHaveURL('/practice/passkey-authentication');
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
