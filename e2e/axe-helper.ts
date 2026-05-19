import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Run axe accessibility checks on the current page and assert no violations.
 * Pass `disableRules` to opt-out of rules that are intentionally violated in
 * a given lab (e.g. keyboard navigation labs).
 */
export async function checkA11y(page: Page, disableRules: string[] = []): Promise<void> {
  const builder = new AxeBuilder({ page });
  if (disableRules.length > 0) {
    builder.disableRules(disableRules);
  }
  const results = await builder.analyze();
  expect(results.violations).toEqual([]);
}
