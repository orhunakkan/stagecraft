import { expect, test } from '@playwright/test';
import { checkA11y } from '../axe-helper';

test.describe('API Request Context lab', () => {
  test('adds a task through the API-backed UI', async ({ page }) => {
    await page.goto('/practice/api-request-context');

    const title = `E2E task ${Date.now()}`;
    await page.getByLabel('New task title').fill(title);
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.getByRole('list', { name: 'Task list' })).toContainText(title);
  });

  test('shows tasks seeded through the request fixture before page load', async ({
    request,
    page,
  }) => {
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

    await expect(
      task.getByRole('checkbox', { name: `Mark "${title}" as incomplete` }),
    ).toBeChecked();
    await expect(task.getByText(title)).toHaveClass(/line-through/);
    await task.getByRole('button', { name: `Delete ${title}` }).click();

    await expect(page.getByRole('list', { name: 'Task list' })).not.toContainText(title);
  });

  test('Add button is disabled until the title input has non-whitespace text', async ({ page }) => {
    await page.goto('/practice/api-request-context');

    const addButton = page.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeDisabled();

    await page.getByLabel('New task title').fill('   ');
    await expect(addButton).toBeDisabled();

    await page.getByLabel('New task title').fill('Real title');
    await expect(addButton).toBeEnabled();
  });

  test('toggling a task checkbox in the UI persists through reload via the API', async ({
    page,
    request,
  }) => {
    const title = `Toggle persist ${Date.now()}`;
    const created = await request.post('/api/tasks', { data: { title } });
    const { id } = (await created.json()) as { id: number };

    await page.goto('/practice/api-request-context');
    const task = page.getByRole('listitem').filter({ hasText: title });
    await task.getByRole('checkbox').click();
    await expect(task.getByRole('checkbox')).toBeChecked();

    await page.reload();
    const reloaded = page.getByRole('listitem').filter({ hasText: title });
    await expect(reloaded.getByRole('checkbox')).toBeChecked();

    await request.delete(`/api/tasks/${id}`);
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await page.goto('/practice/api-request-context');
    await checkA11y(page);
  });
});
