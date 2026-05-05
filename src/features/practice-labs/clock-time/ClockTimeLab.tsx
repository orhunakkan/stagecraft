'use client';

import { useEffect, useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';
import {
  CLOCK_DELAYS,
  formatClockDisplay,
  formatCountdown,
  type AutoRefreshState,
  type CountdownState,
} from './clock-state';

const CHALLENGE_ID = 'clock-time';
const OBJECTIVE =
  "Control time precisely with page.clock so tests never depend on real-world delays.";

// ─── Top-level lab component ───────────────────────────────────────────────────

export function ClockTimeLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Clock and Time Control Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <ClockTimeContent key={resetKey} />
    </PracticeLabLayout>
  );
}

// ─── Content — remounted on reset ─────────────────────────────────────────────

function ClockTimeContent() {
  return (
    <div className="space-y-6">
      <LiveClockScenario />
      <CountdownScenario />
      <AutoRefreshScenario />
    </div>
  );
}

// ─── Scenario 1 — Live Clock Display ──────────────────────────────────────────

function LiveClockScenario() {
  // Initialise with the current time. suppressHydrationWarning on the
  // <time> element below handles the unavoidable SSR/client timestamp drift.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, CLOCK_DELAYS.clockTick);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      aria-labelledby="live-clock-heading"
      className="stage-card p-6 space-y-5"
    >
      <div>
        <h2 id="live-clock-heading" className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 1 — Live Clock Display
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          The clock reads{' '}
          <code className="rounded bg-muted px-1 text-xs font-mono">Date.now()</code> every
          second via <code className="rounded bg-muted px-1 text-xs font-mono">setInterval</code>.
          Use{' '}
          <code className="rounded bg-muted px-1 text-xs font-mono">page.clock.setFixedTime()</code>{' '}
          before navigating to freeze time and assert the exact displayed value.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 px-6 py-6 space-y-2">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          Current time
        </p>
        <time
          aria-label="Current date and time"
          dateTime={now.toISOString()}
          suppressHydrationWarning
          className="block font-mono text-2xl font-bold tracking-tight text-card-foreground"
        >
          <span suppressHydrationWarning>{formatClockDisplay(now)}</span>
        </time>
        <p className="text-xs text-muted-foreground">
          Updates every second · format: YYYY-MM-DD HH:MM:SS
        </p>
      </div>
    </section>
  );
}

// ─── Scenario 2 — Session Countdown ───────────────────────────────────────────

interface CountdownData {
  state: CountdownState;
  remainingMs: number;
}

function CountdownScenario() {
  const [countdown, setCountdown] = useState<CountdownData>({
    state: 'idle',
    remainingMs: CLOCK_DELAYS.countdown,
  });

  // Each tick reads Date.now() to compute remaining time precisely.
  // This means a single tick after page.clock.fastForward('05:00') is
  // enough to transition to 'expired' — no 300-tick accumulation needed.
  useEffect(() => {
    if (countdown.state !== 'running') return;

    const startedAt = Date.now();
    const duration = CLOCK_DELAYS.countdown;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, duration - elapsed);
      setCountdown({ state: remaining === 0 ? 'expired' : 'running', remainingMs: remaining });
    }, CLOCK_DELAYS.clockTick);

    return () => clearInterval(interval);
  }, [countdown.state]);

  function handleStart() {
    setCountdown({ state: 'running', remainingMs: CLOCK_DELAYS.countdown });
  }

  function handleReset() {
    setCountdown({ state: 'idle', remainingMs: CLOCK_DELAYS.countdown });
  }

  return (
    <section
      aria-labelledby="countdown-heading"
      className="stage-card p-6 space-y-5"
    >
      <div>
        <h2 id="countdown-heading" className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 2 — Session Countdown
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          A 5-minute session timer that decrements every second. Use{' '}
          <code className="rounded bg-muted px-1 text-xs font-mono">page.clock.install()</code> then{' '}
          <code className="rounded bg-muted px-1 text-xs font-mono">
            page.clock.fastForward(&apos;05:00&apos;)
          </code>{' '}
          to jump to expiry without waiting.
        </p>
      </div>

      <CountdownDisplay
        state={countdown.state}
        remainingMs={countdown.remainingMs}
        onStart={handleStart}
        onReset={handleReset}
      />
    </section>
  );
}

interface CountdownDisplayProps {
  state: CountdownState;
  remainingMs: number;
  onStart: () => void;
  onReset: () => void;
}

