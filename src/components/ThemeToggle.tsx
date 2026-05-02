'use client';

import { useEffect, useRef } from 'react';

import {
  applyThemePreference,
  getNextThemePreference,
  getSystemThemePreference,
  isThemePreference,
  readThemePreference,
  type ThemePreference,
  writeThemePreference,
} from '@/features/theme/theme-storage';

function getCurrentThemePreference(): ThemePreference {
  const rootTheme = document.documentElement.dataset.theme ?? null;

  if (isThemePreference(rootTheme)) {
    return rootTheme;
  }

  return 'light';
}

function updateThemeButton(button: HTMLButtonElement, preference: ThemePreference): void {
  const nextPreference = getNextThemePreference(preference);
  const icon = button.querySelector<HTMLElement>('[data-theme-icon]');
  const label = button.querySelector<HTMLElement>('[data-theme-label]');

  button.setAttribute('aria-label', `Switch to ${nextPreference} theme`);
  button.setAttribute('aria-pressed', String(preference === 'dark'));

  if (icon) {
    icon.textContent = preference === 'dark' ? '☾' : '☀';
  }

  if (label) {
    label.textContent = preference === 'dark' ? 'Dark theme' : 'Light theme';
  }
}

export function ThemeToggle() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const storedTheme = readThemePreference(window.localStorage);
    const systemTheme =
      typeof window.matchMedia === 'function'
        ? getSystemThemePreference(window.matchMedia.bind(window))
        : 'light';
    const initialTheme = storedTheme ?? systemTheme;

    applyThemePreference(document.documentElement, initialTheme);

    if (buttonRef.current) {
      updateThemeButton(buttonRef.current, initialTheme);
    }
  }, []);

  function handleToggleTheme() {
    const nextPreference = getNextThemePreference(getCurrentThemePreference());

    applyThemePreference(document.documentElement, nextPreference);
    writeThemePreference(window.localStorage, nextPreference);

    if (buttonRef.current) {
      updateThemeButton(buttonRef.current, nextPreference);
    }
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="Switch to dark theme"
      aria-pressed="false"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-ring focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      onClick={handleToggleTheme}
    >
      <span aria-hidden="true" className="text-base" data-theme-icon>
        ☀
      </span>
      <span data-theme-label>Light theme</span>
    </button>
  );
}
