import { expect, test } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('ARIA Snapshots lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/aria-snapshots');
  });

  test('updates accordion expanded state and live announcement', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'What is an ARIA snapshot?' });
    await trigger.click();

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('region', { name: 'What is an ARIA snapshot?' })).toBeVisible();
    await expect(page.getByLabel('Live announcements')).toContainText(
      'What is an ARIA snapshot? expanded',
    );
  });

  test('opening a second accordion section collapses the first', async ({ page }) => {
    const first = page.getByRole('button', { name: 'What is an ARIA snapshot?' });
    const second = page.getByRole('button', { name: 'When should I use toMatchAriaSnapshot?' });

    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');

    await second.click();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
  });

  test('moves aria-current through the wizard steps', async ({ page }) => {
    await expect(page.getByRole('button', { name: '1. Account' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    await page.getByRole('button', { name: 'Next' }).click();

    await expect(page.getByRole('button', { name: '2. Profile' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    await expect(page.getByRole('form', { name: 'Profile step' })).toBeVisible();
  });

  test('wizard Back/Next buttons are disabled at the boundaries', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Back' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Next' })).toBeEnabled();

    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Next' }).click();
    }

    await expect(page.getByRole('button', { name: 'Back' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
    await expect(page.getByRole('button', { name: '4. Review' })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  test('announces collapse when the same accordion section is clicked twice', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'How is this different from getByRole?' });

    await trigger.click();
    await expect(page.getByLabel('Live announcements')).toContainText('expanded');

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByLabel('Live announcements')).toContainText('collapsed');
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
