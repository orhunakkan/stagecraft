import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BrowserEvents } from '../../src/pages/practice/BrowserEvents';
import { ApiRequestContext } from '../../src/pages/practice/ApiRequestContext';
import { WebSocketInterception } from '../../src/pages/practice/WebSocketInterception';
import { ServiceWorkers } from '../../src/pages/practice/ServiceWorkers';

function wrap(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(jsonResponse([], 200))),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('BrowserEvents tokens', () => {
  test('section headings use text-content instead of text-zinc-900', () => {
    wrap(<BrowserEvents />);
    const heading = screen.getByRole('heading', { name: /Native dialogs/i });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('file upload label uses bg-surface instead of bg-white', () => {
    const { container } = wrap(<BrowserEvents />);
    const label = container.querySelector('label[for="file-upload"]');
    expect(label?.className).toContain('bg-surface');
    expect(label?.className).not.toContain('bg-white');
  });
});

describe('ApiRequestContext tokens', () => {
  test('task input uses border-edge instead of border-zinc-300', () => {
    const { container } = wrap(<ApiRequestContext />);
    const input = container.querySelector('input[aria-label="New task title"]');
    expect(input?.className).toContain('border-edge');
    expect(input?.className).not.toContain('border-zinc-300');
  });
});

describe('WebSocketInterception tokens', () => {
  test('section headings use text-content instead of text-zinc-900', () => {
    wrap(<WebSocketInterception />);
    const heading = screen.getByRole('heading', { name: /WebSocket connection/i });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('challenge cards use bg-surface instead of bg-white', () => {
    const { container } = wrap(<WebSocketInterception />);
    const challengeCards = container.querySelectorAll('div.rounded-xl.border');
    const card = Array.from(challengeCards).find((el) => el.textContent?.includes('Challenge 1'));
    expect(card?.className).toContain('bg-surface');
    expect(card?.className).not.toContain('bg-white');
  });

  test('message log uses bg-canvas instead of bg-zinc-50', () => {
    const { container } = wrap(<WebSocketInterception />);
    const msgLog = container.querySelector('[aria-label="WebSocket message log"]');
    expect(msgLog?.className).toContain('bg-canvas');
    expect(msgLog?.className).not.toContain('bg-zinc-50');
  });
});

describe('ServiceWorkers tokens', () => {
  test('section headings use text-content instead of text-zinc-900', () => {
    wrap(<ServiceWorkers />);
    const heading = screen.getByRole('heading', { name: /Step 1/i });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });
});
