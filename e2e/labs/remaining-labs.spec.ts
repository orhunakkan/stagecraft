import { expect, test } from '@playwright/test';

test.describe('Tables & Filtering lab', () => {
    test('filters employee rows by search query', async ({ page }) => {
        await page.goto('/practice/tables-filtering');

        await page.getByLabel('Search').fill('Alice');

        await expect(page.getByRole('status')).toContainText('1 employees');
        await expect(page.getByRole('cell', { name: 'Alice Chen', exact: true })).toBeVisible();
    });
});

test.describe('Browser Events lab', () => {
    test('handles dialogs and file uploads', async ({ page }) => {
        await page.goto('/practice/browser-events');

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
});

test.describe('Frames & Contexts lab', () => {
    test('interacts with the counter inside an iframe', async ({ page }) => {
        await page.goto('/practice/frames-contexts');

        const frame = page.frameLocator('iframe[title="Counter frame"]');
        await frame.getByRole('button', { name: 'Increment' }).click();

        await expect(frame.locator('#count')).toHaveText('1');
    });
});

test.describe('Emulation & Input lab', () => {
    test('opens the command palette with keyboard input and executes a command', async ({ page }) => {
        await page.goto('/practice/emulation-input');

        await page.getByRole('button', { name: 'Open command palette' }).click();
        await expect(page.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');

        await expect(page.getByRole('status')).toContainText('Executed: Open file');
    });
});

test.describe('Debugging & Reporting lab', () => {
    test('expands the screenshot attachment panel', async ({ page }) => {
        await page.goto('/practice/debugging-reporting');

        await page.getByRole('button', { name: 'Expand panel' }).click();

        await expect(page.getByTestId('expandable-panel')).toContainText('Take a screenshot here');
        await expect(page.getByRole('button', { name: 'Collapse panel' })).toHaveAttribute(
            'aria-expanded',
            'true',
        );
    });
});

test.describe('WebSocket Interception lab', () => {
    test('connects to the WebSocket server and echoes a sent message', async ({ page }) => {
        await page.goto('/practice/websocket-interception');

        await page.getByTestId('ws-connect').click();
        await expect(page.getByTestId('ws-status')).toHaveText('connected');
        await expect(page.getByLabel('WebSocket message log')).toContainText('Welcome');

        await page.getByLabel('Message to send').fill('hello socket');
        await page.getByTestId('ws-send').click();

        await expect(page.getByLabel('WebSocket message log')).toContainText('echo: hello socket');
    });
});

test.describe('ARIA Snapshots lab', () => {
    test('updates accordion expanded state and live announcement', async ({ page }) => {
        await page.goto('/practice/aria-snapshots');

        const trigger = page.getByRole('button', { name: 'What is an ARIA snapshot?' });
        await trigger.click();

        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(page.getByRole('region', { name: 'What is an ARIA snapshot?' })).toBeVisible();
        await expect(page.getByLabel('Live announcements')).toContainText(
            'What is an ARIA snapshot? expanded',
        );
    });
});

test.describe('Clock & Timers lab', () => {
    test('renders a fixed current date when browser time is controlled', async ({ page }) => {
        await page.clock.install({ time: new Date('2026-01-15T12:00:00') });
        await page.goto('/practice/clock-timers');

        await expect(page.getByTestId('current-date')).toHaveText('Thursday, January 15, 2026');
    });
});

test.describe('API Request Context lab', () => {
    test('adds a task through the API-backed UI', async ({ page }) => {
        await page.goto('/practice/api-request-context');

        const title = `E2E task ${Date.now()}`;
        await page.getByLabel('New task title').fill(title);
        await page.getByRole('button', { name: 'Add' }).click();

        await expect(page.getByRole('list', { name: 'Task list' })).toContainText(title);
    });
});

test.describe('Storage State lab', () => {
    test('shows admin-only content after logging in as alice', async ({ page }) => {
        await page.goto('/practice/fake-auth');
        await page.getByLabel('Username').fill('alice');
        await page.getByLabel('Password').fill('password123');
        await page.getByRole('button', { name: 'Sign in' }).click();
        await expect(page).toHaveURL('/practice/fake-auth/dashboard');

        await page.goto('/practice/storage-state');

        await expect(page.getByTestId('display-name')).toHaveText('Alice Chen');
        await expect(page.getByTestId('admin-panel')).toBeVisible();
    });
});

test.describe('Visual Regression lab', () => {
    test('renders stable visual test targets', async ({ page }) => {
        await page.goto('/practice/visual-regression');

        await expect(page.getByTestId('button-showcase')).toContainText('Primary');
        await expect(page.getByTestId('color-palette')).toContainText('Indigo 600');
        await expect(page.getByTestId('bar-chart')).toBeVisible();
    });
});

test.describe('Drag & Drop lab', () => {
    test('moves a kanban card between columns', async ({ page }) => {
        await page.goto('/practice/drag-and-drop');

        const card = page.getByLabel('Write Playwright tests');
        const done = page.getByLabel('Done column');
        await card.dragTo(done);

        await expect(done).toContainText('Write Playwright tests');
        await expect(page.getByLabel('To Do column')).not.toContainText('Write Playwright tests');
    });
});

test.describe('HAR Recording lab', () => {
    test('loads products from the API-backed catalog', async ({ page }) => {
        await page.goto('/practice/har-recording');

        await expect(page.getByRole('status')).toContainText('10 products loaded');
        await expect(page.getByTestId('product-1')).toContainText('Mechanical Keyboard');
    });
});

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
});

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
});
