'use client';

import { startTransition, useCallback, useEffect, useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';

const CHALLENGE_ID = 'frames-contexts';
const OBJECTIVE =
  'Practice entering iframe content with frame-aware locators and prove that browser storage state stays isolated between contexts without using real authentication.';

const CONTEXT_LABEL_KEY = 'stagecraft_frames_context_label';

const EMBEDDED_TASK_FRAME_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        color-scheme: light;
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f8fafc;
        color: #172033;
      }
      body {
        margin: 0;
        padding: 24px;
      }
      main {
        display: grid;
        gap: 18px;
      }
      .panel {
        border: 1px solid #cbd5e1;
        border-radius: 18px;
        background: #ffffff;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        padding: 18px;
      }
      h1, h2, p {
        margin: 0;
      }
      h1 {
        font-size: 1.35rem;
        line-height: 1.2;
      }
      h2 {
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #365bd6;
      }
      p {
        color: #475569;
        line-height: 1.55;
      }
      label {
        display: block;
        margin-bottom: 6px;
        font-weight: 800;
      }
      input {
        box-sizing: border-box;
        width: 100%;
        border: 1px solid #94a3b8;
        border-radius: 14px;
        padding: 10px 12px;
        font: inherit;
      }
      button {
        border: 1px solid #365bd6;
        border-radius: 999px;
        background: #e8edff;
        color: #233f99;
        cursor: pointer;
        font: inherit;
        font-weight: 800;
        padding: 10px 14px;
      }
      button:hover,
      button:focus-visible {
        background: #dbe5ff;
        outline: 3px solid rgba(54, 91, 214, 0.28);
        outline-offset: 3px;
      }
      form,
      .actions {
        display: grid;
        gap: 12px;
      }
      [role='status'] {
        border: 1px solid #cbd5e1;
        border-radius: 14px;
        background: #f1f5f9;
        color: #172033;
        font-weight: 700;
        padding: 10px 12px;
      }
    </style>
    <title>Embedded task board</title>
  </head>
  <body>
    <main aria-labelledby="frame-title">
      <section class="panel" aria-label="Frame task summary">
        <h1 id="frame-title">Embedded task board</h1>
        <p>This content lives inside an iframe. The host page has its own DOM and storage state.</p>
      </section>

      <section class="panel" aria-label="Frame approval workflow">
        <h2>Approval workflow</h2>
        <div class="actions">
          <button type="button" id="approve-checkpoint">Approve checkpoint</button>
          <p id="approval-status" role="status" aria-live="polite">No checkpoint selected.</p>
        </div>
      </section>

      <section class="panel" aria-label="Frame reviewer note">
        <h2>Reviewer note</h2>
        <form id="reviewer-form">
          <div>
            <label for="reviewer-name">Reviewer name</label>
            <input id="reviewer-name" name="reviewer-name" autocomplete="off" />
          </div>
          <button type="submit">Save reviewer note</button>
        </form>
        <p id="reviewer-status" role="status" aria-live="polite">No reviewer note saved.</p>
      </section>
    </main>

    <script>
      const approvalButton = document.getElementById('approve-checkpoint');
      const approvalStatus = document.getElementById('approval-status');
      const reviewerForm = document.getElementById('reviewer-form');
      const reviewerName = document.getElementById('reviewer-name');
      const reviewerStatus = document.getElementById('reviewer-status');

      approvalButton.addEventListener('click', () => {
        approvalStatus.textContent = 'Checkpoint approved inside the frame.';
      });

      reviewerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = reviewerName.value.trim();
        reviewerStatus.textContent = name
          ? 'Reviewer note saved for ' + name + '.'
          : 'Enter a reviewer name before saving.';
      });
    </script>
  </body>
