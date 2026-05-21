import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { StorageState } from '../../src/pages/practice/StorageState';
import { ClockTimers } from '../../src/pages/practice/ClockTimers';
import { DebuggingReporting } from '../../src/pages/practice/DebuggingReporting';
import { AriaSnapshots } from '../../src/pages/practice/AriaSnapshots';

function wrap(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// StorageState uses real timers so waitFor works
describe('StorageState tokens', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(jsonResponse(null, 401))),
    );
  });

  test('credentials hint panel uses bg-canvas instead of bg-zinc-50', () => {
    wrap(<StorageState />);
    const heading = screen.getByText('Test credentials');
    const panel = heading.closest('div');
    expect(panel?.className).toContain('bg-canvas');
    expect(panel?.className).not.toContain('bg-zinc-50');
  });

  test('not-authenticated panel uses bg-canvas instead of bg-zinc-50', async () => {
    const { container } = wrap(<StorageState />);
    await waitFor(() =>
      expect(container.querySelector('[data-testid="not-authenticated"]')).toBeTruthy(),
    );
    const panel = container.querySelector('[data-testid="not-authenticated"]');
    expect(panel?.className).toContain('bg-canvas');
    expect(panel?.className).not.toContain('bg-zinc-50');
  });
});

// Timer-dependent tests use fake timers
describe('ClockTimers tokens', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('section headings use text-content instead of text-zinc-900', () => {
    wrap(<ClockTimers />);
    const heading = screen.getByRole('heading', { name: /Countdown timer/i });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('countdown card uses bg-surface instead of bg-white', () => {
    const { container } = wrap(<ClockTimers />);
    const countdown = container.querySelector('[data-testid="countdown"]');
    const card = countdown?.closest('div.rounded-xl');
    expect(card?.className).toContain('bg-surface');
    expect(card?.className).not.toContain('bg-white');
  });
});

describe('DebuggingReporting tokens', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('section headings use text-content instead of text-zinc-900', () => {
    wrap(<DebuggingReporting />);
    const heading = screen.getByRole('heading', { name: /Flaky component/i });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('uptime panel uses bg-surface instead of bg-white', () => {
    const { container } = wrap(<DebuggingReporting />);
    const counter = container.querySelector('[data-testid="live-counter"]');
    const card = counter?.closest('div.inline-flex');
    expect(card?.className).toContain('bg-surface');
    expect(card?.className).not.toContain('bg-white');
  });
});

describe('AriaSnapshots tokens', () => {
  test('section headings use text-content instead of text-zinc-900', () => {
    wrap(<AriaSnapshots />);
    const heading = screen.getByRole('heading', { name: /Accordion/i });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('accordion uses bg-surface instead of bg-white', () => {
    const { container } = wrap(<AriaSnapshots />);
    const accordion = container.querySelector('div.divide-y');
    expect(accordion?.className).toContain('bg-surface');
    expect(accordion?.className).not.toContain('bg-white');
  });
});
