import { test, expect, devices } from '@playwright/test';

test.describe('Touch & Mobile Gestures lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/touch-gestures');
  });

  test('locator.tap increments the touch counter', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true });
    const page = await context.newPage();
    await page.goto('/practice/touch-gestures');
    const target = page.getByLabel('Tap target');
    await target.tap();
    await expect(page.getByTestId('tap-count')).toHaveText('1');

    await target.tap();
    await target.tap();
    await expect(page.getByTestId('tap-count')).toHaveText('3');
    await context.close();
  });

  test('locator.click does NOT increment the touch-only counter', async ({ page }) => {
    await page.getByLabel('Tap target').click();
    await expect(page.getByTestId('tap-count')).toHaveText('0');
  });

  test('Next/Prev buttons navigate carousel slides', async ({ page }) => {
    await expect(page.getByLabel('Slide 1 — Tap', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Next slide' }).click();
    await expect(page.getByLabel('Slide 2 — Swipe', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Next slide' }).click();
    await expect(page.getByLabel('Slide 3 — Pinch', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Previous slide' }).click();
    await expect(page.getByLabel('Slide 2 — Swipe', { exact: true })).toBeVisible();
  });

  test('dot indicators reflect current slide with aria-current', async ({ page }) => {
    const firstDot = page.getByRole('button', { name: 'Go to Slide 1 — Tap' });
    await expect(firstDot).toHaveAttribute('aria-current', 'true');

    await page.getByRole('button', { name: 'Next slide' }).click();
    await expect(firstDot).not.toHaveAttribute('aria-current', 'true');
    await expect(page.getByRole('button', { name: 'Go to Slide 2 — Swipe' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('Prev button is disabled on first slide, Next on last', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Next slide' })).toBeEnabled();

    // Navigate to last slide
    await page.getByRole('button', { name: 'Next slide' }).click();
    await page.getByRole('button', { name: 'Next slide' }).click();

    await expect(page.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Previous slide' })).toBeEnabled();
  });

  test('swipe gesture via touchscreen advances the carousel', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 15'],
    });
    const page = await context.newPage();
    await page.goto('/practice/touch-gestures');

    await expect(page.getByLabel('Slide 1 — Tap', { exact: true })).toBeVisible();

    // Use page.evaluate to dispatch touch events with the required identifier field
    const carousel = page.getByRole('region', { name: 'Carousel', exact: true });
    const box = await carousel.boundingBox();

    if (box) {
      const startX = box.x + box.width * 0.8;
      const endX = box.x + box.width * 0.2;
      const midY = box.y + box.height / 2;

      await page.evaluate(
        ({ sel, sx, ex, y }) => {
          const el = document.querySelector(sel) as HTMLElement;
          const makeTouch = (x: number, clientY: number) =>
            new Touch({ identifier: 1, target: el, clientX: x, clientY });
          el.dispatchEvent(
            new TouchEvent('touchstart', {
              bubbles: true,
              cancelable: true,
              touches: [makeTouch(sx, y)],
              changedTouches: [makeTouch(sx, y)],
            }),
          );
          el.dispatchEvent(
            new TouchEvent('touchend', {
              bubbles: true,
              cancelable: true,
              touches: [],
              changedTouches: [makeTouch(ex, y)],
            }),
          );
        },
        { sel: '[aria-label="Carousel"]', sx: startX, ex: endX, y: midY },
      );

      await expect(page.getByLabel('Slide 2 — Swipe', { exact: true })).toBeVisible();
    }

    await context.close();
  });

  test('mobile device context reports maxTouchPoints > 0', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 15'],
    });
    const page = await context.newPage();
    await page.goto('/practice/touch-gestures');

    await page.getByRole('button', { name: 'Inspect Touch Points' }).click();
    const info = page.getByLabel('Touch info result');
    await expect(info).toBeVisible();
    const text = await info.textContent();
    const points = parseInt(text?.match(/\d+/)?.[0] ?? '0', 10);
    expect(points).toBeGreaterThan(0);

    await context.close();
  });
});