</html>`;

export function FramesContextsLab() {
  const { resetKey, triggerReset } = useLabReset();

  const handleReset = useCallback(() => {
    clearContextLabel();
    triggerReset();
  }, [triggerReset]);

  return (
    <PracticeLabLayout
      labTitle="Frames and Contexts Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={handleReset}
    >
      <FramesContextsContent key={resetKey} />
    </PracticeLabLayout>
  );
}

function FramesContextsContent() {
  return (
    <div className="space-y-6">
      <EmbeddedFramePanel />
      <ContextStatePanel />
    </div>
  );
}

function EmbeddedFramePanel() {
  return (
    <section aria-label="Embedded Task Frame" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 1 — Embedded Task Frame
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          The task board below is rendered inside an iframe. Practice moving from the host page into
          framed content before interacting with the approval button and reviewer form.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-muted/25 p-3">
        <iframe
          title="Task board frame"
          srcDoc={EMBEDDED_TASK_FRAME_HTML}
          sandbox="allow-scripts allow-forms"
          className="h-[520px] w-full rounded-2xl border border-border bg-white shadow-sm"
        />
      </div>

      <p className="text-sm leading-6 text-muted-foreground">
        The iframe title is intentionally stable so the frame can be identified without relying on
        generated classes or DOM depth.
      </p>
    </section>
  );
}

interface ContextPanelState {
  labelInput: string;
  savedLabel: string | null;
  message: string;
}

function ContextStatePanel() {
  const [contextState, setContextState] = useState<ContextPanelState>(createEmptyContextState);
  const { labelInput, savedLabel, message } = contextState;

  useEffect(() => {
    // Read from localStorage via startTransition so the update is low-priority
    // (satisfies react-hooks/set-state-in-effect). The functional setState form
    // guards against overwriting input the user has already typed, which removes
    // the race where the deferred transition ran after Playwright filled the input
    // and reset labelInput back to ''.
    const existing = readContextLabel();
    if (!existing) return;
    startTransition(() => {
      setContextState((current) => {
        if (current.labelInput !== '') return current;
        return { labelInput: existing, savedLabel: existing, message: `Saved label: ${existing}` };
      });
    });
  }, []);

  function handleSave() {
    const trimmed = labelInput.trim();
    if (!trimmed) {
      setContextState((current) => ({
        ...current,
        savedLabel: null,
        message: 'Enter a label before saving.',
      }));
      return;
    }

    localStorage.setItem(CONTEXT_LABEL_KEY, trimmed);
    setContextState({
      labelInput: trimmed,
      savedLabel: trimmed,
      message: `Saved label: ${trimmed}`,
    });
  }

  function handleClear() {
    clearContextLabel();
    setContextState(createEmptyContextState());
  }

  return (
    <section aria-label="Context State Sandbox" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 2 — Context State Sandbox
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Save a harmless label to this browser context. Open the lab in a separate context to show
          that local storage does not leak between isolated test runs.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-1.5">
          <label htmlFor="context-label" className="block text-sm font-bold text-card-foreground">
            Context label
          </label>
          <input
            id="context-label"
            type="text"
            value={labelInput}
            onChange={(event) =>
              setContextState((current) => ({ ...current, labelInput: event.target.value }))
            }
            placeholder="Example: Admin context"
            autoComplete="off"
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Save context label
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-card-foreground transition hover:border-ring hover:bg-muted focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Clear context label
          </button>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        aria-label="Context label status"
        className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm font-bold text-card-foreground"
      >
        {message}
      </p>

      <dl className="grid gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-bold text-card-foreground">Current context</dt>
          <dd className="mt-1 text-muted-foreground">{savedLabel ? savedLabel : 'No saved label'}</dd>
        </div>
        <div>
          <dt className="font-bold text-card-foreground">Isolation signal</dt>
          <dd className="mt-1 text-muted-foreground">
            A fresh browser context should start with no saved label.
          </dd>
        </div>
      </dl>
    </section>
  );
}

function createEmptyContextState(): ContextPanelState {
  return {
    labelInput: '',
    savedLabel: null,
    message: 'No label saved in this browser context.',
  };
}

function readContextLabel(): string | null {
  try {
    return localStorage.getItem(CONTEXT_LABEL_KEY);
  } catch {
    return null;
  }
}

function clearContextLabel(): void {
  try {
    localStorage.removeItem(CONTEXT_LABEL_KEY);
  } catch {
    // Ignore storage access failures so reset stays safe in restricted environments.
  }
}
