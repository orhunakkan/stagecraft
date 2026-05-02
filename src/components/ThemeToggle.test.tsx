import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { themeStorageKey } from '@/features/theme/theme-storage';

import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('light', 'dark');
  });

  it('loads the stored dark preference and exposes an accessible toggle', async () => {
    localStorage.setItem(themeStorageKey, 'dark');

    render(<ThemeToggle />);

    const toggle = await screen.findByRole('button', { name: /switch to light theme/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('persists the next theme when activated', async () => {
    const user = userEvent.setup();
    localStorage.setItem(themeStorageKey, 'light');

    render(<ThemeToggle />);

    const toggle = await screen.findByRole('button', { name: /switch to dark theme/i });
    await user.click(toggle);

    await waitFor(() => {
      expect(localStorage.getItem(themeStorageKey)).toBe('dark');
    });
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeVisible();
  });
});
