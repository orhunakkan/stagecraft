import { useState } from 'react';

// The page that opens in a new tab from the Multi-Tab lab.
// It is intentionally minimal — just enough to practice asserting cross-tab state.
export function MultiTabWindow() {
  const [count, setCount] = useState(0);

  const writeShared = () => {
    localStorage.setItem('multi-tab:shared', `written-from-tab-${Date.now()}`);
    setCount((n) => n + 1);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold text-zinc-900">Dashboard (New Tab)</h1>
      <p className="mt-2 text-sm text-zinc-500">
        You are on a page that was opened in a new tab. Playwright can target this page via{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">context.pages()</code> or the captured
        page reference from{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">
          context.waitForEvent(&apos;page&apos;)
        </code>
        .
      </p>

      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <h2 className="mb-1 text-sm font-semibold text-zinc-800">Counter</h2>
          <p
            data-testid="tab-counter"
            aria-label={`Counter: ${count}`}
            className="text-3xl font-bold text-zinc-900"
          >
            {count}
          </p>
          <button
            type="button"
            onClick={() => setCount((n) => n + 1)}
            className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Increment
          </button>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <h2 className="mb-1 text-sm font-semibold text-zinc-800">Shared storage</h2>
          <p className="mb-3 text-xs text-zinc-500">
            Write a value to <code className="rounded bg-zinc-100 px-1">localStorage</code> and
            observe it on the opener page.
          </p>
          <button
            type="button"
            onClick={writeShared}
            data-testid="write-storage"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Write to shared storage ({count} times)
          </button>
        </div>
      </div>
    </div>
  );
}
