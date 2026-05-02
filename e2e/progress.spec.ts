import { expect, test } from '@playwright/test';

test.describe('self-marked progress', () => {
  // Each Playwright test runs in an isolated browser context with empty storage.
  // No explicit localStorage cleanup is needed between tests.

  test('renders progress controls on a challenge detail page', async ({ page }) => {
    await page.goto('/challenges/accessible-locators');

    await expect(page.getByRole('heading', { name: /my progress/i })).toBeVisible();
    await expect(page.getByText(/self-marked/i)).toBeVisible();
    await expect(page.getByText(/not graded/i)).toBeVisible();

    const group = page.getByRole('group', { name: /mark your progress/i });
    await expect(group.getByRole('button', { name: 'Not started' })).toBeVisible();
    await expect(group.getByRole('button', { name: 'In progress' })).toBeVisible();
    await expect(group.getByRole('button', { name: 'Practiced' })).toBeVisible();
    await expect(group.getByRole('button', { name: 'Completed' })).toBeVisible();
  });

  test('defaults to Not started when no progress is stored', async ({ page }) => {
    await page.goto('/challenges/accessible-locators');

    const group = page.getByRole('group', { name: /mark your progress/i });
    await expect(group.getByRole('button', { name: 'Not started' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('marks a challenge as In progress and persists across reload', async ({ page }) => {
    await page.goto('/challenges/accessible-locators');

    const group = page.getByRole('group', { name: /mark your progress/i });
    await group.getByRole('button', { name: 'In progress' }).click();

    await expect(group.getByRole('button', { name: 'In progress' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Reload and verify persistence
    await page.reload();

    const reloadedGroup = page.getByRole('group', { name: /mark your progress/i });
    await expect(reloadedGroup.getByRole('button', { name: 'In progress' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('marks a challenge as Completed', async ({ page }) => {
    await page.goto('/challenges/forms-validation');

    const group = page.getByRole('group', { name: /mark your progress/i });
    await group.getByRole('button', { name: 'Completed' }).click();

    await expect(group.getByRole('button', { name: 'Completed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(group.getByRole('button', { name: 'Not started' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('progress is independent per challenge', async ({ page }) => {
    // Mark accessible-locators as Completed
    await page.goto('/challenges/accessible-locators');
    await page
      .getByRole('group', { name: /mark your progress/i })
      .getByRole('button', { name: 'Completed' })
      .click();

    // forms-validation should still show Not started
    await page.goto('/challenges/forms-validation');
    const group = page.getByRole('group', { name: /mark your progress/i });
    await expect(group.getByRole('button', { name: 'Not started' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('reset all progress shows confirmation before clearing', async ({ page }) => {
    await page.goto('/challenges/accessible-locators');

    // Mark progress first
    await page
      .getByRole('group', { name: /mark your progress/i })
      .getByRole('button', { name: 'Practiced' })
      .click();

    // Click reset — should show confirmation
    await page.getByRole('button', { name: /reset all progress/i }).click();

    await expect(page.getByRole('button', { name: /confirm reset/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('cancel does not reset progress', async ({ page }) => {
    await page.goto('/challenges/accessible-locators');

    await page
      .getByRole('group', { name: /mark your progress/i })
      .getByRole('button', { name: 'Practiced' })
      .click();

    await page.getByRole('button', { name: /reset all progress/i }).click();
    await page.getByRole('button', { name: /cancel/i }).click();

    const group = page.getByRole('group', { name: /mark your progress/i });
    await expect(group.getByRole('button', { name: 'Practiced' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('confirm reset clears all progress and returns to Not started', async ({ page }) => {
    // Mark two challenges
    await page.goto('/challenges/accessible-locators');
    await page
      .getByRole('group', { name: /mark your progress/i })
      .getByRole('button', { name: 'Completed' })
      .click();

    await page.goto('/challenges/forms-validation');
    await page
      .getByRole('group', { name: /mark your progress/i })
      .getByRole('button', { name: 'Practiced' })
      .click();

    // Reset all from the forms-validation page
    await page.getByRole('button', { name: /reset all progress/i }).click();
    await page.getByRole('button', { name: /confirm reset/i }).click();

    // Current page should show Not started
    const group = page.getByRole('group', { name: /mark your progress/i });
    await expect(group.getByRole('button', { name: 'Not started' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Navigate to accessible-locators and confirm it is also reset
    await page.goto('/challenges/accessible-locators');
    const groupAfter = page.getByRole('group', { name: /mark your progress/i });
    await expect(groupAfter.getByRole('button', { name: 'Not started' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
