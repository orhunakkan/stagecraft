import { expect, test } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('Debugging & Reporting lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/debugging-reporting');
  });

  test('expands and collapses the screenshot attachment panel', async ({ page }) => {
    await page.getByRole('button', { name: 'Expand panel' }).click();

    await expect(page.getByTestId('expandable-panel')).toContainText('Take a screenshot here');
    await expect(page.getByRole('button', { name: 'Collapse panel' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await page.getByRole('button', { name: 'Collapse panel' }).click();
    await expect(page.getByTestId('expandable-panel')).not.toBeVisible();
  });

  test('shows loading and completion states for the slow operation', async ({ page }) => {
    await page.getByTestId('slow-button').click();

    await expect(page.getByRole('status', { name: 'Loading' })).toBeVisible();
    await expect(page.getByTestId('slow-result')).toContainText('Operation complete', {
      timeout: 3000,
    });
  });

  test('flaky button fails on the third click', async ({ page }) => {
    const button = page.getByTestId('flaky-button');

    await button.click();
    await expect(page.getByTestId('flaky-success')).toBeVisible();
    await button.click();
    await expect(page.getByTestId('flaky-success')).toBeVisible();
    await button.click();
    await expect(page.getByTestId('flaky-error')).toBeVisible();
  });

  test('non-deterministic ticker updates over time', async ({ page }) => {
    const counter = page.getByTestId('live-counter');
    await expect(counter).toHaveText(/^\d+s$/);

    await expect
      .poll(async () => Number((await counter.textContent())?.replace('s', '') ?? 0), {
        timeout: 4000,
      })
      .toBeGreaterThan(1);
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
