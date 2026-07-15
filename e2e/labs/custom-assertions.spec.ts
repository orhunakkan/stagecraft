import { test, expect as baseExpect, type Locator } from '@playwright/test';
import { checkA11y } from '../axe-helper';

const expect = baseExpect.extend({
  async toBeValidPrice(locator: Locator, options?: { min?: number }) {
    const text = await locator.textContent();
    const value = Number(text?.replace(/[^0-9.]/g, ''));
    const min = options?.min ?? 0;
    const pass = Number.isFinite(value) && value > min;
    return {
      pass,
      message: () => `expected "${text}" to be a valid price greater than ${min}`,
    };
  },
});

test.describe('Custom Assertions & Matcher Composition lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/custom-assertions');
  });

  test('shows the order price and status', async ({ page }) => {
    await expect(page.getByTestId('order-price')).toHaveText('$42.50');
    await expect(page.getByTestId('order-status')).toHaveText('pending');
  });

  test('advancing status moves from pending to shipped to delivered', async ({ page }) => {
    const advance = page.getByRole('button', { name: 'Advance status' });
    await advance.click();
    await expect(page.getByTestId('order-status')).toHaveText('shipped');
    await advance.click();
    await expect(page.getByTestId('order-status')).toHaveText('delivered');
    await expect(advance).toBeDisabled();
  });

  test('selecting a star rating updates the accessible radio state', async ({ page }) => {
    await page.getByRole('radio', { name: '4 stars' }).click();
    await expect(page.getByRole('radio', { name: '4 stars' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.getByTestId('rating-value')).toHaveText('Rating: 4 / 5');
  });

  test('the order price is a valid custom-matcher-verified price', async ({ page }) => {
    await expect(page.getByTestId('order-price')).toBeValidPrice({ min: 0 });
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
