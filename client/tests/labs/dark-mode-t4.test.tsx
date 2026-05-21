import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MultiTab } from '../../src/pages/practice/MultiTab';
import { MultiTabWindow } from '../../src/pages/practice/MultiTabWindow';
import { MultiTabPopup } from '../../src/pages/practice/MultiTabPopup';
import { FakeAuth } from '../../src/pages/practice/FakeAuth';
import { FakeAuthDashboard } from '../../src/pages/practice/FakeAuthDashboard';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function wrap(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(jsonResponse({}, 401))),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('MultiTab tokens', () => {
  test('storage panel uses bg-surface instead of bg-white', () => {
    const { container } = wrap(<MultiTab />);
    const panel = container.querySelector('[data-testid="shared-storage-value"]')?.closest('div');
    expect(panel?.className).toContain('bg-surface');
    expect(panel?.className).not.toContain('bg-white');
  });

  test('section headings use text-content instead of text-zinc-900', () => {
    wrap(<MultiTab />);
    const heading = screen.getByRole('heading', { name: /Challenge 1/ });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });
});

describe('MultiTabWindow tokens', () => {
  test('root wrapper uses bg-canvas instead of bg-white', () => {
    const { container } = render(<MultiTabWindow />);
    const root = container.firstElementChild;
    expect(root?.className).toContain('bg-canvas');
    expect(root?.className).not.toContain('bg-white');
  });

  test('panel uses bg-canvas instead of bg-zinc-50', () => {
    const { container } = render(<MultiTabWindow />);
    const panel = container.querySelector('[data-testid="tab-counter"]')?.closest('div');
    expect(panel?.className).toContain('bg-canvas');
    expect(panel?.className).not.toContain('bg-zinc-50');
  });
});

describe('MultiTabPopup tokens', () => {
  test('root wrapper uses bg-canvas instead of bg-white', () => {
    const { container } = render(<MultiTabPopup />);
    const root = container.firstElementChild;
    expect(root?.className).toContain('bg-canvas');
    expect(root?.className).not.toContain('bg-white');
  });

  test('input uses border-edge instead of border-zinc-300', () => {
    const { container } = render(<MultiTabPopup />);
    const input = container.querySelector('input');
    expect(input?.className).toContain('border-edge');
    expect(input?.className).not.toContain('border-zinc-300');
  });
});

describe('FakeAuth tokens', () => {
  test('credentials panel uses bg-canvas instead of bg-zinc-50', () => {
    wrap(<FakeAuth />);
    // The credentials panel is the element containing "Test credentials" text
    const heading = screen.getByText('Test credentials');
    const panel = heading.closest('div');
    expect(panel?.className).toContain('bg-canvas');
    expect(panel?.className).not.toContain('bg-zinc-50');
  });

  test('form labels use text-muted instead of text-zinc-700', () => {
    wrap(<FakeAuth />);
    const label = screen.getByText('Username');
    expect(label.className).toContain('text-muted');
    expect(label.className).not.toContain('text-zinc-700');
  });
});

describe('FakeAuthDashboard tokens', () => {
  test('dashboard card uses bg-surface instead of bg-white', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(jsonResponse({ id: 1, username: 'alice', displayName: 'Alice' })),
      ),
    );

    const { container } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<FakeAuthDashboard />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByRole('heading', { name: 'Dashboard' }));

    const card = container.querySelector('[class*="rounded-xl border"]');
    expect(card?.className).toContain('bg-surface');
    expect(card?.className).not.toContain('bg-white');
  });
});
