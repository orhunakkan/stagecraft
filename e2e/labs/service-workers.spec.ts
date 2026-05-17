import { expect, test } from '@playwright/test';

test.describe('Service Workers lab', () => {
    test('fetches server items when service workers are blocked', async ({ browser }) => {
        const context = await browser.newContext({ serviceWorkers: 'block' });
        const page = await context.newPage();
        await page.goto('/practice/service-workers');

        await page.getByTestId('fetch-items-btn').click();

        await expect(page.getByRole('list', { name: 'Fetched items' })).toContainText('Fresh Widget');
        await expect(page.getByTestId('sw-item-1')).toContainText('network');
        await context.close();
    });

    test('surfaces fetch failures when the network endpoint errors', async ({ browser }) => {
        const context = await browser.newContext({ serviceWorkers: 'block' });
        const page = await context.newPage();
        await page.route('/api/sw-items', (route) =>
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Server error' }),
            }),
        );
        await page.goto('/practice/service-workers');

        await page.getByTestId('fetch-items-btn').click();

        await expect(page.getByRole('alert')).toContainText('HTTP 500');
        await context.close();
    });

    test('fetch items button is disabled while the request is in flight', async ({ browser }) => {
        const context = await browser.newContext({ serviceWorkers: 'block' });
        const page = await context.newPage();

        let release: (() => void) | undefined;
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        await page.route('/api/sw-items', async (route) => {
            await gate;
            await route.continue();
        });

        await page.goto('/practice/service-workers');
        await page.getByTestId('fetch-items-btn').click();

        await expect(page.getByTestId('fetch-items-btn')).toBeDisabled();
        await expect(page.getByRole('status', { name: 'Loading' })).toBeVisible();

        release!();
        await expect(page.getByTestId('fetch-items-btn')).toBeEnabled();
        await context.close();
    });

    test('can replay a fully mocked items list when SW is blocked', async ({ browser }) => {
        const context = await browser.newContext({ serviceWorkers: 'block' });
        const page = await context.newPage();
        await page.route('/api/sw-items', (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([
                    { id: 42, name: 'Mocked Item', source: 'cache' },
                ]),
            }),
        );
        await page.goto('/practice/service-workers');

        await page.getByTestId('fetch-items-btn').click();
        await expect(page.getByTestId('sw-item-42')).toContainText('Mocked Item');
        await expect(page.getByTestId('sw-item-42')).toContainText('cache');

        await context.close();
    });
});
