import { expect, type Page } from '@playwright/test';

export async function signIn(page: Page, username: string, password: string) {
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

export async function signInAndExpectDashboard(page: Page, username: string, password: string) {
  await page.goto('/practice/fake-auth');
  await signIn(page, username, password);
  await expect(page).toHaveURL('/practice/fake-auth/dashboard');
}
