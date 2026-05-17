import { expect, test } from '@playwright/test';

test.describe('Tables & Filtering lab', () => {
    test('filters employee rows by search query', async ({ page }) => {
        await page.goto('/practice/tables-filtering');

        await page.getByLabel('Search').fill('Alice');

        await expect(page.getByRole('status')).toContainText('1 employees');
        await expect(page.getByRole('cell', { name: 'Alice Chen', exact: true })).toBeVisible();
    });

    test('removes a row from the action menu and updates the result count', async ({ page }) => {
        await page.goto('/practice/tables-filtering');

        await page.getByRole('button', { name: 'Actions for Alice Chen' }).click();
        await page.getByRole('menuitem', { name: 'Remove' }).click();

        await expect(page.getByRole('alert')).toContainText('Alice Chen removed.');
        await expect(page.getByRole('status')).toContainText('22 employees');
        await expect(page.getByRole('cell', { name: 'Alice Chen', exact: true })).not.toBeVisible();
    });

    test('department filtering resets pagination to the first page', async ({ page }) => {
        await page.goto('/practice/tables-filtering');

        await page.getByRole('button', { name: '2' }).click();
        await expect(page.getByText('Page 2 of 4')).toBeVisible();
        await page.getByLabel('Department', { exact: true }).selectOption('HR');

        await expect(page.getByText('Page 1 of 1')).toBeVisible();
        await expect(page.getByRole('status')).toContainText('3 employees');
        await expect(page.getByRole('cell', { name: 'Iris Johnson', exact: true })).toBeVisible();
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

    test('records a dismissed confirm dialog', async ({ page }) => {
        await page.goto('/practice/browser-events');

        page.once('dialog', async (dialog) => {
            expect(dialog.type()).toBe('confirm');
            await dialog.dismiss();
        });
        await page.getByRole('button', { name: 'Trigger confirm' }).click();

        await expect(page.getByRole('status')).toContainText('Last dialog: confirm');
        await expect(page.getByRole('status')).toContainText('dismissed');
    });

    test('captures the suggested filename for a download', async ({ page }) => {
        await page.goto('/practice/browser-events');

        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('link', { name: 'Download sample.txt' }).click();
        const download = await downloadPromise;

        expect(download.suggestedFilename()).toBe('stagecraft-sample.txt');
    });
});

test.describe('Frames & Contexts lab', () => {
    test('interacts with the counter inside an iframe', async ({ page }) => {
        await page.goto('/practice/frames-contexts');

        const frame = page.frameLocator('iframe[title="Counter frame"]');
        await frame.getByRole('button', { name: 'Increment' }).click();

        await expect(frame.locator('#count')).toHaveText('1');
    });

    test('fills and submits the login form inside the second iframe', async ({ page }) => {
        await page.goto('/practice/frames-contexts');

        await page.getByRole('tab', { name: 'Challenge 2' }).click();
        const frame = page.frameLocator('iframe[title="Login frame"]');
        await frame.getByLabel('Username').fill('alice');
        await frame.getByLabel('Password').fill('password123');
        await frame.getByRole('button', { name: 'Sign in' }).click();

        await expect(frame.getByRole('status')).toHaveText('Signed in as alice');
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

    test('shows hover tooltip and reveals the scroll action after scrolling', async ({ page }) => {
        await page.goto('/practice/emulation-input');

        await page.getByRole('button', { name: 'Hover over me' }).hover();
        await expect(page.getByRole('tooltip')).toContainText('You found the tooltip!');

        const scroller = page.getByTestId('scroll-container');
        await scroller.evaluate((element) => {
            element.scrollTop = 120;
            element.dispatchEvent(new Event('scroll', { bubbles: true }));
        });

        await expect(page.getByRole('button', { name: /Scroll to top/ })).toBeVisible();
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

    test('shows loading and completion states for the slow operation', async ({ page }) => {
        await page.goto('/practice/debugging-reporting');

        await page.getByTestId('slow-button').click();

        await expect(page.getByRole('status', { name: 'Loading' })).toBeVisible();
        await expect(page.getByTestId('slow-result')).toContainText('Operation complete', {
            timeout: 3000,
        });
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

    test('starts with disconnected-only controls disabled', async ({ page }) => {
        await page.goto('/practice/websocket-interception');

        await expect(page.getByTestId('ws-status')).toHaveText('disconnected');
        await expect(page.getByLabel('Message to send')).toBeDisabled();
        await expect(page.getByTestId('ws-send')).toBeDisabled();
        await expect(page.getByTestId('ws-disconnect')).toBeDisabled();
        await expect(page.getByTestId('ws-connect')).toBeEnabled();
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

    test('moves aria-current through the wizard steps', async ({ page }) => {
        await page.goto('/practice/aria-snapshots');

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
});

test.describe('Clock & Timers lab', () => {
    test('renders a fixed current date when browser time is controlled', async ({ page }) => {
        await page.clock.install({ time: new Date('2026-01-15T12:00:00') });
        await page.goto('/practice/clock-timers');

        await expect(page.getByTestId('current-date')).toHaveText('Thursday, January 15, 2026');
    });

    test('fast-forwards a countdown timer to expiration', async ({ page }) => {
        await page.clock.install();
        await page.goto('/practice/clock-timers');

        await page.getByRole('button', { name: 'Start' }).first().click();
        await page.clock.runFor(60_000);

        await expect(page.getByTestId('countdown')).toHaveText('00:00');
        await expect(page.getByRole('alert')).toContainText("Time's up!");
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

    test('shows tasks seeded through the request fixture before page load', async ({ request, page }) => {
        const title = `Seeded task ${Date.now()}`;
        const response = await request.post('/api/tasks', { data: { title } });
        expect(response.status()).toBe(201);

        await page.goto('/practice/api-request-context');

        await expect(page.getByRole('list', { name: 'Task list' })).toContainText(title);
    });

    test('renders and deletes a completed task seeded through the API', async ({ request, page }) => {
        const title = `Mutable task ${Date.now()}`;
        const created = await request.post('/api/tasks', { data: { title } });
        const taskBody = (await created.json()) as { id: number };
        const updated = await request.put(`/api/tasks/${taskBody.id}`, { data: { done: true } });
        expect(updated.status()).toBe(200);

        await page.goto('/practice/api-request-context');
        const task = page.getByRole('listitem').filter({ hasText: title });

        await expect(task.getByRole('checkbox', { name: `Mark "${title}" as incomplete` })).toBeChecked();
        await expect(task.getByText(title)).toHaveClass(/line-through/);
        await task.getByRole('button', { name: `Delete ${title}` }).click();

        await expect(page.getByRole('list', { name: 'Task list' })).not.toContainText(title);
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

    test('shows the unauthenticated state without a saved session', async ({ page }) => {
        await page.goto('/practice/storage-state');

        await expect(page.getByTestId('not-authenticated')).toContainText('Not authenticated');
        await expect(page.getByTestId('admin-panel')).not.toBeVisible();
    });

    test('hides admin-only content for a regular user session', async ({ page }) => {
        await page.goto('/practice/fake-auth');
        await page.getByLabel('Username').fill('bob');
        await page.getByLabel('Password').fill('letmein');
        await page.getByRole('button', { name: 'Sign in' }).click();
        await expect(page).toHaveURL('/practice/fake-auth/dashboard');

        await page.goto('/practice/storage-state');

        await expect(page.getByTestId('display-name')).toHaveText('Robert Smith');
        await expect(page.getByTestId('user-role')).toHaveText('user');
        await expect(page.getByTestId('admin-panel')).not.toBeVisible();
    });
});

test.describe('Visual Regression lab', () => {
    test('renders stable visual test targets', async ({ page }) => {
        await page.goto('/practice/visual-regression');

        await expect(page.getByTestId('button-showcase')).toContainText('Primary');
        await expect(page.getByTestId('color-palette')).toContainText('Indigo 600');
        await expect(page.getByTestId('bar-chart')).toBeVisible();
    });

    test('marks dynamic timestamp regions and disables the disabled button variant', async ({ page }) => {
        await page.goto('/practice/visual-regression');

        await expect(page.getByRole('button', { name: 'Disabled' })).toBeDisabled();
        await expect(page.getByTestId('dynamic-timestamp')).toHaveCount(3);
        await expect(page.getByTestId('metric-cards')).toContainText('Updated:');
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

    test('reorders the sortable list with drag and drop', async ({ page }) => {
        await page.goto('/practice/drag-and-drop');

        await page.getByTestId('sort-item-alpha').dragTo(page.getByTestId('sort-item-gamma'));

        const items = page.getByRole('list', { name: 'Sortable list' }).getByRole('listitem');
        await expect
            .poll(() => items.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label'))))
            .toEqual(['Beta', 'Gamma', 'Alpha', 'Delta', 'Epsilon']);
    });
});

test.describe('HAR Recording lab', () => {
    test('loads products from the API-backed catalog', async ({ page }) => {
        await page.goto('/practice/har-recording');

        await expect(page.getByRole('status')).toContainText('10 products loaded');
        await expect(page.getByTestId('product-1')).toContainText('Mechanical Keyboard');
    });

    test('renders an error alert when the product API fails', async ({ page }) => {
        await page.route('/api/products', (route) =>
            route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Unavailable' }),
            }),
        );

        await page.goto('/practice/har-recording');

        await expect(page.getByRole('alert')).toContainText('HTTP 503');
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
});
