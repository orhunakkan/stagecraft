import { expect, test } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('Visual Regression lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/visual-regression');
  });

  test('renders stable visual test targets', async ({ page }) => {
    await expect(page.getByTestId('button-showcase')).toContainText('Primary');
    await expect(page.getByTestId('color-palette')).toContainText('Indigo 600');
    await expect(page.getByTestId('bar-chart')).toBeVisible();
  });

  test('marks dynamic timestamp regions and disables the disabled button variant', async ({
    page,
  }) => {
    await expect(page.getByRole('button', { name: 'Disabled' })).toBeDisabled();
    await expect(page.getByTestId('dynamic-timestamp')).toHaveCount(3);
    await expect(page.getByTestId('metric-cards')).toContainText('Updated:');
  });

  test('renders all five button variants in the showcase', async ({ page }) => {
    const showcase = page.getByTestId('button-showcase');
    for (const label of ['Primary', 'Secondary', 'Danger', 'Ghost', 'Disabled']) {
      await expect(showcase.getByRole('button', { name: label, exact: true })).toBeVisible();
    }
  });

  test('color palette includes every named swatch with its hex code', async ({ page }) => {
    const palette = page.getByTestId('color-palette');
    const swatches = [
      { name: 'Indigo 600', hex: '#4f46e5' },
      { name: 'Violet 600', hex: '#7c3aed' },
      { name: 'Sky 500', hex: '#0ea5e9' },
      { name: 'Emerald 500', hex: '#10b981' },
      { name: 'Amber 400', hex: '#fbbf24' },
      { name: 'Rose 500', hex: '#f43f5e' },
    ];
    for (const { name, hex } of swatches) {
      await expect(palette.getByLabel(`${name} color swatch`)).toBeVisible();
      await expect(palette.getByText(hex)).toBeVisible();
    }
  });

  test('weekly bar chart exposes one accessible bar per day', async ({ page }) => {
    const chart = page.getByRole('img', { name: 'Weekly sessions bar chart' });
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
      await expect(chart.getByLabel(new RegExp(`^${day}:`))).toHaveCount(1);
    }
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
