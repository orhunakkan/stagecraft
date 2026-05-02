'use client';

import { useEffect, useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';
import {
  initialScenarioState,
  nextStepForScenario,
  STEP_DELAYS,
  type ScenarioId,
  type ScenarioState,
} from './async-state';

const CHALLENGE_ID = 'async-ui';
const OBJECTIVE =
  'Use auto-waiting and web-first assertions to verify state changes without relying on fixed time delays.';

// ─── Pipeline stage items for the Staged Updates scenario ─────────────────────

const PIPELINE_STAGES = [
  'Stage 1: Authentication verified',
  'Stage 2: Data validated',
  'Stage 3: Report generated',
  'Stage 4: Notifications sent',
] as const;

const PARTIAL_STAGE_COUNT = 2;

// ─── Top-level lab component ───────────────────────────────────────────────────

export function AsyncUiLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Async UI Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <AsyncUiContent key={resetKey} />
    </PracticeLabLayout>
  );
}

function AsyncUiContent() {
  return (
    <div className="space-y-6">
      <ScenarioPanel
        scenarioId="basic-success"
        title="Scenario 1 — Basic Success Flow"
        description="Start the workflow and wait for loading to resolve into a success state. Practice asserting both the transient loading state and the final success state."
      />
      <ScenarioPanel
        scenarioId="retry-error"
        title="Scenario 2 — Retry Error Flow"
        description="The first attempt always produces a recoverable error. Verify the error state, click Retry, and then verify the success state that follows."
      />
      <ScenarioPanel
        scenarioId="staged-updates"
        title="Scenario 3 — Staged Updates Flow"
        description="Data arrives in two stages. Assert the partial state — two visible items — and then the complete state with all four items."
      />
    </div>
  );
}

// ─── Individual scenario panel ─────────────────────────────────────────────────

interface ScenarioPanelProps {
  scenarioId: ScenarioId;
  title: string;
  description: string;
}

function ScenarioPanel({ scenarioId, title, description }: ScenarioPanelProps) {
  const [state, setState] = useState<ScenarioState>(initialScenarioState);

  // Schedule automatic step advancement for loading and partial steps.
  useEffect(() => {
    const { step, retryAttempts } = state;

    // Only auto-advance active (non-idle, non-terminal, non-error) steps.
    if (step !== 'loading' && step !== 'partial') return;

    const delay = STEP_DELAYS[scenarioId][step as 'loading' | 'partial'];
    if (!delay) return;

    const next = nextStepForScenario(scenarioId, step, retryAttempts);
    if (!next) return;

    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, step: next }));
    }, delay);

    return () => clearTimeout(timer);
  }, [state, scenarioId]);

  function handleStart() {
    setState({ step: 'loading', retryAttempts: 0 });
  }

  function handleRetry() {
    setState((prev) => ({ step: 'loading', retryAttempts: prev.retryAttempts + 1 }));
  }

  return (
    <section aria-label={title} className="stage-card p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      {/* Status and content area */}
      <ScenarioDisplay
        scenarioId={scenarioId}
        state={state}
        onStart={handleStart}
        onRetry={handleRetry}
      />
    </section>
  );
}

// ─── Display component — renders differently per scenario × step ───────────────

interface ScenarioDisplayProps {
  scenarioId: ScenarioId;
  state: ScenarioState;
  onStart: () => void;
  onRetry: () => void;
}

function ScenarioDisplay({ scenarioId, state, onStart, onRetry }: ScenarioDisplayProps) {
  const { step, retryAttempts } = state;

  if (step === 'idle') {
    return (
      <IdlePanel scenarioId={scenarioId} onStart={onStart} />
    );
  }

  if (step === 'loading') {
    return <LoadingPanel scenarioId={scenarioId} />;
  }

  if (step === 'error') {
    return <ErrorPanel onRetry={onRetry} />;
  }

  if (step === 'partial') {
    return <PartialPanel />;
  }

  // success
  return <SuccessPanel scenarioId={scenarioId} retryAttempts={retryAttempts} />;
}

// ─── Step-specific panels ──────────────────────────────────────────────────────

const START_LABELS: Record<ScenarioId, string> = {
  'basic-success': 'Start basic success workflow',
  'retry-error': 'Start retry error flow',
  'staged-updates': 'Start staged updates flow',
};

const IDLE_DESCRIPTIONS: Record<ScenarioId, string> = {
  'basic-success': 'Workflow not started',
  'retry-error': 'Retry flow not started',
  'staged-updates': 'Staged flow not started',
};

