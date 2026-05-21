import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Shell } from '../../src/layouts/Shell';

function renderShell(initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<p>content</p>} />
          <Route path="/practice/anything" element={<p>lab content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function mockMatchMedia(prefersDark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: prefersDark && query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe('Shell theme toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    mockMatchMedia(false);
  });

  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove('dark');
    vi.unstubAllGlobals();
  });

  test('renders toggle button with aria-label "Toggle dark mode"', () => {
    renderShell();
    expect(screen.getByRole('button', { name: 'Toggle dark mode' })).toBeVisible();
  });

  test('defaults to light mode when OS prefers light and no stored preference', () => {
    mockMatchMedia(false);
    renderShell();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('applies dark mode on mount when OS prefers dark and no stored preference', () => {
    mockMatchMedia(true);
    renderShell();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('?theme=dark URL param activates dark mode regardless of OS preference', () => {
    mockMatchMedia(false);
    renderShell(['/?theme=dark']);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('?theme=light URL param keeps light mode regardless of OS preference', () => {
    mockMatchMedia(true);
    renderShell(['/?theme=light']);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('localStorage "dark" overrides OS light preference', () => {
    localStorage.setItem('stagecraft:theme', 'dark');
    mockMatchMedia(false);
    renderShell();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('localStorage "light" overrides OS dark preference', () => {
    localStorage.setItem('stagecraft:theme', 'light');
    mockMatchMedia(true);
    renderShell();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('?theme URL param takes priority over localStorage', () => {
    localStorage.setItem('stagecraft:theme', 'light');
    renderShell(['/?theme=dark']);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('clicking toggle adds dark class and saves "dark" to localStorage', () => {
    renderShell();
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle dark mode' }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('stagecraft:theme')).toBe('dark');
  });

  test('clicking toggle twice returns to light mode and saves "light" to localStorage', () => {
    renderShell();
    const btn = screen.getByRole('button', { name: 'Toggle dark mode' });

    fireEvent.click(btn);
    fireEvent.click(btn);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('stagecraft:theme')).toBe('light');
  });
});
