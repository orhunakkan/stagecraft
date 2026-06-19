import { test, expect } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('Soft Assertions & Test Steps lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/soft-assertions');
  });

  test('all dashboard widgets are present (soft assertions)', async ({ page }) => {
    await test.step('Check profile widget', async () => {
      await expect.soft(page.getByLabel('Name field')).toContainText('Jane Doe');
      await expect.soft(page.getByLabel('Email field')).toContainText('jane@example.com');
      await expect.soft(page.getByLabel('Role field')).toContainText('Engineer');
    });

    await test.step('Check notifications widget', async () => {
      await expect.soft(page.getByLabel('Notification count')).toHaveText('3');
    });

    await test.step('Check activity score widget is visible', async () => {
      await expect.soft(page.getByLabel('Activity score value')).toBeVisible();
    });

    await test.step('Check status badge is visible', async () => {
      await expect.soft(page.getByLabel('Status badge')).toBeVisible();
    });
  });

  test('activity score reaches expected value via expect.poll', async ({ page }) => {
    await expect
      .poll(
        async () => {
          const text = await page.getByTestId('activity-score').textContent();
          return Number(text);
        },
        { timeout: 5000 },
      )
      .toBe(87);
  });

  test('status badge settles on active via toPass', async ({ page }) => {
    await expect(async () => {
      await expect(page.getByLabel('Status badge')).toHaveText('active');
    }).toPass({ timeout: 5000 });
  });

  test('test.step groups appear in annotations', async ({ page }) => {
    test.info().annotations.push({
      type: 'issue',
      description: 'DASH-42: verify dashboard widget integrity',
    });

    await test.step('Profile completeness check', async () => {
      await expect(page.getByLabel('Profile completeness')).toBeVisible();
    });

    await test.step('Notification badge check', async () => {
      await expect(page.getByTestId('notification-count')).toBeVisible();
    });
  });

  test('activity score is initially 0 before timer fires', async ({ page }) => {
    // Check immediately after load — before the 2-second timer
    const score = await page.getByTestId('activity-score').textContent();
    expect(Number(score)).toBe(0);
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
