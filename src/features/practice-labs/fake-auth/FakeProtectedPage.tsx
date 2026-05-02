'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';

import { clearSession, readSession, type FakeSession } from './fake-session';

// ─── Protected page component ──────────────────────────────────────────────────

type ProtectedState =
  | { view: 'checking' }
  | { view: 'authenticated'; session: FakeSession }
  | { view: 'redirecting' };

export function FakeProtectedPage() {
  const router = useRouter();
  const [state, setState] = useState<ProtectedState>({ view: 'checking' });

  useEffect(() => {
    const session = readSession();
    if (session) {
      startTransition(() => setState({ view: 'authenticated', session }));
    } else {
      startTransition(() => setState({ view: 'redirecting' }));
      router.replace('/practice/fake-auth');
    }
    // router is stable in Next.js App Router — effect runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSignOut() {
    clearSession();
    router.replace('/practice/fake-auth');
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-12 sm:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link
              href="/challenges"
              className="transition hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Challenge catalog
            </Link>
          </li>
          <li aria-hidden="true" className="select-none">/</li>
          <li>
            <Link
              href="/challenges/fake-auth-session"
              className="transition hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Fake Auth Session Lab
            </Link>
          </li>
          <li aria-hidden="true" className="select-none">/</li>
          <li>
            <Link
              href="/practice/fake-auth"
              className="transition hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Sign in
            </Link>
          </li>
          <li aria-hidden="true" className="select-none">/</li>
          <li aria-current="page" className="font-semibold text-foreground">
            Protected area
          </li>
        </ol>
      </nav>

      {/* States */}
      {state.view === 'checking' && (
        <p role="status" aria-label="Checking session…" className="text-sm text-muted-foreground">
          Checking session…
        </p>
      )}

      {state.view === 'redirecting' && (
        <div role="status" aria-label="Redirecting to sign in" className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">
            Sign in required. Redirecting…
          </p>
          <p className="text-sm text-muted-foreground">
            If you are not redirected,{' '}
            <Link href="/practice/fake-auth" className="text-primary underline">
              go to the sign-in page
            </Link>
            .
          </p>
        </div>
      )}

      {state.view === 'authenticated' && (
        <AuthenticatedContent session={state.session} onSignOut={handleSignOut} />
      )}
    </div>
  );
}

// ─── Authenticated content ─────────────────────────────────────────────────────

const PRACTICE_MODULES = [
  { id: 'mod-1', title: 'Locator strategies', status: 'Available' },
  { id: 'mod-2', title: 'Async assertions', status: 'Available' },
  { id: 'mod-3', title: 'Network mocking', status: 'Available' },
  { id: 'mod-4', title: 'Browser contexts', status: 'Available' },
] as const;

function AuthenticatedContent({
  session,
  onSignOut,
}: {
  session: FakeSession;
  onSignOut: () => void;
}) {
  const signedInTime = new Date(session.signedInAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="stage-badge mb-4">Protected area</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Practice Portal
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Welcome back,{' '}
            <span className="font-bold text-foreground">{session.displayName}</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out of fake session"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-ring/60 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Sign out
        </button>
      </header>

      {/* Session info */}
      <section aria-label="Session details" className="stage-card p-6 space-y-4">
        <h2 className="text-lg font-black text-card-foreground">Active session</h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
          <div>
            <dt className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Signed in as
            </dt>
            <dd className="mt-1 font-semibold text-card-foreground">{session.username}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Display name
            </dt>
            <dd className="mt-1 font-semibold text-card-foreground">{session.displayName}</dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Session started
            </dt>
            <dd className="mt-1 font-semibold text-card-foreground">{signedInTime}</dd>
          </div>
        </dl>
      </section>

      {/* Practice content */}
      <section aria-label="Available modules" className="space-y-4">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Your practice modules
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PRACTICE_MODULES.map((mod) => (
            <li
              key={mod.id}
              aria-label={mod.title}
              className="stage-card flex items-center justify-between p-5"
            >
              <span className="font-semibold text-card-foreground">{mod.title}</span>
              <span className="rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                {mod.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
