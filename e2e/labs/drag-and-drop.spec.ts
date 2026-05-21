import { expect, test } from '@playwright/test';

test.describe('Drag & Drop lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/drag-and-drop');
    // Ensure the Kanban board is fully in view before any drag operations;
    // the LabHeader guidance pushes the board near the viewport edge.
    await page.getByLabel('Done column').scrollIntoViewIfNeeded();
  });

  test('moves a kanban card between columns', async ({ page }) => {
    const card = page.getByLabel('Write Playwright tests');
    const done = page.getByLabel('Done column');
    await card.dragTo(done);

    await expect(done).toContainText('Write Playwright tests');
    await expect(page.getByLabel('To Do column')).not.toContainText('Write Playwright tests');
  });

  test('reorders the sortable list with drag and drop', async ({ page }) => {
    await page.getByTestId('sort-item-alpha').dragTo(page.getByTestId('sort-item-gamma'));

    const items = page.getByRole('list', { name: 'Sortable list' }).getByRole('listitem');
    await expect
      .poll(() =>
        items.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label'))),
      )
      .toEqual(['Beta', 'Gamma', 'Alpha', 'Delta', 'Epsilon']);
  });

  test('dropping a file onto the drop zone shows the filename', async ({ page }) => {
    const dropZone = page.getByTestId('drop-zone');
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(['hello'], 'dropped.txt', { type: 'text/plain' }));
      return dt;
    });

    await dropZone.dispatchEvent('dragover', { dataTransfer });
    await dropZone.dispatchEvent('drop', { dataTransfer });

    await expect(page.getByTestId('dropped-file')).toContainText('dropped.txt');
  });

  test('column card counts update after a kanban move', async ({ page }) => {
    const todoColumn = page.getByLabel('To Do column');
    const doneColumn = page.getByLabel('Done column');
    await expect(todoColumn).toContainText('3');
    await expect(doneColumn).toContainText('1');

    await page.getByLabel('Write Playwright tests').dragTo(doneColumn);

    await expect(todoColumn).toContainText('2');
    await expect(doneColumn).toContainText('2');
  });

  test('dropping onto the same column is a no-op', async ({ page }) => {
    const todoColumn = page.getByLabel('To Do column');
    await page.getByLabel('Write Playwright tests').dragTo(todoColumn);

    const labels = await todoColumn
      .getByRole('paragraph')
      .or(todoColumn.locator('[data-card-id]'))
      .evaluateAll((nodes) => nodes.map((node) => (node.textContent ?? '').trim()).filter(Boolean));

    expect(labels).toContain('Write Playwright tests');
    await expect(todoColumn).toContainText('3');
  });
});