function IdlePanel({ scenarioId, onStart }: { scenarioId: ScenarioId; onStart: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center space-y-4">
      <p role="status" className="text-sm font-semibold text-muted-foreground">
        {IDLE_DESCRIPTIONS[scenarioId]}
      </p>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        {START_LABELS[scenarioId]}
      </button>
    </div>
  );
}

const LOADING_LABELS: Record<ScenarioId, string> = {
  'basic-success': 'Loading workflow data…',
  'retry-error': 'Connecting to service…',
  'staged-updates': 'Initializing pipeline…',
};

function LoadingPanel({ scenarioId }: { scenarioId: ScenarioId }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={LOADING_LABELS[scenarioId]}
      className="rounded-2xl border border-secondary/30 bg-secondary/8 px-6 py-8"
    >
      <div className="flex items-center gap-3">
        {/* Accessible spinner */}
        <span
          aria-hidden="true"
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent"
        />
        <p className="text-sm font-semibold text-secondary">{LOADING_LABELS[scenarioId]}</p>
      </div>
    </div>
  );
}

function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-danger/30 bg-danger/8 px-6 py-8 space-y-4"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-lg">✗</span>
        <p className="text-sm font-bold text-danger">Connection failed (simulated)</p>
      </div>
      <p className="text-sm text-muted-foreground">
        The request could not be completed. This is a deterministic error — retrying will
        always succeed.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-5 py-2.5 text-sm font-bold text-warning-foreground transition hover:bg-warning/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Retry connection
      </button>
    </div>
  );
}

function PartialPanel() {
  const visibleStages = PIPELINE_STAGES.slice(0, PARTIAL_STAGE_COUNT);

  return (
    <div
      role="status"
      aria-label="Loading more… (2 of 4 items)"
      className="rounded-2xl border border-warning/30 bg-warning/8 px-6 py-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-warning border-t-transparent"
        />
        <p className="text-sm font-bold text-warning-foreground">
          Loading more… (2 of 4 items)
        </p>
      </div>
      <ul aria-label="Pipeline stages loaded so far" className="space-y-2">
        {visibleStages.map((stage) => (
          <li key={stage} className="flex items-center gap-2 text-sm text-card-foreground">
            <span aria-hidden="true" className="text-success">✓</span>
            {stage}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SuccessPanel({
  scenarioId,
  retryAttempts,
}: {
  scenarioId: ScenarioId;
  retryAttempts: number;
}) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-success/30 bg-success/8 px-6 py-6 space-y-4"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-success text-lg">✓</span>
        <p className="text-sm font-bold text-success">
          {successHeading(scenarioId, retryAttempts)}
        </p>
      </div>

      {scenarioId === 'basic-success' && <BasicSuccessItems />}
      {scenarioId === 'retry-error' && <RetrySuccessItems retryAttempts={retryAttempts} />}
      {scenarioId === 'staged-updates' && <AllStagesItems />}
    </div>
  );
}

function successHeading(scenarioId: ScenarioId, retryAttempts: number): string {
  switch (scenarioId) {
    case 'basic-success':
      return 'Workflow complete';
    case 'retry-error':
      return retryAttempts === 1
        ? 'Connection restored after 1 retry attempt'
        : `Connection restored after ${String(retryAttempts)} retry attempts`;
    case 'staged-updates':
      return 'Pipeline complete (4 of 4 items)';
  }
}

function BasicSuccessItems() {
  return (
    <ul aria-label="Processed items" className="space-y-2">
      {['Report generated', 'Notifications sent', 'Log entry saved'].map((label) => (
        <li key={label} className="flex items-center gap-2 text-sm text-card-foreground">
          <span aria-hidden="true" className="text-success">✓</span>
          {label}
        </li>
      ))}
    </ul>
  );
}

function RetrySuccessItems({ retryAttempts }: { retryAttempts: number }) {
  return (
    <p className="text-sm text-muted-foreground">
      Recovered after {retryAttempts === 1 ? '1 retry attempt' : `${String(retryAttempts)} retry attempts`}.
      The service is now available.
    </p>
  );
}

function AllStagesItems() {
  return (
    <ul aria-label="Pipeline stages" className="space-y-2">
      {PIPELINE_STAGES.map((stage) => (
        <li key={stage} className="flex items-center gap-2 text-sm text-card-foreground">
          <span aria-hidden="true" className="text-success">✓</span>
          {stage}
        </li>
      ))}
    </ul>
  );
}
