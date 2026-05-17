import { useState } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'frames-contexts')!;

// Inline iframe content as a data URI — same-origin so Playwright's
// frameLocator() can scope into it without cross-origin restrictions.
const IFRAME_COUNTER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Counter frame</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #f9fafb; }
  h2 { font-size: 0.875rem; font-weight: 600; color: #374151; margin: 0 0 12px; }
  .count { font-size: 2rem; font-weight: 700; color: #1e1b4b; margin: 0 0 12px; }
  button { padding: 6px 14px; border-radius: 6px; border: 1px solid #d1d5db; background: white;
           font-size: 0.8rem; cursor: pointer; margin-right: 6px; }
  button:hover { background: #f3f4f6; }
  button.primary { background: #4f46e5; color: white; border-color: #4f46e5; }
  button.primary:hover { background: #4338ca; }
  input { border: 1px solid #d1d5db; border-radius: 6px; padding: 4px 10px;
          font-size: 0.8rem; margin-top: 10px; display: block; }
  label { font-size: 0.8rem; color: #6b7280; display: block; margin-top: 10px; }
</style>
</head>
<body>
<h2>Embedded Counter</h2>
<p class="count" id="count" aria-live="polite">0</p>
<button class="primary" onclick="inc()">Increment</button>
<button onclick="dec()">Decrement</button>
<button onclick="reset()">Reset</button>
<label for="step-input">Step size</label>
<input id="step-input" type="number" value="1" min="1" max="100" aria-label="Step size" />
<script>
  function getStep() {
    return parseInt(document.getElementById('step-input').value, 10) || 1;
  }
  function inc() {
    const el = document.getElementById('count');
    el.textContent = String(parseInt(el.textContent) + getStep());
  }
  function dec() {
    const el = document.getElementById('count');
    el.textContent = String(parseInt(el.textContent) - getStep());
  }
  function reset() {
    document.getElementById('count').textContent = '0';
  }
</script>
</body>
</html>`;

const IFRAME_FORM_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Login frame</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #f9fafb; }
  h2 { font-size: 0.875rem; font-weight: 600; color: #374151; margin: 0 0 12px; }
  label { display: block; font-size: 0.8rem; color: #6b7280; margin-bottom: 3px; margin-top: 10px; }
  input { border: 1px solid #d1d5db; border-radius: 6px; padding: 5px 10px;
          font-size: 0.8rem; width: 100%; box-sizing: border-box; }
  button { margin-top: 12px; padding: 6px 16px; background: #4f46e5; color: white;
           border: none; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
  button:hover { background: #4338ca; }
  #msg { margin-top: 10px; font-size: 0.8rem; color: #16a34a; }
</style>
</head>
<body>
<h2>Embedded Login</h2>
<form onsubmit="handleSubmit(event)">
  <label for="username">Username</label>
  <input id="username" name="username" type="text" autocomplete="username" />
  <label for="password">Password</label>
  <input id="password" name="password" type="password" autocomplete="current-password" />
  <button type="submit">Sign in</button>
</form>
<p id="msg" role="status" aria-live="polite"></p>
<script>
  function handleSubmit(e) {
    e.preventDefault();
    const u = document.getElementById('username').value;
    document.getElementById('msg').textContent = u ? 'Signed in as ' + u : 'Username required';
  }
</script>
</body>
</html>`;

const counterSrc = `data:text/html;charset=utf-8,${encodeURIComponent(IFRAME_COUNTER_HTML)}`;
const formSrc = `data:text/html;charset=utf-8,${encodeURIComponent(IFRAME_FORM_HTML)}`;

export function FramesContexts() {
  const [activeChallenge, setActiveChallenge] = useState<1 | 2>(1);

  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-6 text-sm text-zinc-500">
        Use <code className="rounded bg-zinc-100 px-1 text-xs">page.frameLocator(selector)</code> to
        scope all subsequent locator calls inside a specific iframe. Locators outside that frame
        won&apos;t match elements inside it.
      </p>

      {/* Challenge tabs */}
      <div className="mb-6 flex gap-2" role="tablist" aria-label="Frame challenges">
        {([1, 2] as const).map((n) => (
          <button
            key={n}
            type="button"
            role="tab"
            aria-selected={activeChallenge === n}
            onClick={() => setActiveChallenge(n)}
            className={[
              'rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors',
              activeChallenge === n
                ? 'border-indigo-500 bg-indigo-600 text-white'
                : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50',
            ].join(' ')}
          >
            Challenge {n}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeChallenge === 1 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <h2 className="mb-1 text-sm font-semibold text-zinc-800">
                Challenge 1 — Counter in an iframe
              </h2>
              <p className="mb-4 text-xs text-zinc-500">
                Use{' '}
                <code className="rounded bg-zinc-100 px-1 text-xs">
                  page.frameLocator(&apos;iframe[title=&quot;Counter frame&quot;]&apos;)
                </code>{' '}
                to interact with the counter and assert its value. Try changing the step size before
                incrementing.
              </p>
              <iframe
                src={counterSrc}
                title="Counter frame"
                className="h-52 w-full rounded-lg border border-zinc-200 bg-white"
              />
            </div>
          </div>
        )}

        {activeChallenge === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <h2 className="mb-1 text-sm font-semibold text-zinc-800">
                Challenge 2 — Login form in an iframe
              </h2>
              <p className="mb-4 text-xs text-zinc-500">
                Scope a locator into the login iframe and fill the username and password fields.
                Assert the success message that appears after submitting. Notice that{' '}
                <code className="rounded bg-zinc-100 px-1 text-xs">page.getByLabel()</code> alone
                won&apos;t reach inside the frame.
              </p>
              <iframe
                src={formSrc}
                title="Login frame"
                className="h-56 w-full rounded-lg border border-zinc-200 bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
