import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { FormsValidation } from '../../src/pages/practice/FormsValidation';
import { TablesFiltering } from '../../src/pages/practice/TablesFiltering';
import { AsyncUi } from '../../src/pages/practice/AsyncUi';

function wrap(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('FormsValidation tokens', () => {
  test('inputs use border-edge instead of border-zinc-300', () => {
    const { container } = wrap(<FormsValidation />);
    const input = container.querySelector('input#full-name');
    expect(input?.className).toContain('border-edge');
    expect(input?.className).not.toContain('border-zinc-300');
  });

  test('labels use text-muted instead of text-zinc-700', () => {
    const { container } = wrap(<FormsValidation />);
    const label = container.querySelector('label[for="full-name"]');
    expect(label?.className).toContain('text-muted');
    expect(label?.className).not.toContain('text-zinc-700');
  });
});

describe('TablesFiltering tokens', () => {
  test('table wrapper uses border-edge instead of border-zinc-200', () => {
    const { container } = wrap(<TablesFiltering />);
    const wrapper = container.querySelector('div.overflow-x-auto');
    expect(wrapper?.className).toContain('border-edge');
    expect(wrapper?.className).not.toContain('border-zinc-200');
  });

  test('table header uses bg-canvas instead of bg-zinc-50', () => {
    const { container } = wrap(<TablesFiltering />);
    const thead = container.querySelector('thead');
    expect(thead?.className).toContain('bg-canvas');
    expect(thead?.className).not.toContain('bg-zinc-50');
  });

  test('table body uses bg-surface instead of bg-white', () => {
    const { container } = wrap(<TablesFiltering />);
    const tbody = container.querySelector('tbody');
    expect(tbody?.className).toContain('bg-surface');
    expect(tbody?.className).not.toContain('bg-white');
  });

  test('sortable header button uses text-muted instead of text-zinc-700', () => {
    const { container } = wrap(<TablesFiltering />);
    const sortBtn = container.querySelector('th button');
    expect(sortBtn?.className).toContain('text-muted');
    expect(sortBtn?.className).not.toContain('text-zinc-700');
  });
});

describe('AsyncUi tokens', () => {
  test('section headings use text-content instead of text-zinc-900', () => {
    wrap(<AsyncUi />);
    const heading = screen.getByRole('heading', { name: /Delayed content/i });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('ticker panel uses bg-surface instead of bg-white', () => {
    const { container } = wrap(<AsyncUi />);
    const tickerPanel = container.querySelector('div.inline-block');
    expect(tickerPanel?.className).toContain('bg-surface');
    expect(tickerPanel?.className).not.toContain('bg-white');
  });
});
