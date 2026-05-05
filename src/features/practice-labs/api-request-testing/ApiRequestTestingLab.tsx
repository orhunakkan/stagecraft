'use client';

import { useCallback, useEffect, useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';
import {
  STATUS_COLORS,
  STATUS_LABELS,
  VALID_STATUSES,
  type RunStatus,
  type TestRun,
} from './run-fixtures';

const CHALLENGE_ID = 'api-request-testing';
const API_BASE = '/api/practice/runs';
const OBJECTIVE =
  "Use Playwright's request fixture to send HTTP requests, assert response status and JSON shape, and combine API calls with UI verification.";

// ─── Fetch state ────────────────────────────────────────────────────────────────

type LoadState = 'loading' | 'success' | 'error';

interface StoreState {
  loadState: LoadState;
  runs: TestRun[];
  errorMessage: string;
}

function initialStoreState(): StoreState {
  return { loadState: 'loading', runs: [], errorMessage: '' };
}

// ─── Top-level lab component ───────────────────────────────────────────────────

export function ApiRequestTestingLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="API Request Testing Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <ApiRequestTestingContent key={resetKey} />
    </PracticeLabLayout>
  );
}

// ─── Content — remounted on reset ─────────────────────────────────────────────

function ApiRequestTestingContent() {
  const [state, setState] = useState<StoreState>(initialStoreState);

  const loadRuns = useCallback(async () => {
    setState((prev) => ({ ...prev, loadState: 'loading' }));
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP ${String(res.status)}`);
      const data = (await res.json()) as { runs: TestRun[] };
      setState({ loadState: 'success', runs: data.runs, errorMessage: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState({ loadState: 'error', runs: [], errorMessage: message });
    }
  }, []);

  useEffect(() => {
    // loadRuns is async — setState is called after awaiting, not synchronously here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRuns();
  }, [loadRuns]);

  async function handleCreate(name: string, status: RunStatus) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status }),
    });
    if (res.ok) await loadRuns();
  }

  async function handleDelete(id: string) {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    await loadRuns();
  }

  return (
    <div className="space-y-6">
      <SeededDataNotice />
      <RunRegistryPanel state={state} onDelete={handleDelete} onRefresh={loadRuns} />
      <AddRunPanel onAdd={handleCreate} />
      <ApiReferencePanel />
    </div>
  );
}

// ─── Seeded data notice ────────────────────────────────────────────────────────

function SeededDataNotice() {
  return (
    <aside
      aria-label="Seeded data notice"
      className="rounded-2xl border border-secondary/30 bg-secondary/8 px-5 py-4"
    >
      <p className="text-sm text-card-foreground">
        <span className="font-bold text-secondary">Seeded:</span> The registry starts with 5
        deterministic runs. Data resets when the development server restarts.
      </p>
    </aside>
  );
}

// ─── Run Registry Panel ────────────────────────────────────────────────────────

interface RunRegistryPanelProps {
  state: StoreState;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

function RunRegistryPanel({ state, onDelete, onRefresh }: RunRegistryPanelProps) {
  const { loadState, runs, errorMessage } = state;

  return (
    <section aria-labelledby="registry-heading" className="stage-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="registry-heading" className="text-xl font-black tracking-tight text-card-foreground">
            Run Registry
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Live view of the in-memory test run store. Each row has a Delete button
            accessible by the run name.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loadState === 'loading'}
          aria-label="Refresh run list"
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-ring/60 disabled:opacity-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span aria-hidden="true">↺</span>
          Refresh
        </button>
      </div>

      {loadState === 'loading' && (
        <div role="status" aria-label="Loading runs" className="py-8 text-center">
          <span
            aria-hidden="true"
            className="inline-block size-5 animate-spin rounded-full border-2 border-secondary border-t-transparent"
          />
          <p className="mt-3 text-sm text-muted-foreground">Loading runs…</p>
        </div>
      )}

      {loadState === 'error' && (
        <div role="alert" className="rounded-2xl border border-danger/30 bg-danger/8 px-5 py-4">
          <p className="text-sm font-bold text-danger">Failed to load runs</p>
          <p className="mt-1 text-sm text-muted-foreground">{errorMessage}</p>
        </div>
      )}

      {loadState === 'success' && runs.length === 0 && (
        <p role="status" aria-label="No runs in registry" className="py-8 text-center text-sm text-muted-foreground">
          No runs in the registry. Add one below.
        </p>
      )}

      {loadState === 'success' && runs.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table aria-label="Test run registry" className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {['ID', 'Name', 'Status', 'Duration', 'Created', 'Action'].map((col) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-muted-foreground"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {runs.map((run) => (
                <RunRow key={run.id} run={run} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

interface RunRowProps {
  run: TestRun;
  onDelete: (id: string) => void;
}

function RunRow({ run, onDelete }: RunRowProps) {
  return (
    <tr className="bg-card transition hover:bg-muted/20">
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{run.id}</td>
      <td className="px-4 py-3 font-medium text-card-foreground">{run.name}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[run.status]}`}
        >
          {STATUS_LABELS[run.status]}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        {run.durationMs !== null ? `${String(run.durationMs)} ms` : '—'}
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        {run.createdAt.slice(0, 10)}
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => onDelete(run.id)}
          aria-label={`Delete ${run.name}`}
          className="rounded-full border border-danger/40 px-3 py-1 text-xs font-bold text-danger transition hover:bg-danger/10 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

// ─── Add Run Panel ─────────────────────────────────────────────────────────────

interface AddRunPanelProps {
  onAdd: (name: string, status: RunStatus) => void;
}

function AddRunPanel({ onAdd }: AddRunPanelProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<RunStatus>('pending');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await onAdd(name.trim(), status);
    setName('');
    setStatus('pending');
    setSubmitting(false);
  }

  return (
    <section aria-labelledby="add-run-heading" className="stage-card p-6 space-y-5">
      <div>
        <h2 id="add-run-heading" className="text-xl font-black tracking-tight text-card-foreground">
          Add Run
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Creates a run via{' '}
          <code className="rounded bg-muted px-1 text-xs font-mono">POST /api/practice/runs</code>.
          The same endpoint is available to the{' '}
          <code className="rounded bg-muted px-1 text-xs font-mono">request</code> fixture in your
          own test project.
        </p>
      </div>

      <form onSubmit={handleSubmit} aria-label="Add test run" className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-48 space-y-1.5">
          <label htmlFor="run-name" className="block text-xs font-bold text-card-foreground">
            Name
          </label>
          <input
            id="run-name"
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Checkout smoke test"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="run-status" className="block text-xs font-bold text-card-foreground">
            Status
          </label>
          <select
            id="run-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as RunStatus)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-card-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          >
            {VALID_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          {submitting ? 'Adding…' : 'Add run'}
        </button>
      </form>
    </section>
  );
}

// ─── API Reference Panel ───────────────────────────────────────────────────────

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/practice/runs', description: 'List all runs' },
  { method: 'POST', path: '/api/practice/runs', description: 'Create a run' },
  { method: 'GET', path: '/api/practice/runs/{id}', description: 'Get a single run' },
  { method: 'DELETE', path: '/api/practice/runs/{id}', description: 'Delete a run' },
] as const;

const METHOD_COLORS: Record<string, string> = {
  GET: 'border-success/40 bg-success/10 text-success',
  POST: 'border-secondary/40 bg-secondary/10 text-secondary',
  DELETE: 'border-danger/40 bg-danger/10 text-danger',
};

function ApiReferencePanel() {
  return (
    <aside aria-labelledby="api-ref-heading" className="stage-card p-6 space-y-5">
      <div>
        <h2 id="api-ref-heading" className="text-xl font-black tracking-tight text-card-foreground">
          API Reference
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Use these endpoints directly in your own Playwright test with the{' '}
          <code className="rounded bg-muted px-1 text-xs font-mono">request</code> fixture.
        </p>
      </div>

      <ul aria-label="Available API endpoints" className="space-y-2">
        {API_ENDPOINTS.map(({ method, path, description }) => (
          <li
            key={`${method}-${path}`}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background/55 px-4 py-3"
          >
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-black ${METHOD_COLORS[method] ?? ''}`}
            >
              {method}
            </span>
            <code className="font-mono text-sm text-card-foreground">{path}</code>
            <span className="text-xs text-muted-foreground">{description}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
