import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'multi-tab')!;

export function MultiTab() {
  const openDashboard = () => {
    window.open('/practice/multi-tab/window', '_blank', 'noopener,noreferrer');
  };

  const openPopup = () => {
    window.open('/practice/multi-tab/popup', 'stagecraft-popup', 'width=480,height=360,noopener');
  };

  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-8 text-sm text-muted">
        When a link or button opens a new tab or popup, Playwright captures it with{' '}
        <code className="rounded bg-surface-raised px-1 text-xs">
          context.waitForEvent(&apos;page&apos;)
        </code>
        . You must set up the listener <em>before</em> triggering the action.
      </p>

      <div className="space-y-10">
        <section aria-labelledby="newtab-heading">
          <h2 id="newtab-heading" className="mb-1 text-base font-semibold text-content">
            Challenge 1 — New tab
          </h2>
          <p className="mb-4 text-sm text-muted">
            Click the button below. Playwright must capture the new page via{' '}
            <code className="rounded bg-surface-raised px-1 text-xs">
              const [newPage] = await Promise.all([context.waitForEvent(&apos;page&apos;),
              button.click()])
            </code>
            . Assert a heading on the new tab, then close it.
          </p>
          <button
            type="button"
            onClick={openDashboard}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Open dashboard in new tab
          </button>
        </section>

        <section aria-labelledby="popup-heading">
          <h2 id="popup-heading" className="mb-1 text-base font-semibold text-content">
            Challenge 2 — Popup window
          </h2>
          <p className="mb-4 text-sm text-muted">
            This button opens a popup window (not a tab). Use{' '}
            <code className="rounded bg-surface-raised px-1 text-xs">
              page.waitForEvent(&apos;popup&apos;)
            </code>{' '}
            to capture it. The popup can communicate back to the opener via{' '}
            <code className="rounded bg-surface-raised px-1 text-xs">
              window.opener.postMessage()
            </code>
            .
          </p>
          <button
            type="button"
            onClick={openPopup}
            className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-300 dark:hover:bg-indigo-950"
          >
            Open popup window
          </button>
          <div
            id="opener-result"
            role="status"
            aria-live="polite"
            className="mt-3 text-sm text-muted"
          />
        </section>

        <section aria-labelledby="storage-heading">
          <h2 id="storage-heading" className="mb-1 text-base font-semibold text-content">
            Challenge 3 — Cross-tab storage
          </h2>
          <p className="mb-4 text-sm text-muted">
            Both the main page and the new tab share the same{' '}
            <code className="rounded bg-surface-raised px-1 text-xs">localStorage</code> (same
            origin). Write a value in the new tab and assert it&apos;s visible here after switching
            back.
          </p>
          <div className="rounded-xl border border-edge bg-surface p-4">
            <p className="text-sm text-muted">
              Storage key:{' '}
              <code className="rounded bg-surface-raised px-1 text-xs">multi-tab:shared</code>
            </p>
            <p className="mt-1 text-sm text-muted">
              Current value:{' '}
              <span data-testid="shared-storage-value" className="font-mono">
                {localStorage.getItem('multi-tab:shared') ?? '(none)'}
              </span>
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 text-xs text-accent underline hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Reload to refresh value
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
