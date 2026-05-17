import { expect, test } from '@playwright/test';

test.describe('Multi-Tab lab', () => {
    test('opens a new tab and shares localStorage with the opener', async ({ context, page }) => {
        await page.goto('/practice/multi-tab');

        const newPagePromise = context.waitForEvent('page');
        await page.getByRole('button', { name: 'Open dashboard in new tab' }).click();
        const newPage = await newPagePromise;
        await expect(newPage.getByRole('heading', { name: 'Dashboard (New Tab)' })).toBeVisible();

        await newPage.getByTestId('write-storage').click();
        await newPage.close();
        await page.getByRole('button', { name: 'Reload to refresh value' }).click();

        await expect(page.getByTestId('shared-storage-value')).toContainText('written-from-tab-');
    });

    test('captures a popup window and sends a result from the popup', async ({ page }) => {
        await page.goto('/practice/multi-tab');

        const popupPromise = page.waitForEvent('popup');
        await page.getByRole('button', { name: 'Open popup window' }).click();
        const popup = await popupPromise;
        await expect(popup.getByRole('heading', { name: 'Popup Window' })).toBeVisible();

        await popup.getByLabel('Value to send to opener').fill('Popup result');
        await popup.getByTestId('send-result').click();

        await expect(popup.getByRole('status')).toContainText('Sent!');
        await popup.close();
    });

    test('shows the shared storage placeholder when nothing has been written yet', async ({ page }) => {
        await page.goto('/practice/multi-tab');
        await page.evaluate(() => localStorage.removeItem('multi-tab:shared'));
        await page.getByRole('button', { name: 'Reload to refresh value' }).click();

        await expect(page.getByTestId('shared-storage-value')).toHaveText('(none)');
    });

    test('opening the new tab adds a second page to the context', async ({ context, page }) => {
        await page.goto('/practice/multi-tab');

        const before = context.pages().length;
        const newPagePromise = context.waitForEvent('page');
        await page.getByRole('button', { name: 'Open dashboard in new tab' }).click();
        const newPage = await newPagePromise;

        expect(context.pages().length).toBe(before + 1);
        expect(newPage.url()).toContain('/practice/multi-tab/window');
        await newPage.close();
    });
});
