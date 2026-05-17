import { expect, test } from '@playwright/test';

test.describe('Browser Events lab', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/practice/browser-events');
    });

    test('handles an accepted alert dialog and file upload', async ({ page }) => {
        page.once('dialog', async (dialog) => {
            expect(dialog.message()).toContain('alert dialog');
            await dialog.accept();
        });
        await page.getByRole('button', { name: 'Trigger alert' }).click();
        await expect(page.getByRole('status')).toContainText('Last dialog: alert');

        await page.getByLabel('Upload a file').setInputFiles({
            name: 'stagecraft-upload.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('stagecraft'),
        });
        await expect(page.getByRole('status').filter({ hasText: 'Selected:' })).toContainText(
            'stagecraft-upload.txt',
        );
    });

    test('records a dismissed confirm dialog', async ({ page }) => {
        page.once('dialog', async (dialog) => {
            expect(dialog.type()).toBe('confirm');
            await dialog.dismiss();
        });
        await page.getByRole('button', { name: 'Trigger confirm' }).click();

        await expect(page.getByRole('status')).toContainText('Last dialog: confirm');
        await expect(page.getByRole('status')).toContainText('dismissed');
    });

    test('records a prompt dialog with a supplied answer', async ({ page }) => {
        page.once('dialog', async (dialog) => {
            expect(dialog.type()).toBe('prompt');
            await dialog.accept('Stagecraft user');
        });
        await page.getByRole('button', { name: 'Trigger prompt' }).click();

        await expect(page.getByRole('status')).toContainText('Last dialog: prompt');
        await expect(page.getByRole('status')).toContainText('"Stagecraft user"');
    });

    test('captures the suggested filename for a download', async ({ page }) => {
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('link', { name: 'Download sample.txt' }).click();
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toBe('stagecraft-sample.txt');
    });
});
