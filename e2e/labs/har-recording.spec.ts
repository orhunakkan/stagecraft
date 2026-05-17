import { expect, test } from '@playwright/test';

test.describe('HAR Recording lab', () => {
  test('loads products from the API-backed catalog', async ({ page }) => {
    await page.goto('/practice/har-recording');

    await expect(page.getByRole('status')).toContainText('10 products loaded');
    await expect(page.getByTestId('product-1')).toContainText('Mechanical Keyboard');
  });

  test('renders an error alert when the product API fails', async ({ page }) => {
    await page.route('/api/products', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unavailable' }),
      }),
    );

    await page.goto('/practice/har-recording');

    await expect(page.getByRole('alert')).toContainText('HTTP 503');
  });

  test('replays a mocked product list from a route override', async ({ page }) => {
    await page.route('/api/products', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 99, name: 'Replayed Mouse', category: 'Peripherals', price: 25.5, inStock: true },
        ]),
      }),
    );

    await page.goto('/practice/har-recording');

    await expect(page.getByRole('status').filter({ hasText: 'products loaded' })).toContainText(
      '1 products loaded',
    );
    await expect(page.getByTestId('product-99')).toContainText('Replayed Mouse');
    await expect(page.getByTestId('product-99')).toContainText('$25.50');
  });

  test('reload button refetches the catalog after the initial load', async ({ page }) => {
    let calls = 0;
    await page.route('/api/products', async (route) => {
      calls++;
      await route.continue();
    });

    await page.goto('/practice/har-recording');
    await expect(page.getByRole('status').filter({ hasText: 'products loaded' })).toBeVisible();

    await page.getByTestId('fetch-products').click();
    await expect.poll(() => calls).toBeGreaterThanOrEqual(2);
  });
});
