import { useState, useRef } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'browser-events')!;

type DialogResult = { type: string; value: string } | null;

export function BrowserEvents() {
  const [dialogResult, setDialogResult] = useState<DialogResult>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerAlert = () => {
    window.alert('This is an alert dialog. Playwright handles it with page.on("dialog").');
    setDialogResult({ type: 'alert', value: 'accepted' });
  };

  const triggerConfirm = () => {
    const accepted = window.confirm('Do you want to proceed? Accept or dismiss this dialog.');
    setDialogResult({ type: 'confirm', value: accepted ? 'accepted' : 'dismissed' });
  };

  const triggerPrompt = () => {
    const value = window.prompt('Enter your name:', 'Playwright');
    if (value !== null) {
      setDialogResult({ type: 'prompt', value: `"${value}"` });
    } else {
      setDialogResult({ type: 'prompt', value: 'dismissed' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadedFile(file ? `${file.name} (${(file.size / 1024).toFixed(1)} KB)` : null);
  };

  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-8 text-sm text-zinc-500">
        Browser-level events require dedicated Playwright APIs. Register handlers <em>before</em>{' '}
        triggering the event, or the handler fires too late.
      </p>

      <div className="space-y-10">
        {/* ── Dialogs ─────────────────────────────────────────────────────── */}
        <section aria-labelledby="dialogs-heading">
          <h2 id="dialogs-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Native dialogs
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Use{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">
              page.on(&apos;dialog&apos;, handler)
            </code>{' '}
            to intercept each type. The handler must be registered before the button click.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={triggerAlert}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Trigger alert
            </button>
            <button
              type="button"
              onClick={triggerConfirm}
              className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Trigger confirm
            </button>
            <button
              type="button"
              onClick={triggerPrompt}
              className="rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Trigger prompt
            </button>
          </div>

          {dialogResult && (
            <div
              role="status"
              aria-live="polite"
              className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
            >
              Last dialog: <strong>{dialogResult.type}</strong> → {dialogResult.value}
            </div>
          )}
        </section>

        {/* ── File upload ─────────────────────────────────────────────────── */}
        <section aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="mb-1 text-base font-semibold text-zinc-900">
            File upload
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Use <code className="rounded bg-zinc-100 px-1 text-xs">locator.setInputFiles()</code> to
            attach files programmatically. The file input does not need to be visible.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="file-upload"
              className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Choose file
            </label>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              aria-label="Upload a file"
              onChange={handleFileChange}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Upload via button
            </button>
          </div>

          {uploadedFile ? (
            <p role="status" aria-live="polite" className="mt-3 text-sm text-zinc-700">
              Selected: <strong>{uploadedFile}</strong>
            </p>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">No file selected yet.</p>
          )}
        </section>

        {/* ── File download ────────────────────────────────────────────────── */}
        <section aria-labelledby="download-heading">
          <h2 id="download-heading" className="mb-1 text-base font-semibold text-zinc-900">
            File download
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Use{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">
              page.waitForEvent(&apos;download&apos;)
            </code>{' '}
            to capture the download before clicking. Assert the suggested filename or save path.
          </p>

          <a
            href="data:text/plain;charset=utf-8,Hello%20from%20Stagecraft!%0AThis%20is%20a%20practice%20download%20file."
            download="stagecraft-sample.txt"
            className="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Download sample.txt
          </a>
        </section>

        {/* ── Navigation event ─────────────────────────────────────────────── */}
        <section aria-labelledby="navigation-heading">
          <h2 id="navigation-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Navigation event
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Use <code className="rounded bg-zinc-100 px-1 text-xs">page.waitForNavigation()</code>{' '}
            or <code className="rounded bg-zinc-100 px-1 text-xs">page.waitForURL()</code> when a
            click causes a page transition. This link navigates away from the lab.
          </p>

          <a
            href="/"
            className="inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Navigate to home
          </a>
        </section>
      </div>
    </div>
  );
}
