import { test, expect } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('Web Storage & Partitioned Cookies lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/client-storage-partitioning');
  });

  test('theme preference survives a reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle theme preference' }).click();
    await expect(page.getByTestId('theme-pref-value')).toContainText('dark');

    await page.reload();

    await expect(page.getByTestId('theme-pref-value')).toContainText('dark');
  });

  test('draft note is not shared with a second page in the same context', async ({
    page,
    context,
  }) => {
    await page.getByLabel('Draft note').fill('Remember to check partitioned cookies');
    await expect(page.getByLabel('Draft note')).toHaveValue(
      'Remember to check partitioned cookies',
    );

    const secondPage = await context.newPage();
    await secondPage.goto('/practice/client-storage-partitioning');
    await expect(secondPage.getByLabel('Draft note')).toHaveValue('');
    await secondPage.close();
  });

  test('the widget is locked until a partitioned cookie is present', async ({ page }) => {
    await expect(page.getByTestId('widget-status')).toContainText('Widget locked');
  });

  test('setting the cookie mid-test unlocks the widget after a recheck', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: 'widget_partitioned',
        value: '1',
        url: page.url(),
      },
    ]);

    await page.getByRole('button', { name: 'Re-check cookie' }).click();

    await expect(page.getByTestId('widget-status')).toContainText('Widget content unlocked');
  });

  test('context.cookies() reflects the widget cookie after it is set', async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: 'widget_partitioned',
        value: '1',
        url: page.url(),
      },
    ]);

    const cookies = await context.cookies();
    const widgetCookie = cookies.find((c) => c.name === 'widget_partitioned');
    expect(widgetCookie?.value).toBe('1');
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
