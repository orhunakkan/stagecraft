import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useSearchParams } from 'react-router-dom';

function resolveInitialTheme(searchParams: URLSearchParams): boolean {
  const param = searchParams.get('theme');
  if (param === 'dark') return true;
  if (param === 'light') return false;

  const stored = localStorage.getItem('stagecraft:theme');
  if (stored === 'dark') return true;
  if (stored === 'light') return false;

  return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
      <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Shell() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const isHome = pathname === '/';

  const [isDark, setIsDark] = useState(() => resolveInitialTheme(searchParams));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('stagecraft:theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <div className="min-h-screen bg-canvas text-content">
      <header className="sticky top-0 z-10 border-b border-edge bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-content hover:text-accent transition-colors"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
              <line x1="12" y1="22" x2="12" y2="15.5" />
              <polyline points="22 8.5 12 15.5 2 8.5" />
            </svg>
            Stagecraft
          </Link>

          <div className="flex items-center gap-2">
            {!isHome && (
              <Link to="/" className="text-sm text-muted hover:text-content transition-colors">
                ← All labs
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              aria-label="Toggle dark mode"
              className="rounded-lg p-1.5 text-muted hover:text-content transition-colors"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <Outlet />
      </main>
    </div>
  );
}
