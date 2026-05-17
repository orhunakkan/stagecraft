import { useState, useEffect, useRef } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'clock-timers')!;

// ── Countdown timer ──────────────────────────────────────────────────────────
function CountdownTimer() {
  const INITIAL = 60;
  const [remaining, setRemaining] = useState(INITIAL);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((n) => n - 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining]);

  const reset = () => {
    setRunning(false);
    setRemaining(INITIAL);
  };

  const expired = remaining === 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p
        className="text-4xl font-bold tabular-nums text-zinc-900"
        aria-label={`${remaining} seconds remaining`}
        data-testid="countdown"
      >
        {String(Math.floor(remaining / 60)).padStart(2, '0')}:
        {String(remaining % 60).padStart(2, '0')}
      </p>
      {expired && (
        <p role="alert" className="mt-1 text-sm font-medium text-red-600">
          Time&apos;s up!
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          disabled={expired}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ── Session expiry toast ─────────────────────────────────────────────────────
function SessionToast() {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    setDismissed(false);
    // Toast appears after 5s, expires at 10s (scaled for lab purposes)
    const showTimer = setTimeout(() => setSecondsLeft(5), 5000);
    const countdownId = setInterval(() => {
      setSecondsLeft((n) => {
        if (n === null) return null;
        if (n <= 1) {
          setActive(false);
          return null;
        }
        return n - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(countdownId);
    };
  }, [active]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setActive(true)}
        disabled={active}
        data-testid="start-session"
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
      >
        Start session
      </button>
      {active && secondsLeft === null && (
        <p className="mt-2 text-xs text-zinc-400">Session active — toast appears in ~5 s</p>
      )}
      {secondsLeft !== null && !dismissed && (
        <div
          role="alert"
          data-testid="expiry-toast"
          className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5"
        >
          <p className="text-sm text-amber-800">
            Session expires in{' '}
            <strong data-testid="expiry-countdown">{secondsLeft}s</strong>
          </p>
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              setActive(false);
            }}
            aria-label="Dismiss session warning"
            className="shrink-0 text-amber-600 hover:text-amber-800"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

// ── Auto-refresh polling ─────────────────────────────────────────────────────
function PollingComponent() {
  const [count, setCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    // Refresh every 30s
    const refreshId = setInterval(() => {
      setCount((n) => n + 1);
      setLastRefresh(Date.now());
    }, 30_000);
    return () => clearInterval(refreshId);
  }, []);

  useEffect(() => {
    const tickId = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastRefresh) / 1000));
    }, 1000);
    return () => clearInterval(tickId);
  }, [lastRefresh]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-400">Data Feed</p>
      <p className="mt-1 text-lg font-semibold text-zinc-900" data-testid="refresh-count">
        Refresh #{count}
      </p>
      <p className="mt-0.5 text-xs text-zinc-400">
        Last updated:{' '}
        <span data-testid="last-refresh-ago">{secondsAgo}s ago</span>
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        Use <code className="rounded bg-zinc-100 px-1">clock.tick(30_000)</code> to skip ahead
        30 s without waiting.
      </p>
    </div>
  );
}

// ── Date display ─────────────────────────────────────────────────────────────
function DateDisplay() {
  const now = new Date();
  const formatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wider text-zinc-400">Today</p>
      <p
        className="mt-1 text-lg font-semibold text-zinc-900"
        data-testid="current-date"
        aria-label={`Today is ${formatted}`}
      >
        {formatted}
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        Use <code className="rounded bg-zinc-100 px-1">clock.setFixedTime(date)</code> to
        control what &quot;today&quot; means in tests.
      </p>
    </div>
  );
}

export function ClockTimers() {
  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-8 text-sm text-zinc-500">
        <code className="rounded bg-zinc-100 px-1 text-xs">page.clock</code> takes full control
        of the browser&apos;s notion of time, enabling you to drive time-dependent UIs instantly
        without real delays.
      </p>

      <div className="space-y-10">
        <section aria-labelledby="countdown-heading">
          <h2 id="countdown-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Challenge 1 — Countdown timer
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Start the timer, then use{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">clock.tick()</code> to fast-forward
            to the end without waiting 60 real seconds. Assert the &quot;Time&apos;s up!&quot;
            message.
          </p>
          <CountdownTimer />
        </section>

        <section aria-labelledby="toast-heading">
          <h2 id="toast-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Challenge 2 — Session expiry toast
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Start the session, then use{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">clock.tick(5000)</code> to jump
            past the 5 s threshold and assert the toast appears with the correct countdown.
          </p>
          <SessionToast />
        </section>

        <section aria-labelledby="polling-heading">
          <h2 id="polling-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Challenge 3 — Auto-refresh polling
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            The component refreshes every 30 seconds. Use{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">clock.fastForward(30_000)</code>{' '}
            to trigger one cycle and assert the refresh count increments.
          </p>
          <PollingComponent />
        </section>

        <section aria-labelledby="date-heading">
          <h2 id="date-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Challenge 4 — Date display
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            This component renders today&apos;s date on mount. Use{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">clock.install()</code> with a
            fixed time before navigating to assert a specific date.
          </p>
          <DateDisplay />
        </section>
      </div>
    </div>
  );
}
