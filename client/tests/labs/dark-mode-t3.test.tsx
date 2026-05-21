/**
 * Token-class verification for T3 lab pages (structural group).
 * Each test picks one or two representative elements and checks that
 * the semantic token class is present and the raw Tailwind color is absent.
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AccessibleLocators } from '../../src/pages/practice/AccessibleLocators';
import { ComingSoon } from '../../src/pages/practice/ComingSoon';
import { FramesContexts } from '../../src/pages/practice/FramesContexts';
import { HarRecording } from '../../src/pages/practice/HarRecording';
import { NetworkApi } from '../../src/pages/practice/NetworkApi';
import type { Lab } from '../../src/labs';

const stubLab: Lab = {
  slug: 'stub',
  title: 'Stub Lab',
  topic: 'Stub topic',
  apis: ['page.goto'],
  status: 'ready',
  requiresBackend: false,
};

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('AccessibleLocators tokens', () => {
  test('book article uses bg-surface instead of bg-white', () => {
    const { container } = render(
      <MemoryRouter>
        <AccessibleLocators />
      </MemoryRouter>,
    );
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0]?.className).toContain('bg-surface');
    expect(articles[0]?.className).not.toContain('bg-white');
  });

  test('form labels use text-muted instead of text-zinc-700', () => {
    const { container } = render(
      <MemoryRouter>
        <AccessibleLocators />
      </MemoryRouter>,
    );
    const label = container.querySelector('label');
    expect(label?.className).toContain('text-muted');
    expect(label?.className).not.toContain('text-zinc-700');
  });
});

describe('ComingSoon tokens', () => {
  test('"Coming Soon" badge uses bg-surface-raised instead of bg-zinc-100', () => {
    const { container } = render(<ComingSoon lab={stubLab} />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-surface-raised');
    expect(badge?.className).not.toContain('bg-zinc-100');
  });

  test('title uses text-content instead of text-zinc-900', () => {
    render(<ComingSoon lab={stubLab} />);
    const heading = screen.getByRole('heading', { name: 'Stub Lab' });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });
});

describe('FramesContexts tokens', () => {
  test('inactive tab button uses border-edge instead of border-zinc-200', () => {
    render(
      <MemoryRouter>
        <FramesContexts />
      </MemoryRouter>,
    );
    // Challenge 1 is active by default; Challenge 2 is the inactive tab
    const tabs = screen.getAllByRole('tab');
    const inactiveTab = tabs[1]!;
    expect(inactiveTab.className).toContain('border-edge');
    expect(inactiveTab.className).not.toContain('border-zinc-200');
  });

  test('challenge panel uses bg-canvas instead of bg-zinc-50', () => {
    const { container } = render(
      <MemoryRouter>
        <FramesContexts />
      </MemoryRouter>,
    );
    const panel = container.querySelector('[role="tabpanel"] > div > div');
    expect(panel?.className).toContain('bg-canvas');
    expect(panel?.className).not.toContain('bg-zinc-50');
  });
});

describe('HarRecording tokens', () => {
  test('workflow step list item uses bg-surface instead of bg-white', () => {
    const { container } = render(
      <MemoryRouter>
        <HarRecording />
      </MemoryRouter>,
    );
    const stepItem = container.querySelector('li');
    expect(stepItem?.className).toContain('bg-surface');
    expect(stepItem?.className).not.toContain('bg-white');
  });

  test('section heading uses text-content instead of text-zinc-900', () => {
    render(
      <MemoryRouter>
        <HarRecording />
      </MemoryRouter>,
    );
    const heading = screen.getByRole('heading', { name: 'HAR recording workflow' });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });
});

describe('NetworkApi tokens', () => {
  test('description uses text-muted instead of text-zinc-500', () => {
    const { container } = render(
      <MemoryRouter>
        <NetworkApi />
      </MemoryRouter>,
    );
    const desc = container.querySelector('p');
    expect(desc?.className).toContain('text-muted');
    expect(desc?.className).not.toContain('text-zinc-500');
  });
});
