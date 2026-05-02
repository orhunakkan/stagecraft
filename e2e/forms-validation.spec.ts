import { expect, test } from '@playwright/test';

test.describe('Forms and Validation lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/forms-validation');
  });

  test('page loads with correct title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Forms and Validation Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: /forms and validation lab/i }),
    ).toBeVisible();
  });

  // getByLabel practice — text input
  test('full name input is locatable by its label', async ({ page }) => {
    const input = page.getByLabel(/full name/i);
    await expect(input).toBeVisible();
    await input.fill('Alice Tester');
    await expect(input).toHaveValue('Alice Tester');
  });

  // getByLabel practice — email input
  test('email address input is locatable by its label', async ({ page }) => {
    const input = page.getByLabel(/email address/i);
    await expect(input).toBeVisible();
    await input.fill('alice@example.com');
    await expect(input).toHaveValue('alice@example.com');
  });

  // getByLabel practice — select
  test('session select is locatable by its label', async ({ page }) => {
    const select = page.getByLabel(/session/i);
    await expect(select).toBeVisible();
    await select.selectOption('morning');
    await expect(select).toHaveValue('morning');
  });

  // getByRole('radio') practice
  test('experience level radio buttons are locatable by role and name', async ({ page }) => {
    await expect(page.getByRole('radio', { name: 'Beginner' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Intermediate' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Advanced' })).toBeVisible();

    await page.getByRole('radio', { name: 'Intermediate' }).check();
    await expect(page.getByRole('radio', { name: 'Intermediate' })).toBeChecked();
  });

  // getByRole('checkbox') practice — topic checkboxes
  test('topic checkboxes are locatable by role and name', async ({ page }) => {
    for (const topic of ['Locators', 'Assertions', 'Network', 'Auth']) {
      await expect(page.getByRole('checkbox', { name: topic })).toBeVisible();
    }
    await page.getByRole('checkbox', { name: 'Assertions' }).check();
    await expect(page.getByRole('checkbox', { name: 'Assertions' })).toBeChecked();
  });

  // Submit button disabled/enabled state
  test('submit button is disabled when the form is empty', async ({ page }) => {
    await expect(page.getByRole('button', { name: /register for workshop/i })).toBeDisabled();
  });

  test('submit button becomes enabled after all fields are completed', async ({ page }) => {
    await page.getByLabel(/full name/i).fill('Bob Tester');
    await page.getByLabel(/email address/i).fill('bob@example.com');
    await page.getByLabel(/session/i).selectOption('afternoon');
    // Web-first assertion confirms the select change settled before proceeding
    await expect(page.getByLabel(/session/i)).toHaveValue('afternoon');
    await page.getByRole('radio', { name: 'Advanced' }).click();
    await expect(page.getByRole('radio', { name: 'Advanced' })).toBeChecked();
    await page.getByRole('checkbox', { name: 'Network' }).check();
    await expect(page.getByRole('checkbox', { name: 'Network' })).toBeChecked();
    await page.getByRole('checkbox', { name: /i agree.*code of conduct/i }).check();
    await expect(page.getByRole('checkbox', { name: /i agree.*code of conduct/i })).toBeChecked();

    await expect(page.getByRole('button', { name: /register for workshop/i })).toBeEnabled();
  });

  // Validation message — blur on empty field
  test('validation message appears when full name field is left empty', async ({ page }) => {
    await page.getByLabel(/full name/i).click();
    await page.getByLabel(/email address/i).click(); // blur full name

    await expect(page.getByText(/please enter your full name/i)).toBeVisible();
  });

  // Validation message — invalid email format
  test('validation message appears for an invalid email address', async ({ page }) => {
    await page.getByLabel(/email address/i).fill('not-valid');
    // Tab away to trigger blur — more reliable than clicking another field across browsers
    await page.keyboard.press('Tab');

    await expect(page.getByText(/valid email address/i)).toBeVisible();
  });

  // aria-invalid state
  test('input has aria-invalid=true when it has a visible error', async ({ page }) => {
    await page.getByLabel(/full name/i).click();
    await page.getByLabel(/email address/i).click(); // blur full name

    await expect(page.getByLabel(/full name/i)).toHaveAttribute('aria-invalid', 'true');
  });

  // Confirmation after valid submission
  test('shows a confirmation heading after a valid form is submitted', async ({ page }) => {
    await page.getByLabel(/full name/i).fill('Carol Dev');
    await page.getByLabel(/email address/i).fill('carol@example.com');
    await page.getByLabel(/session/i).selectOption('evening');
    await expect(page.getByLabel(/session/i)).toHaveValue('evening');
    await page.getByRole('radio', { name: 'Beginner' }).click();
    await expect(page.getByRole('radio', { name: 'Beginner' })).toBeChecked();
    await page.getByRole('checkbox', { name: 'Locators' }).check();
    await expect(page.getByRole('checkbox', { name: 'Locators' })).toBeChecked();
    await page.getByRole('checkbox', { name: /i agree.*code of conduct/i }).check();
    await expect(page.getByRole('checkbox', { name: /i agree.*code of conduct/i })).toBeChecked();

    await page.getByRole('button', { name: /register for workshop/i }).click();

    await expect(page.getByRole('heading', { name: /registration confirmed/i })).toBeVisible();
    await expect(page.getByText(/carol dev/i)).toBeVisible();
  });

  // Reset restores initial state
  test('Reset lab button clears the form and disables submit', async ({ page }) => {
    await page.getByLabel(/full name/i).fill('Dave');
    await page.getByRole('button', { name: /reset lab/i }).click();

    await expect(page.getByLabel(/full name/i)).toHaveValue('');
    await expect(page.getByRole('button', { name: /register for workshop/i })).toBeDisabled();
  });

  // Challenge detail practice link
  test('challenge detail links to this lab', async ({ page }) => {
    await page.goto('/challenges/forms-validation');

    await page.getByRole('link', { name: /open forms and validation lab/i }).click();
    await expect(page).toHaveURL('/practice/forms-validation');
  });
});
