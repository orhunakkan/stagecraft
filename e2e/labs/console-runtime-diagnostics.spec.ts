import { test, expect } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('Console & Runtime Diagnostics lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/console-runtime-diagnostics');
  });

  test('captures an info console message', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', (msg) => messages.push(msg.text()));

    await page.getByRole('button', { name: 'Log info' }).click();

    await expect.poll(() => messages).toContain('Info message logged');
  });

  test('distinguishes warning and error console message types', async ({ page }) => {
    const byType: Record<string, string[]> = {};
    page.on('console', (msg) => {
      (byType[msg.type()] ??= []).push(msg.text());
    });

    await page.getByRole('button', { name: 'Log warning' }).click();
    await page.getByRole('button', { name: 'Log error' }).click();

    await expect.poll(() => byType.warning).toContain('Warning message logged');
    await expect.poll(() => byType.error).toContain('Error message logged');
  });

  test('captures an uncaught runtime error via pageerror', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.getByRole('button', { name: 'Throw uncaught error' }).click();

    await expect.poll(() => errors).toContain('Uncaught runtime error triggered from the lab');
  });

  test('observes an outgoing request for a missing resource', async ({ page }) => {
    const requestPromise = page.waitForRequest('**/diagnostics-lab/missing-resource');

    await page.getByRole('button', { name: 'Fetch a missing resource' }).click();

    const request = await requestPromise;
    expect(request.url()).toContain('/diagnostics-lab/missing-resource');
  });

  test('action log reflects every triggered action', async ({ page }) => {
    await page.getByRole('button', { name: 'Log info' }).click();
    await page.getByRole('button', { name: 'Reject a promise' }).click();

    await expect(page.getByTestId('action-log')).toContainText('Logged an info message');
    await expect(page.getByTestId('action-log')).toContainText(
      'Rejected a promise without a catch handler',
    );
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
