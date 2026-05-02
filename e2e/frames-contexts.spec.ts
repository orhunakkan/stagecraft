import { expect, test } from '@playwright/test';

test.describe('Frames and Contexts lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/frames-contexts');
  });

  test('page loads with the frame and context sections', async ({ page }) => {
    await expect(page).toHaveTitle(/Frames and Contexts Lab — Stagecraft/);
    await expect(
      page.getByRole('heading', { level: 1, name: /frames and contexts lab/i }),
    ).toBeVisible();
    await expect(page.getByRole('region', { name: /embedded task frame/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /context state sandbox/i })).toBeVisible();
    await expect(page.getByTitle(/task board frame/i)).toBeVisible();
  });

  test('frame content can be operated independently from the host page', async ({ page }) => {
    const taskFrame = page.getByTitle(/task board frame/i).contentFrame();

    await expect(
      taskFrame.getByRole('heading', { level: 1, name: /embedded task board/i }),
    ).toBeVisible();

    await taskFrame.getByRole('button', { name: /approve checkpoint/i }).click();
    await expect(taskFrame.getByText(/checkpoint approved inside the frame/i)).toBeVisible();

    await taskFrame.getByLabel(/reviewer name/i).fill('Mina');
    await taskFrame.getByRole('button', { name: /save reviewer note/i }).click();
    await expect(taskFrame.getByText(/reviewer note saved for mina/i)).toBeVisible();
  });

  test('context label persists in the current browser context and reset clears it', async ({
    page,
  }) => {
    await page.getByRole('textbox', { name: /context label/i }).fill('Primary context');
    await page.getByRole('button', { name: /save context label/i }).click();

    await expect(page.getByRole('status', { name: /context label status/i })).toHaveText(
      /saved label: primary context/i,
    );

    await page.reload();

    await expect(page.getByRole('status', { name: /context label status/i })).toHaveText(
      /saved label: primary context/i,
    );

    await page.getByRole('button', { name: /reset lab/i }).click();

    await expect(page.getByRole('status', { name: /context label status/i })).toHaveText(
      /no label saved/i,
    );
  });

  test('saved labels are isolated between separate browser contexts', async ({ browser, baseURL }) => {
    if (!baseURL) {
      throw new Error('baseURL is required for multi-context verification');
    }

    const labUrl = new URL('/practice/frames-contexts', baseURL).toString();
    const firstContext = await browser.newContext();
    const secondContext = await browser.newContext();

    try {
      const firstPage = await firstContext.newPage();
      await firstPage.goto(labUrl);
      await firstPage.getByRole('textbox', { name: /context label/i }).fill('Isolated admin');
      await firstPage.getByRole('button', { name: /save context label/i }).click();
      await expect(firstPage.getByRole('status', { name: /context label status/i })).toHaveText(
        /saved label: isolated admin/i,
      );

      const secondPage = await secondContext.newPage();
      await secondPage.goto(labUrl);
      await expect(secondPage.getByRole('status', { name: /context label status/i })).toHaveText(
        /no label saved/i,
      );
    } finally {
      await Promise.all([firstContext.close(), secondContext.close()]);
    }
  });

  test('challenge detail page links to this lab', async ({ page }) => {
    await page.goto('/challenges/frames-contexts');
    await page.getByRole('link', { name: /open frames and contexts lab/i }).click();
    await expect(page).toHaveURL('/practice/frames-contexts');
  });
});
