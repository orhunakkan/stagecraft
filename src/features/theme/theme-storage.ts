export type ThemePreference = 'light' | 'dark';

export const themeStorageKey = 'stagecraft.theme-preference';

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark';
}

export function readThemePreference(storage: Pick<Storage, 'getItem'>): ThemePreference | null {
  try {
    const storedPreference = storage.getItem(themeStorageKey);
    return isThemePreference(storedPreference) ? storedPreference : null;
  } catch {
    return null;
  }
}

export function writeThemePreference(
  storage: Pick<Storage, 'setItem'>,
  preference: ThemePreference,
): void {
  try {
    storage.setItem(themeStorageKey, preference);
  } catch {
    // Theme persistence is progressive enhancement; applying the theme still works without storage.
  }
}

export function getNextThemePreference(preference: ThemePreference): ThemePreference {
  return preference === 'dark' ? 'light' : 'dark';
}

export function getSystemThemePreference(matchMedia: Window['matchMedia']): ThemePreference {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyThemePreference(root: HTMLElement, preference: ThemePreference): void {
  root.dataset.theme = preference;
  root.classList.toggle('dark', preference === 'dark');
  root.classList.toggle('light', preference === 'light');
}