function CountdownDisplay({ state, remainingMs, onStart, onReset }: CountdownDisplayProps) {
  if (state === 'idle') {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center space-y-4">
        <p role="status" aria-label="Session countdown not started" className="text-sm font-semibold text-muted-foreground">
          Session countdown not started
        </p>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Start countdown
        </button>
      </div>
    );
  }

  if (state === 'expired') {
    return (
      <div
        role="alert"
      aria-label="Session expired"
        className="rounded-2xl border border-danger/30 bg-danger/8 px-6 py-8 space-y-4"
      >
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-lg text-danger">⏰</span>
          <p className="text-sm font-bold text-danger">
            Session expired — please sign in again
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          The 5-minute session timer reached zero.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-card-foreground transition hover:border-ring/60 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Reset countdown
        </button>
      </div>
    );
  }

  // running
  return (
    <div
      role="status"
      aria-label={`Session expires in ${formatCountdown(remainingMs)}`}
      className="rounded-2xl border border-warning/30 bg-warning/8 px-6 py-6 space-y-3"
    >
      <p className="text-xs font-black uppercase tracking-widest text-warning-foreground">
        Session expires in
      </p>
      <p
        aria-live="off"
        className="font-mono text-3xl font-black tracking-tight text-warning-foreground"
      >
        {formatCountdown(remainingMs)}
      </p>
      <p className="text-xs text-muted-foreground">Counting down from 5:00</p>
    </div>
  );
}

// ─── Scenario 3 — Scheduled Auto-refresh ──────────────────────────────────────

function AutoRefreshScenario() {
  const [refreshState, setRefreshState] = useState<AutoRefreshState>('idle');
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  useEffect(() => {
    if (refreshState !== 'running') return;

    const interval = setInterval(() => {
      setRefreshCount((prev) => prev + 1);
      setLastRefreshed(new Date().toISOString());
    }, CLOCK_DELAYS.autoRefresh);

    return () => clearInterval(interval);
  }, [refreshState]);

  function handleStart() {
    setRefreshCount(0);
    setLastRefreshed(null);
    setRefreshState('running');
  }

  return (
    <section
      aria-labelledby="auto-refresh-heading"
      className="stage-card p-6 space-y-5"
    >
      <div>
        <h2 id="auto-refresh-heading" className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 3 — Scheduled Auto-refresh
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          A panel that refreshes automatically every 30 seconds. Use{' '}
          <code className="rounded bg-muted px-1 text-xs font-mono">page.clock.install()</code>{' '}
          then two rounds of{' '}
          <code className="rounded bg-muted px-1 text-xs font-mono">
            page.clock.fastForward(&apos;00:30&apos;)
          </code>{' '}
          and assert the counter reaches 2.
        </p>
      </div>

      {refreshState === 'idle' ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center space-y-4">
          <p role="status" aria-label="Auto-refresh not started" className="text-sm font-semibold text-muted-foreground">
            Auto-refresh not started
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-5 py-2.5 text-sm font-bold text-secondary transition hover:bg-secondary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Start auto-refresh
          </button>
        </div>
      ) : (
        <div
          role="status"
          aria-label={`Refreshed ${String(refreshCount)} ${refreshCount === 1 ? 'time' : 'times'}`}
          className="rounded-2xl border border-success/30 bg-success/8 px-6 py-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-block size-2 rounded-full bg-success animate-pulse"
            />
            <p className="text-sm font-bold text-success">Auto-refresh active</p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/55 px-4 py-3">
              <dt className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Refresh count
              </dt>
              <dd
                aria-label={`Refresh count: ${String(refreshCount)}`}
                className="mt-1 font-mono text-2xl font-black text-card-foreground"
              >
                {refreshCount}
              </dd>
            </div>

            <div className="rounded-xl border border-border bg-background/55 px-4 py-3">
              <dt className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Last refreshed
              </dt>
              <dd className="mt-1 text-sm font-mono text-card-foreground break-all">
                {lastRefreshed ? (
                  <time dateTime={lastRefreshed}>{lastRefreshed}</time>
                ) : (
                  <span className="text-muted-foreground">Waiting for first refresh…</span>
                )}
              </dd>
            </div>
          </dl>

          <p className="text-xs text-muted-foreground">
            Refreshes every 30 seconds · next refresh in ≤30 s
          </p>
        </div>
      )}
    </section>
  );
}
