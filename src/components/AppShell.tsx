import Link from 'next/link';

import { ThemeToggle } from './ThemeToggle';

interface AppShellProps {
  children: React.ReactNode;
}

const navigationLinks = [
  { href: '/challenges', label: 'Challenges' },
  { href: '/#practice-areas', label: 'Practice areas' },
] as const;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/82 backdrop-blur-xl">
        <nav
          aria-label="Primary"
          className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <Link
            href="/"
            aria-label="Stagecraft home"
            className="group inline-flex items-center gap-3 text-left"
          >
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-foreground shadow-stage-glow transition group-hover:scale-105"
            >
              S
            </span>
            <span>
              <span className="block text-base font-black tracking-tight">Stagecraft</span>
              <span className="block text-xs font-medium text-muted-foreground">
                Automation practice
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
