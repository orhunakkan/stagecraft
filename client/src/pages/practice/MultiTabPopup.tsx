import { useEffect, useState } from 'react';

// Popup window opened from Multi-Tab Challenge 2.
// Uses window.opener.postMessage to send a result back to the opener.
export function MultiTabPopup() {
  const [sent, setSent] = useState(false);
  const [value, setValue] = useState('Hello from popup');

  useEffect(() => {
    // Listen for a request from the opener (optional advanced challenge)
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'REQUEST_VALUE') {
        window.opener?.postMessage({ type: 'POPUP_RESULT', value }, '*');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [value]);

  const sendResult = () => {
    if (window.opener) {
      window.opener.postMessage({ type: 'POPUP_RESULT', value }, window.location.origin);
    }
    setSent(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
      <h1 className="text-xl font-bold text-zinc-900">Popup Window</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-zinc-500">
        This is a popup. After clicking &quot;Send result&quot;, the opener page receives a
        message via{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">window.postMessage</code>. Playwright
        captures popups with{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">page.waitForEvent(&apos;popup&apos;)</code>.
      </p>

      <div className="mt-6 w-full max-w-xs space-y-3">
        <label className="block text-xs font-medium text-zinc-600">
          Value to send
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Value to send to opener"
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={sendResult}
          data-testid="send-result"
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Send result to opener
        </button>
        {sent && (
          <p role="status" aria-live="polite" className="text-center text-sm text-emerald-600">
            ✓ Sent!
          </p>
        )}
      </div>
    </div>
  );
}
