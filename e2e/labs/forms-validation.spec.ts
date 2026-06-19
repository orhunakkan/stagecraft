import { test, expect, type Page } from '@playwright/test';
import { checkA11y } from '../axe-helper';

async function fillValidForm(page: Page) {
  await page.getByLabel(/Full name/).fill('Alice Smith');
  await page.getByLabel(/Email address/).fill('alice@example.com');
  await page.getByLabel(/Topic category/).selectOption('technology');
  await page.getByRole('radio', { name: 'Weekly' }).check();
  await page.getByRole('checkbox').check();
}

test.describe('Forms & Validation lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/forms-validation');
  });

  test('Subscribe button is disabled on load', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Subscribe' })).toBeDisabled();
  });

  test('blurring an empty name field shows an error', async ({ page }) => {
    await page.getByLabel(/Full name/).focus();
    await page.getByLabel(/Email address/).focus(); // blur name
    await expect(page.getByRole('alert').filter({ hasText: 'Full name must be' })).toBeVisible();
  });

  test('invalid email shows a validation error', async ({ page }) => {
    await page.getByLabel(/Email address/).fill('not-an-email');
    await page.getByLabel(/Full name/).focus(); // blur email
    await expect(page.getByRole('alert').filter({ hasText: 'valid email' })).toBeVisible();
  });

  test('Subscribe enables once all required fields are filled', async ({ page }) => {
    await fillValidForm(page);
    await expect(page.getByRole('button', { name: 'Subscribe' })).toBeEnabled();
  });

  test('submitting a valid form shows the success state', async ({ page }) => {
    await fillValidForm(page);
    await page.getByRole('button', { name: 'Subscribe' }).click();
    await expect(page.getByRole('alert')).toContainText('Subscribed!');
    await expect(page.getByRole('alert')).toContainText('Alice Smith');
  });

  test('Reset form returns to the empty form', async ({ page }) => {
    await fillValidForm(page);
    await page.getByRole('button', { name: 'Subscribe' }).click();
    await page.getByRole('button', { name: 'Reset form' }).click();
    await expect(page.getByRole('form', { name: 'Newsletter signup form' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscribe' })).toBeDisabled();
  });

  test('aria-invalid is set on a blurred invalid field', async ({ page }) => {
    await page.getByLabel(/Full name/).focus();
    await page.getByLabel(/Email address/).focus();
    await expect(page.getByLabel(/Full name/)).toHaveAttribute('aria-invalid', 'true');
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
