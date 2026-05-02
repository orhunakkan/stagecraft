import { expect, test } from '@playwright/test';

test.describe('keyboard navigation', () => {
  test('primary nav links and theme toggle are reachable by Tab', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Stagecraft home' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Challenges' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Practice areas', exact: true })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /switch to/i })).toBeFocused();
  });

  test('theme toggle activates via Enter key', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /switch to dark theme/i }).focus();
    await page.keyboard.press('Enter');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('theme toggle activates via Space key', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /switch to dark theme/i }).focus();
    await page.keyboard.press('Space');

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('challenge catalog links are keyboard-focusable', async ({ page }) => {
    await page.goto('/challenges');
    const firstCard = page.getByRole('link', { name: /accessible locators/i }).first();
    await firstCard.focus();
    await expect(firstCard).toBeFocused();
  });

  test('challenge detail practice link is keyboard-focusable', async ({ page }) => {
    await page.goto('/challenges/accessible-locators');
    const practiceLink = page.getByRole('link', { name: /^open accessible locators lab/i });
    await practiceLink.focus();
    await expect(practiceLink).toBeFocused();
  });
});

test.describe('dark mode smoke – system preference', () => {
  test.use({ colorScheme: 'dark' });

  test('homepage renders in dark mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Stagecraft' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Choose a challenge' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('challenge catalog renders in dark mode', async ({ page }) => {
    await page.goto('/challenges');
    await expect(page.getByRole('heading', { name: /challenge catalog/i })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('challenge detail renders in dark mode', async ({ page }) => {
    await page.goto('/challenges/accessible-locators');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('practice lab renders in dark mode', async ({ page }) => {
    await page.goto('/practice/accessible-locators');
    await expect(page.getByRole('main').first()).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('dark mode smoke – user toggled', () => {
  test('dark theme persists across page navigations', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /switch to dark theme/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.goto('/challenges');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.goto('/challenges/accessible-locators');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('accessibility attributes', () => {
  test('primary navigation has an accessible name', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
  });

  test('theme toggle aria-pressed is false in light mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /switch to dark theme/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('theme toggle aria-pressed is true after switching to dark', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /switch to dark theme/i }).click();
    await expect(page.getByRole('button', { name: /switch to light theme/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('homepage has a main landmark', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('challenge catalog has a main landmark', async ({ page }) => {
    await page.goto('/challenges');
    await expect(page.getByRole('main')).toBeVisible();
  });
});
