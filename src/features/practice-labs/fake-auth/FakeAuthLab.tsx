'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';
import {
  buildSession,
  clearSession,
  PRACTICE_CREDENTIALS,
  readSession,
  validateCredentials,
  writeSession,
  type FakeSession,
} from './fake-session';

const CHALLENGE_ID = 'fake-auth-session';
const OBJECTIVE =
  'Understand how browser storage state affects navigation and how to test authenticated-like flows while keeping each scenario isolated.';

// ─── Top-level lab component ───────────────────────────────────────────────────

export function FakeAuthLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Fake Auth Session Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <FakeAuthContent key={resetKey} />
    </PracticeLabLayout>
  );
}

// ─── Content — remounted on reset ─────────────────────────────────────────────

type AuthContentState =
  | { view: 'checking' }
  | { view: 'signed-in'; session: FakeSession }
  | { view: 'sign-in-form'; error: string };

function FakeAuthContent() {
  const router = useRouter();
  const [state, setState] = useState<AuthContentState>({ view: 'checking' });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Read existing session on mount
  useEffect(() => {
    const existing = readSession();
    startTransition(() => {
      if (existing) {
        setState({ view: 'signed-in', session: existing });
      } else {
        setState({ view: 'sign-in-form', error: '' });
      }
    });
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validateCredentials(username, password)) {
      const session = buildSession(username.trim());
      writeSession(session);
      router.push('/practice/fake-auth/protected');
    } else {
      setState({ view: 'sign-in-form', error: 'Incorrect credentials. Try again.' });
    }
  }

  function handleSignOut() {
    clearSession();
    setState({ view: 'sign-in-form', error: '' });
    setUsername('');
    setPassword('');
  }

  if (state.view === 'checking') {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Checking session…
      </p>
    );
  }

  if (state.view === 'signed-in') {
    return <SignedInPanel session={state.session} onSignOut={handleSignOut} />;
  }

  return (
    <SignInForm
      username={username}
      password={password}
      error={state.error}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  );
}

// ─── Signed-in panel ──────────────────────────────────────────────────────────

function SignedInPanel({
  session,
  onSignOut,
}: {
  session: FakeSession;
  onSignOut: () => void;
}) {
  return (
    <div className="stage-card p-6 space-y-5">
      <div>
        <p className="stage-badge mb-3">Session active</p>
        <h2 className="text-2xl font-black tracking-tight text-card-foreground">
          Already signed in
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You are currently signed in as{' '}
          <span className="font-bold text-foreground">{session.username}</span>.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/practice/fake-auth/protected"
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Go to protected area →
        </Link>

        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out of fake session"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-card-foreground transition hover:border-ring hover:bg-muted focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Sign-in form ──────────────────────────────────────────────────────────────

interface SignInFormProps {
  username: string;
  password: string;
  error: string;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function SignInForm({
  username,
  password,
  error,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: SignInFormProps) {
  const errorId = 'fake-auth-error';

  return (
    <div className="space-y-6">
      {/* Practice credentials notice */}
      <aside
        aria-label="Practice credentials"
        className="stage-card border-primary/20 bg-primary/5 p-5 space-y-2"
      >
        <p className="text-sm font-black text-card-foreground">Practice credentials</p>
        <p className="text-sm text-muted-foreground">
          This lab uses documented, non-sensitive training values. Use them exactly as shown.
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <dt className="font-bold text-card-foreground">Username</dt>
          <dd>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {PRACTICE_CREDENTIALS.username}
            </code>
          </dd>
          <dt className="font-bold text-card-foreground">Password</dt>
          <dd>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {PRACTICE_CREDENTIALS.password}
            </code>
          </dd>
        </dl>
      </aside>

      {/* Sign-in form */}
      <form
        onSubmit={onSubmit}
        aria-label="Sign in"
        className="stage-card p-6 space-y-5"
        noValidate
      >
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Sign in to the practice portal
        </h2>

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="rounded-2xl border border-danger/30 bg-danger/8 px-4 py-2.5 text-sm font-bold text-danger"
          >
            {error}
          </p>
        )}

        {/* Username */}
        <div className="space-y-1.5">
          <label htmlFor="fake-username" className="block text-sm font-bold text-card-foreground">
            Username
          </label>
          <input
            id="fake-username"
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            autoComplete="username"
            aria-describedby={error ? errorId : undefined}
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="fake-password" className="block text-sm font-bold text-card-foreground">
            Password
          </label>
          <input
            id="fake-password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="current-password"
            aria-describedby={error ? errorId : undefined}
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
