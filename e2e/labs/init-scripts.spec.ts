import { test, expect } from '@playwright/test';

declare global {
  interface Window {
    __FLAGS__?: Record<string, boolean>;
  }
}

test.describe('Init Scripts & Seeding lab', () => {
  test('onboarding modal is visible without any seeding', async ({ page }) => {
    await page.goto('/practice/init-scripts');
    await expect(page.getByRole('dialog', { name: /welcome/i })).toBeVisible();
  });

  test('addInitScript seeds localStorage to suppress onboarding modal', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('onboarded', 'true');
    });
    await page.goto('/practice/init-scripts');
    await expect(page.getByRole('dialog', { name: /welcome/i })).not.toBeVisible();
    await expect(page.getByLabel('Onboarding state')).toContainText('Complete');
  });

  test('addInitScript injects __FLAGS__ to show beta feature banner', async ({ page }) => {
    await page.addInitScript(() => {
      window.__FLAGS__ = { betaFeature: true };
    });
    await page.goto('/practice/init-scripts');
    await expect(page.getByLabel('Beta feature banner')).toBeVisible();
    await expect(page.getByLabel('Beta feature banner')).toContainText('enabled');
  });

  test('stub Math.random for a deterministic lucky number', async ({ page }) => {
    await page.addInitScript(() => {
      Math.random = () => 0.42;
    });
    await page.goto('/practice/init-scripts');
    await expect(page.getByTestId('lucky-number')).toHaveText('42');
  });

  test('context.addInitScript persists seed across pages in same context', async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => {
      localStorage.setItem('onboarded', 'true');
    });
    await page.goto('/practice/init-scripts');
    await expect(page.getByRole('dialog', { name: /welcome/i })).not.toBeVisible();

    // Open a second page in the same context — seed should still apply
    const page2 = await context.newPage();
    await page2.goto('/practice/init-scripts');
    await expect(page2.getByRole('dialog', { name: /welcome/i })).not.toBeVisible();
    await page2.close();
  });

  test('dismissing modal sets localStorage and hides dialog', async ({ page }) => {
    await page.goto('/practice/init-scripts');
    await page.getByRole('button', { name: /got it/i }).click();
    await expect(page.getByRole('dialog', { name: /welcome/i })).not.toBeVisible();
    await expect(page.getByLabel('Onboarding state')).toContainText('Complete');
  });
});
