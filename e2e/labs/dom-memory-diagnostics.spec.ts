import { test, expect } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('Memory & DOM Leak Diagnostics lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/dom-memory-diagnostics');
  });

  test('spawning toasts increases the active count then moves them to the graveyard', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Spawn 50 toasts' }).click();
    await expect(page.getByTestId('active-toast-count')).toHaveText('50 active');

    await expect(page.getByTestId('graveyard-count')).toHaveText('50 retained nodes', {
      timeout: 5000,
    });
    await expect(page.getByTestId('active-toast-count')).toHaveText('0 active');
  });

  test('requestGC does not reduce a graveyard that is still referenced', async ({ page }) => {
    await page.getByRole('button', { name: 'Spawn 50 toasts' }).click();
    await expect(page.getByTestId('graveyard-count')).toHaveText('50 retained nodes', {
      timeout: 5000,
    });

    await page.requestGC();

    await expect(page.getByTestId('graveyard-count')).toHaveText('50 retained nodes');
    expect(await page.getByTestId('graveyard-item').count()).toBe(50);
  });

  test('clearing leaked nodes drops the graveyard back to zero', async ({ page }) => {
    await page.getByRole('button', { name: 'Spawn 50 toasts' }).click();
    await expect(page.getByTestId('graveyard-count')).toHaveText('50 retained nodes', {
      timeout: 5000,
    });

    await page.getByRole('button', { name: 'Clear leaked nodes' }).click();

    await expect(page.getByTestId('graveyard-count')).toHaveText('0 retained nodes');
    expect(await page.getByTestId('graveyard-item').count()).toBe(0);
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });

  test('page has no axe accessibility violations while the graveyard is fully populated', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Spawn 50 toasts' }).click();
    await expect(page.getByTestId('graveyard-count')).toHaveText('50 retained nodes', {
      timeout: 5000,
    });

    await checkA11y(page);
  });
});
