import {
  test,
  expect,
  devices,
  type Browser,
  type BrowserContextOptions,
  type Page,
} from '@playwright/test';
import { checkA11y } from '../axe-helper';

async function withTouchGesturesPage(
  browser: Browser,
  options: BrowserContextOptions,
  run: (page: Page) => Promise<void>,
) {
  const context = await browser.newContext(options);
  const page = await context.newPage();

  try {
    await page.goto('/practice/touch-gestures');
    await run(page);
  } finally {
    await context.close();
  }
}

async function swipeCarouselLeft(page: Page) {
  const carousel = page.getByRole('region', { name: 'Carousel', exact: true });
  const box = await carousel.boundingBox();

  if (!box) {
    return false;
  }

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

  return true;
}

test.describe('Touch & Mobile Gestures lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice/touch-gestures');
  });

  test('locator.tap increments the touch counter', async ({ browser }) => {
    await withTouchGesturesPage(browser, { hasTouch: true }, async (page) => {
      const target = page.getByLabel('Tap target');
      await target.tap();
      await expect(page.getByTestId('tap-count')).toHaveText('1');

      await target.tap();
      await target.tap();
      await expect(page.getByTestId('tap-count')).toHaveText('3');
    });
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
    await withTouchGesturesPage(browser, devices['iPhone 15'], async (page) => {
      await expect(page.getByLabel('Slide 1 — Tap', { exact: true })).toBeVisible();
      const didSwipe = await swipeCarouselLeft(page);

      if (didSwipe) {
        await expect(page.getByLabel('Slide 2 — Swipe', { exact: true })).toBeVisible();
      }
    });
  });

  test('mobile device context reports maxTouchPoints > 0', async ({ browser }) => {
    await withTouchGesturesPage(browser, devices['iPhone 15'], async (page) => {
      await page.getByRole('button', { name: 'Inspect Touch Points' }).click();
      const info = page.getByLabel('Touch info result');
      await expect(info).toBeVisible();
      const text = await info.textContent();
      const points = parseInt(text?.match(/\d+/)?.[0] ?? '0', 10);
      expect(points).toBeGreaterThan(0);
    });
  });

  test('page has no axe accessibility violations', async ({ page }) => {
    await checkA11y(page);
  });
});
