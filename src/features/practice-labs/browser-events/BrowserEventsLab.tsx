'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';

const CHALLENGE_ID = 'browser-events';
const OBJECTIVE =
  "Register event listeners before the action that triggers them and verify the outcome using Playwright's dialog, download, upload, popup, and navigation APIs.";

const DOWNLOAD_FILENAME = 'stagecraft-sample-report.txt';

// ─── Top-level lab component ───────────────────────────────────────────────────

export function BrowserEventsLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Browser Events Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <BrowserEventsContent key={resetKey} />
    </PracticeLabLayout>
  );
}

// ─── Content — remounted on reset ─────────────────────────────────────────────

function BrowserEventsContent() {
  return (
    <div className="space-y-6">
      <DialogPanel />
      <FileUploadPanel />
      <DownloadPanel />
      <PopupPanel />
      <NavigationPanel />
    </div>
  );
}

// ─── Panel 1: Native Dialogs ───────────────────────────────────────────────────

type DialogResult =
  | { kind: 'none' }
  | { kind: 'alert' }
  | { kind: 'confirm'; accepted: boolean }
  | { kind: 'prompt'; value: string | null };

function DialogPanel() {
  const [result, setResult] = useState<DialogResult>({ kind: 'none' });

  function handleAlert() {
    window.alert('This is a Playwright practice alert.');
    setResult({ kind: 'alert' });
  }

  function handleConfirm() {
    const accepted = window.confirm('Do you want to confirm this action?');
    setResult({ kind: 'confirm', accepted });
  }

  function handlePrompt() {
    const value = window.prompt('Enter a practice value:', 'hello');
    setResult({ kind: 'prompt', value });
  }

  return (
    <section aria-label="Native Dialogs" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 1 — Native Dialogs
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Trigger a native browser dialog and verify the outcome visible in the page. Register your{' '}
          <code className="font-mono text-xs">page.on(&quot;dialog&quot;)</code> handler before
          clicking.
        </p>
      </div>

      {/* Trigger buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAlert}
          aria-label="Trigger alert dialog"
          className="rounded-full border border-warning/40 bg-warning/10 px-4 py-2 text-sm font-bold text-warning-foreground transition hover:bg-warning/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Trigger alert
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          aria-label="Trigger confirm dialog"
          className="rounded-full border border-secondary/40 bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary transition hover:bg-secondary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Trigger confirm
        </button>

        <button
          type="button"
          onClick={handlePrompt}
          aria-label="Trigger prompt dialog"
          className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Trigger prompt
        </button>
      </div>

      {/* Result area */}
      <div role="status" aria-label="Dialog result" aria-live="polite" className="min-h-[2.5rem]">
        {result.kind === 'none' && (
          <p className="text-sm text-muted-foreground">No dialog triggered yet.</p>
        )}
        {result.kind === 'alert' && (
          <p className="text-sm font-semibold text-card-foreground">Alert dismissed.</p>
        )}
        {result.kind === 'confirm' && (
          <p className="text-sm font-semibold text-card-foreground">
            {result.accepted ? 'Confirm: accepted.' : 'Confirm: dismissed.'}
          </p>
        )}
        {result.kind === 'prompt' && (
          <p className="text-sm font-semibold text-card-foreground">
            {result.value !== null ? `Prompt value: "${result.value}"` : 'Prompt: cancelled.'}
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Panel 2: File Upload ──────────────────────────────────────────────────────

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

function FileUploadPanel() {
  const [files, setFiles] = useState<FileInfo[]>([]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) {
      setFiles([]);
      return;
    }
    setFiles(
      Array.from(list).map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
      })),
    );
  }, []);

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${String(bytes)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <section aria-label="File Upload" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 2 — File Upload
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Select one or more files. Verify the name, size, and type shown below using{' '}
          <code className="font-mono text-xs">locator.setInputFiles()</code>.
        </p>
      </div>

      {/* File input */}
      <div className="space-y-1.5">
        <label htmlFor="file-upload" className="block text-sm font-bold text-card-foreground">
          Choose file
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleChange}
          aria-label="Choose file"
          className="block w-full cursor-pointer rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-bold file:text-primary focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        />
      </div>

      {/* File info */}
      {files.length === 0 ? (
        <p role="status" aria-label="No file selected" className="text-sm text-muted-foreground">
          No file selected.
        </p>
      ) : (
        <ul aria-label="Selected files" className="space-y-2">
          {files.map((f) => (
            <li
              key={f.name}
              aria-label={f.name}
              className="stage-card flex flex-wrap items-center justify-between gap-2 bg-muted/20 px-4 py-3"
            >
              <span className="text-sm font-semibold text-card-foreground">{f.name}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span aria-label={`Size: ${formatBytes(f.size)}`}>{formatBytes(f.size)}</span>
                <span aria-label={`Type: ${f.type}`}>{f.type}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Panel 3: File Download ────────────────────────────────────────────────────

type DownloadStatus = 'idle' | 'initiated';

function DownloadPanel() {
  const [status, setStatus] = useState<DownloadStatus>('idle');

  function handleDownload() {
    const lines = [
      'Stagecraft Sample Report',
      '========================',
      `Generated: ${new Date().toISOString()}`,
      '',
      'This file was downloaded from the Playwright practice lab.',
      'Use page.waitForEvent("download") to capture and inspect it.',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = DOWNLOAD_FILENAME;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setStatus('initiated');
  }

  return (
    <section aria-label="File Download" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 3 — File Download
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Click the button to download a generated text file. Use{' '}
          <code className="font-mono text-xs">page.waitForEvent(&quot;download&quot;)</code> before
          the click to capture the event and verify the suggested filename.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleDownload}
          aria-label="Download sample report"
          className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-5 py-2.5 text-sm font-bold text-success transition hover:bg-success/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span aria-hidden="true">↓</span>
          Download sample report
        </button>

        <p
          role="status"
          aria-live="polite"
          aria-label={status === 'initiated' ? 'Download initiated' : 'Download ready'}
          className="text-sm font-semibold"
        >
          {status === 'idle' && <span className="text-muted-foreground">Ready to download.</span>}
          {status === 'initiated' && (
            <span className="text-success">
              Download initiated — <code className="font-mono text-xs">{DOWNLOAD_FILENAME}</code>
            </span>
          )}
        </p>
      </div>

      {status === 'initiated' && (
        <dl className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm">
          <div className="flex gap-3">
            <dt className="font-bold text-card-foreground">Filename</dt>
            <dd className="font-mono text-xs text-muted-foreground">{DOWNLOAD_FILENAME}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}

// ─── Panel 4: Popup / New Tab ─────────────────────────────────────────────────

function PopupPanel() {
  return (
    <section id="popup-note" aria-label="Popup and New Tab" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 4 — Popup / New Tab
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Open a deterministic same-origin tab. Start waiting for{' '}
          <code className="font-mono text-xs">page.waitForEvent(&quot;popup&quot;)</code> before the
          click, then assert the popup URL and content.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        <p className="font-semibold text-card-foreground">Popup note target</p>
        <p>
          This section is reachable at <code className="font-mono text-xs">#popup-note</code>
          so the opened tab has a stable same-origin destination.
        </p>
      </div>

      <a
        href="/practice/browser-events#popup-note"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span aria-hidden="true">↗</span>
        Open popup note in new tab
      </a>
    </section>
  );
}

// ─── Panel 5: Navigation Events ───────────────────────────────────────────────

function NavigationPanel() {
  return (
    <section aria-label="Navigation Events" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 5 — Navigation Events
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Trigger a local navigation by moving from the practice lab to its challenge detail page.
          Pair the click with <code className="font-mono text-xs">page.waitForURL()</code>
          when the expected destination matters.
        </p>
      </div>

      <Link
        href="/challenges/browser-events"
        className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-5 py-2.5 text-sm font-bold text-secondary transition hover:bg-secondary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span aria-hidden="true">→</span>
        Navigate to Browser Events challenge detail
      </Link>
    </section>
  );
}
