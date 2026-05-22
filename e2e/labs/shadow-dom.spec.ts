import { test, expect } from '@playwright/test';

test.describe('Shadow DOM & Web Components lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/shadow-dom');
  });

  test('getByRole pierces shadow root to find star radio buttons', async ({ page }) => {
    const stars = page.getByRole('radio', { name: /star/i });
    await expect(stars).toHaveCount(5);
  });

  test('clicking a star updates aria-checked inside shadow root', async ({ page }) => {
    const thirdStar = page.getByRole('radio', { name: '3 stars' });
    await thirdStar.click();
    await expect(thirdStar).toHaveAttribute('aria-checked', 'true');

    // Only the selected radio should be checked; visual fill is separate from ARIA state.
    await expect(page.getByRole('radio', { name: '1 star' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await expect(page.getByRole('radio', { name: '5 stars' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(1);
  });

  test('host element value attribute reflects selected rating', async ({ page }) => {
    await page.getByRole('radio', { name: '4 stars' }).click();

    const hostValue = await page
      .locator('rating-widget')
      .evaluate((el) => el.getAttribute('value'));
    expect(hostValue).toBe('4');
  });

  test('getByLabel reaches input inside labelled-input shadow root', async ({ page }) => {
    const input = page.getByLabel('Your name');
    await expect(input).toBeVisible();
    await input.fill('Alice');
    await expect(input).toHaveValue('Alice');
  });

  test('submit shows review result combining rating and name', async ({ page }) => {
    await page.getByRole('radio', { name: '5 stars' }).click();
    await page.getByLabel('Your name').fill('Bob');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByRole('status')).toContainText('Bob');
    await expect(page.getByRole('status')).toContainText('5 stars');
  });

  test('getByText finds text inside shadow root', async ({ page }) => {
    // The radiogroup label "Star rating" lives inside the shadow root
    await expect(page.getByRole('radiogroup', { name: 'Star rating' })).toBeVisible();
  });
});
