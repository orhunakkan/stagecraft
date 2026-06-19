import { test, expect } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('Accessible Locators lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/accessible-locators');
  });

  test('shows all 6 books on load', async ({ page }) => {
    await expect(page.getByRole('status')).toContainText('Showing 6 of 6 books');
  });

  test('search by title filters results and updates status', async ({ page }) => {
    await page.getByLabel('Search books').fill('Clean Code');
    await expect(page.getByRole('status')).toContainText('Showing 1 of 6 books');
    await expect(page.getByRole('heading', { name: 'Clean Code', level: 3 })).toBeVisible();
  });

  test('search with no match shows empty state', async ({ page }) => {
    await page.getByLabel('Search books').fill('xyzzy-no-match');
    await expect(page.getByRole('status')).toContainText('No books found.');
    await expect(page.getByRole('region', { name: 'Book results' })).toContainText(
      'Try a different search or filter.',
    );
  });

  test('genre filter shows only matching books', async ({ page }) => {
    await page.getByLabel('Filter by genre').selectOption('Architecture');
    // Design Patterns + Domain-Driven Design
    await expect(page.getByRole('status')).toContainText('Showing 2 of 6 books');
  });

  test('Add to wishlist toggles aria-pressed', async ({ page }) => {
    const btn = page
      .getByRole('region', { name: 'Book results' })
      .getByRole('button', { name: 'Add to wishlist' })
      .first();
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  test('wishlist alert appears after adding a book', async ({ page }) => {
    await page
      .getByRole('region', { name: 'Book results' })
      .getByRole('button', { name: 'Add to wishlist' })
      .first()
      .click();
    await expect(page.getByRole('alert')).toContainText('1 book in your wishlist');
  });

  test('wishlist count increments for each added book', async ({ page }) => {
    const buttons = page
      .getByRole('region', { name: 'Book results' })
      .getByRole('button', { name: 'Add to wishlist' });
    await buttons.nth(0).click();
    await buttons.nth(1).click();
    await expect(page.getByRole('alert')).toContainText('2 books in your wishlist');
  });

  test('catalog pagination nav is present', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Catalog pagination' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  test('book covers have descriptive alt text', async ({ page }) => {
    const imgs = page.getByRole('img');
    for (const img of await imgs.all()) {
      await expect(img).toHaveAttribute('alt', /book cover/i);
    }
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
