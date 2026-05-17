import { Outlet, Link, useLocation } from 'react-router-dom';

export function Shell() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-zinc-900 hover:text-indigo-600 transition-colors"
          >
            <svg
              className="h-5 w-5 text-indigo-600"
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

          {!isHome && (
            <Link
              to="/"
              className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              ← All labs
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <Outlet />
      </main>
    </div>
  );
}
