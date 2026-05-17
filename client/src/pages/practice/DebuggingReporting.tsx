import { useState, useEffect } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'debugging-reporting')!;

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function DebuggingReporting() {
  const [flakyCount, setFlakyCount] = useState(0);
  const [flakyState, setFlakyState] = useState<'idle' | 'error' | 'success'>('idle');
  const [slowState, setSlowState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [ticker, setTicker] = useState(0);
  const [screenshotHint, setScreenshotHint] = useState(false);

  // Auto-tick every second for the "non-deterministic" section
  useEffect(() => {
    const id = setInterval(() => setTicker((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const handleFlaky = async () => {
    setFlakyState('idle');
    setFlakyCount((n) => n + 1);
    await delay(300);
    // Fails on every 3rd click — deliberately unpredictable
    if ((flakyCount + 1) % 3 === 0) {
      setFlakyState('error');
    } else {
      setFlakyState('success');
    }
  };

  const handleSlow = async () => {
    setSlowState('loading');
    await delay(2000);
    setSlowState('done');
  };

  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-8 text-sm text-zinc-500">
        Playwright&apos;s trace API, screenshots, and retry options are most useful when tests fail
        unexpectedly. This lab exposes deliberately unreliable components so you can practice
        diagnosing failures.
      </p>

      <div className="space-y-10">
        {/* ── Flaky button ───────────────────────────────────────────────── */}
        <section aria-labelledby="flaky-heading">
          <h2 id="flaky-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Flaky component
          </h2>
          <p className="mb-1 text-sm text-zinc-500">
            This button fails every third click. Configure{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">
              test.describe.configure(&#123; retries: 2 &#125;)
            </code>{' '}
            and observe how Playwright retries. Use{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">context.tracing.start()</code> on
            retry to capture a trace.
          </p>
          <p className="mb-4 text-xs text-zinc-400">
            Click count: {flakyCount} — fails on clicks 3, 6, 9…
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleFlaky()}
              data-testid="flaky-button"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Click me (flaky)
            </button>
            {flakyState === 'success' && (
              <span
                role="status"
                aria-live="polite"
                data-testid="flaky-success"
                className="text-sm font-medium text-emerald-600"
              >
                ✓ Success
              </span>
            )}
            {flakyState === 'error' && (
              <span
                role="alert"
                data-testid="flaky-error"
                className="text-sm font-medium text-red-600"
              >
                ✗ Error — this was the flaky click
              </span>
            )}
          </div>
        </section>

        {/* ── Slow component ─────────────────────────────────────────────── */}
        <section aria-labelledby="slow-heading">
          <h2 id="slow-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Slow component
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Takes 2 seconds to complete. Practice attaching a screenshot at a key point with{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">testInfo.attach()</code> and
            configuring a step-level timeout.
          </p>
          <button
            type="button"
            onClick={() => void handleSlow()}
            disabled={slowState === 'loading'}
            data-testid="slow-button"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trigger slow operation
          </button>
          {slowState === 'loading' && (
            <div
              role="status"
              aria-label="Loading"
              className="mt-3 flex items-center gap-2 text-sm text-zinc-500"
            >
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
              Processing…
            </div>
          )}
          {slowState === 'done' && (
            <p
              role="status"
              aria-live="polite"
              data-testid="slow-result"
              className="mt-3 text-sm text-emerald-600"
            >
              ✓ Operation complete
            </p>
          )}
        </section>

        {/* ── Non-deterministic content ──────────────────────────────────── */}
        <section aria-labelledby="nondeterministic-heading">
          <h2 id="nondeterministic-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Non-deterministic content
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            This counter updates every second. A naive{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">toHaveText()</code> on the raw number
            will be flaky. Use{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">expect.poll()</code> or assert a
            regex that matches any number, not a specific value.
          </p>
          <div className="inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3">
            <span className="text-xs uppercase tracking-wider text-zinc-400">Uptime</span>
            <span
              data-testid="live-counter"
              aria-label={`${ticker} seconds`}
              className="text-2xl font-bold tabular-nums text-zinc-900"
            >
              {ticker}s
            </span>
          </div>
        </section>

        {/* ── Screenshot hint ────────────────────────────────────────────── */}
        <section aria-labelledby="screenshot-heading">
          <h2 id="screenshot-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Screenshot attachment
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Toggle the panel below, then use{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">
              testInfo.attach(&apos;panel-open&apos;, &#123; body: await page.screenshot() &#125;)
            </code>{' '}
            to embed it in the HTML report.
          </p>
          <button
            type="button"
            aria-expanded={screenshotHint}
            onClick={() => setScreenshotHint((v) => !v)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {screenshotHint ? 'Collapse panel' : 'Expand panel'}
          </button>
          {screenshotHint && (
            <div
              data-testid="expandable-panel"
              className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800"
            >
              📸 Take a screenshot here. This content should appear in the trace viewer and HTML
              report when you attach it.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
