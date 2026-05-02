import { describe, expect, it } from 'vitest';

import {
  applyThemePreference,
  getNextThemePreference,
  readThemePreference,
  themeStorageKey,
  writeThemePreference,
} from './theme-storage';

describe('theme-storage', () => {
  it('returns null when storage does not contain a valid theme preference', () => {
    localStorage.removeItem(themeStorageKey);
    expect(readThemePreference(localStorage)).toBeNull();

    localStorage.setItem(themeStorageKey, 'sepia');
    expect(readThemePreference(localStorage)).toBeNull();
  });

  it('writes validated light and dark theme preferences', () => {
    writeThemePreference(localStorage, 'dark');
    expect(readThemePreference(localStorage)).toBe('dark');

    writeThemePreference(localStorage, 'light');
    expect(readThemePreference(localStorage)).toBe('light');
  });

  it('toggles between light and dark preferences', () => {
    expect(getNextThemePreference('light')).toBe('dark');
    expect(getNextThemePreference('dark')).toBe('light');
  });

  it('applies theme preference to the document root', () => {
    const root = document.createElement('html');

    applyThemePreference(root, 'dark');
    expect(root.dataset.theme).toBe('dark');
    expect(root.classList.contains('dark')).toBe(true);
    expect(root.classList.contains('light')).toBe(false);

    applyThemePreference(root, 'light');
    expect(root.dataset.theme).toBe('light');
    expect(root.classList.contains('light')).toBe(true);
    expect(root.classList.contains('dark')).toBe(false);
  });
});
