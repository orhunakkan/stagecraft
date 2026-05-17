import { expect, test } from '@playwright/test';

test.describe('WebSocket Interception lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/websocket-interception');
  });

  test('starts with disconnected-only controls disabled', async ({ page }) => {
    await expect(page.getByTestId('ws-status')).toHaveText('disconnected');
    await expect(page.getByLabel('Message to send')).toBeDisabled();
    await expect(page.getByTestId('ws-send')).toBeDisabled();
    await expect(page.getByTestId('ws-disconnect')).toBeDisabled();
    await expect(page.getByTestId('ws-connect')).toBeEnabled();
  });

  test('connects to the WebSocket server and echoes a sent message', async ({ page }) => {
    await page.getByTestId('ws-connect').click();
    await expect(page.getByTestId('ws-status')).toHaveText('connected');
    await expect(page.getByLabel('WebSocket message log')).toContainText('Welcome');

    await page.getByLabel('Message to send').fill('hello socket');
    await page.getByTestId('ws-send').click();

    await expect(page.getByLabel('WebSocket message log')).toContainText('echo: hello socket');
  });

  test('disconnecting returns the UI to the disconnected state', async ({ page }) => {
    await page.getByTestId('ws-connect').click();
    await expect(page.getByTestId('ws-status')).toHaveText('connected');

    await page.getByTestId('ws-disconnect').click();

    await expect(page.getByTestId('ws-status')).toHaveText('disconnected');
    await expect(page.getByTestId('ws-disconnect')).toBeDisabled();
    await expect(page.getByTestId('ws-connect')).toBeEnabled();
  });

  test('fully mocks the WebSocket and shows mock messages without contacting the server', async ({
    page,
  }) => {
    await page.routeWebSocket(/\/ws$/, (ws) => {
      ws.send('Welcome from the mock');
      ws.onMessage((msg) => ws.send(`mock-echo: ${msg.toString()}`));
    });
    await page.reload();

    await page.getByTestId('ws-connect').click();
    await expect(page.getByLabel('WebSocket message log')).toContainText('Welcome from the mock');

    await page.getByLabel('Message to send').fill('ping');
    await page.getByTestId('ws-send').click();

    await expect(page.getByLabel('WebSocket message log')).toContainText('mock-echo: ping');
  });
});
