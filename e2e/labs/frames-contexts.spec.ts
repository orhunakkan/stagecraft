import { expect, test, type FrameLocator } from '@playwright/test';

test.describe('Frames & Contexts lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/frames-contexts');
  });

  const counterValue = (frame: FrameLocator) =>
    frame.getByRole('status', { name: 'Counter value' });

  test('interacts with the counter inside an iframe', async ({ page }) => {
    const frame = page.frameLocator('iframe[title="Counter frame"]');
    await frame.getByRole('button', { name: 'Increment' }).click();

    await expect(counterValue(frame)).toHaveText('1');
  });

  test('respects a custom step size when incrementing inside the iframe', async ({ page }) => {
    const frame = page.frameLocator('iframe[title="Counter frame"]');
    await frame.getByLabel('Step size').fill('5');
    await frame.getByRole('button', { name: 'Increment' }).click();
    await frame.getByRole('button', { name: 'Increment' }).click();

    await expect(counterValue(frame)).toHaveText('10');
  });

  test('decrement and reset adjust the iframe counter correctly', async ({ page }) => {
    const frame = page.frameLocator('iframe[title="Counter frame"]');
    await frame.getByRole('button', { name: 'Increment' }).click();
    await frame.getByRole('button', { name: 'Decrement' }).click();
    await frame.getByRole('button', { name: 'Decrement' }).click();
    await expect(counterValue(frame)).toHaveText('-1');

    await frame.getByRole('button', { name: 'Reset' }).click();
    await expect(counterValue(frame)).toHaveText('0');
  });

  test('fills and submits the login form inside the second iframe', async ({ page }) => {
    await page.getByRole('tab', { name: 'Challenge 2' }).click();
    const frame = page.frameLocator('iframe[title="Login frame"]');
    await frame.getByLabel('Username').fill('alice');
    await frame.getByLabel('Password').fill('password123');
    await frame.getByRole('button', { name: 'Sign in' }).click();

    await expect(frame.getByRole('status')).toHaveText('Signed in as alice');
  });

  test('shows a validation message when the iframe login is submitted without a username', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: 'Challenge 2' }).click();
    const frame = page.frameLocator('iframe[title="Login frame"]');
    await frame.getByRole('button', { name: 'Sign in' }).click();

    await expect(frame.getByRole('status')).toHaveText('Username required');
  });
});
