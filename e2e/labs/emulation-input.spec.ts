import { expect, test } from '@playwright/test';

test.describe('Emulation & Input lab', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/practice/emulation-input');
    });

    test('opens the command palette with the button and executes a command via keyboard', async ({ page }) => {
        await page.getByRole('button', { name: 'Open command palette' }).click();
        await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await expect(page.getByRole('status')).toContainText('Executed: Open file');
    });

    test('opens the palette with Ctrl+K and dismisses with Escape', async ({ page }) => {
        // Click the page body first so the document has focus for the global keydown handler.
        await page.locator('body').click({ position: { x: 5, y: 5 } });
        await page.keyboard.press('Control+KeyK');
        await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog', { name: 'Command palette' })).not.toBeVisible();
    });

    test('shows hover tooltip and reveals the scroll action after scrolling', async ({ page }) => {
        await page.getByRole('button', { name: 'Hover over me' }).hover();
        await expect(page.getByRole('tooltip')).toContainText('You found the tooltip!');

        const scroller = page.getByTestId('scroll-container');
        await scroller.evaluate((element) => {
            element.scrollTop = 120;
            element.dispatchEvent(new Event('scroll', { bubbles: true }));
        });

        await expect(page.getByRole('button', { name: /Scroll to top/ })).toBeVisible();
    });

    test('clicking a palette option directly executes the command and closes the palette', async ({ page }) => {
        await page.getByRole('button', { name: 'Open command palette' }).click();
        await page.getByRole('option', { name: /Run tests/ }).click();

        await expect(page.getByRole('dialog', { name: 'Command palette' })).not.toBeVisible();
        await expect(page.getByRole('status')).toContainText('Executed: Run tests');
    });

    test('mobile viewport shows stacked layout copy on the responsive card', async ({ page }) => {
        await page.setViewportSize({ width: 400, height: 800 });
        await expect(page.getByText('Mobile layout (stacked)')).toBeVisible();
        await expect(page.getByText('Wide layout (side-by-side)')).not.toBeVisible();
    });
});
