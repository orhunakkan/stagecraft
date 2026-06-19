import { test, expect } from '@playwright/test';
import { checkA11y } from '../axe-helper';

const STUB_ITEMS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `Stubbed item ${i + 1}`,
  body: `Body for stubbed item ${i + 1}.`,
  createdAt: '2026-05-01T00:00:00Z',
}));

test.describe('Scroll & Lazy Loading lab', () => {
  test('initial 8 items are visible after page load', async ({ page }) => {
    await page.goto('/practice/scroll-lazy-loading');
    const feed = page.getByRole('list', { name: 'Activity feed' });
    await expect(feed).toBeVisible();
    await expect(feed.getByRole('listitem').nth(7)).toBeVisible();
  });

  test('scrolling to sentinel loads more items', async ({ page }) => {
    await page.goto('/practice/scroll-lazy-loading');
    const feed = page.getByRole('list', { name: 'Activity feed' });
    await expect(feed.getByRole('listitem').nth(7)).toBeVisible();

    // Scroll the last visible item into view to trigger the sentinel
    const lastItem = feed.getByRole('listitem').last();
    await lastItem.scrollIntoViewIfNeeded();

    // After scroll, more items should load (> 8)
    await expect(feed.getByRole('listitem').nth(8)).toBeVisible({ timeout: 5000 });
  });

  test('end marker appears after all pages are loaded', async ({ page }) => {
    await page.goto('/practice/scroll-lazy-loading');
    const feed = page.getByRole('list', { name: 'Activity feed' });

    // Scroll down repeatedly until end marker appears
    for (let i = 0; i < 8; i++) {
      const last = feed.getByRole('listitem').last();
      await last.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    }

    await expect(page.getByTestId('end-marker')).toBeVisible({ timeout: 10000 });
  });

  test('scrollIntoViewIfNeeded brings a specific item into viewport', async ({ page }) => {
    await page.goto('/practice/scroll-lazy-loading');

    // Load enough pages to have item #20
    const feed = page.getByRole('list', { name: 'Activity feed' });
    for (let i = 0; i < 3; i++) {
      await feed.getByRole('listitem').last().scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
    }

    const item20 = page.locator('[data-item-id="20"]');
    await item20.scrollIntoViewIfNeeded();
    await expect(item20).toBeInViewport();
  });

  test('page.route stub overrides feed endpoint', async ({ page }) => {
    await page.route('/api/feed*', (route) => {
      const url = new URL(route.request().url());
      const pageNum = Number(url.searchParams.get('page') ?? '1');
      const items = pageNum === 1 ? STUB_ITEMS.slice(0, 8) : [];
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          page: pageNum,
          pageSize: 8,
          total: 8,
          hasMore: false,
        }),
      });
    });

    await page.goto('/practice/scroll-lazy-loading');
    const feed = page.getByRole('list', { name: 'Activity feed' });
    await expect(feed.locator('[data-item-id="1"]')).toBeVisible();
    await expect(feed.locator('[data-item-id="8"]')).toBeVisible();
    // End marker should appear since hasMore is always false
    await expect(page.getByTestId('end-marker')).toBeVisible();
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await page.goto('/practice/scroll-lazy-loading');
    await checkA11y(page);
  });
});
