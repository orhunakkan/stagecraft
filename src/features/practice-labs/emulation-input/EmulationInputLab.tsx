'use client';

import { useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';

const CHALLENGE_ID = 'emulation-input';
const OBJECTIVE =
  'Practice viewport-aware assertions, keyboard interactions, pointer actions, and touch-friendly controls using deterministic UI targets.';

export function EmulationInputLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Emulation and Input Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <EmulationInputContent key={resetKey} />
    </PracticeLabLayout>
  );
}

function EmulationInputContent() {
  return (
    <div className="space-y-6">
      <ViewportDashboard />
      <KeyboardCommandCenter />
      <PointerPracticePad />
      <TouchFriendlyControls />
    </div>
  );
}

function ViewportDashboard() {
  return (
    <section aria-label="Viewport-Aware Dashboard" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 1 — Viewport-Aware Dashboard
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Resize the viewport or use a device profile to confirm that layout and visible guidance
          adapt without hiding the core task information.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-primary/25 bg-primary/8 p-5">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Compact</p>
          <p className="mt-2 text-sm leading-6 text-card-foreground">
            On narrow screens, controls stack vertically and the compact mode note is visible.
          </p>
        </article>
        <article className="rounded-3xl border border-secondary/25 bg-secondary/8 p-5">
          <p className="text-xs font-black uppercase tracking-widest text-secondary">Tablet</p>
          <p className="mt-2 text-sm leading-6 text-card-foreground">
            Medium widths keep actions comfortable while showing more status detail.
          </p>
        </article>
        <article className="rounded-3xl border border-accent/25 bg-accent/8 p-5">
          <p className="text-xs font-black uppercase tracking-widest text-accent">Desktop</p>
          <p className="mt-2 text-sm leading-6 text-card-foreground">
            Wide screens place summary cards side by side for fast scanning.
          </p>
        </article>
      </div>

      <div
        role="status"
        aria-live="polite"
        aria-label="Viewport mode"
        className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm font-bold text-card-foreground"
      >
        <span className="sm:hidden">Viewport mode: compact mobile layout.</span>
        <span className="hidden sm:inline lg:hidden">Viewport mode: tablet layout.</span>
        <span className="hidden lg:inline">Viewport mode: expanded desktop layout.</span>
      </div>
    </section>
  );
}

function KeyboardCommandCenter() {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState('No command submitted yet.');

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const trimmed = command.trim();
      setResult(trimmed ? `Command submitted: ${trimmed}` : 'Enter a command before submitting.');
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setCommand('');
      setResult('Command input cleared.');
    }
  }

  return (
    <section aria-label="Keyboard Command Center" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 2 — Keyboard Command Center
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Focus the command input, type text, press Enter to submit, or press Escape to clear the
          field. Assert the user-visible status rather than private key handlers.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="command-input" className="block text-sm font-bold text-card-foreground">
          Command input
        </label>
        <input
          id="command-input"
          type="text"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command and press Enter"
          autoComplete="off"
          className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
      </div>

      <p
        role="status"
        aria-live="polite"
        aria-label="Keyboard result"
        className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm font-bold text-card-foreground"
      >
        {result}
      </p>
    </section>
  );
}

function PointerPracticePad() {
  const [status, setStatus] = useState('Pointer target idle.');
  const [clickCount, setClickCount] = useState(0);

  function handleClick() {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    setStatus(`Pointer click recorded (${nextCount}).`);
  }

  return (
    <section aria-label="Pointer Practice Pad" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 3 — Pointer Practice Pad
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Exercise hover, click, and double-click behavior with controls that expose visible status
          updates for stable assertions.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onMouseEnter={() => setStatus('Pointer is hovering over the target.')}
          onMouseLeave={() => setStatus('Pointer left the hover target.')}
          className="rounded-3xl border border-secondary/40 bg-secondary/10 px-5 py-4 text-sm font-black text-secondary transition hover:bg-secondary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Hover pointer target
        </button>
        <button
          type="button"
          onClick={handleClick}
          className="rounded-3xl border border-primary/40 bg-primary/10 px-5 py-4 text-sm font-black text-primary transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Click pointer target
        </button>
        <button
          type="button"
          onDoubleClick={() => setStatus('Double-click action confirmed.')}
          className="rounded-3xl border border-accent/40 bg-accent/10 px-5 py-4 text-sm font-black text-accent transition hover:bg-accent/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Double-click target
        </button>
      </div>

      <p
        role="status"
        aria-live="polite"
        aria-label="Pointer status"
        className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm font-bold text-card-foreground"
      >
        {status}
      </p>
    </section>
  );
}

function TouchFriendlyControls() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section aria-label="Touch-Friendly Controls" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 4 — Touch-Friendly Controls
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Use large controls that remain comfortable on emulated mobile viewports and still work with
          mouse or keyboard input on desktop.
        </p>
      </div>

      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-3xl border border-success/40 bg-success/10 px-5 py-4 text-sm font-black text-success transition hover:bg-success/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring sm:w-auto"
      >
        Toggle mobile checklist
      </button>

      <p
        role="status"
        aria-live="polite"
        aria-label="Touch control status"
        className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm font-bold text-card-foreground"
      >
        {expanded ? 'Mobile checklist expanded.' : 'Mobile checklist collapsed.'}
      </p>

      {expanded && (
        <ul
          aria-label="Mobile checklist"
          className="grid gap-3 rounded-2xl border border-border bg-muted/20 p-4 text-sm text-card-foreground sm:grid-cols-2"
        >
          <li>Tap targets are at least comfortable to press.</li>
          <li>Important labels remain visible at compact widths.</li>
          <li>Keyboard focus states are still visible.</li>
          <li>Layout changes preserve the same user task.</li>
        </ul>
      )}
    </section>
  );
}
