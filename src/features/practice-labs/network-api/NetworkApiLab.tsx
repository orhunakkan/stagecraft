'use client';

import { useCallback, useEffect, useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type SupportTicket,
  type TicketStatus,
  type TicketPriority,
} from './network-fixtures';

const CHALLENGE_ID = 'network-api';
const API_URL = '/api/practice/network/items';

const OBJECTIVE =
  'Connect visible UI outcomes with deterministic network activity while keeping tests independent from external services.';

// ─── Status and priority colour tokens ────────────────────────────────────────

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: 'border-danger/40 bg-danger/10 text-danger',
  'in-progress': 'border-secondary/40 bg-secondary/10 text-secondary',
  resolved: 'border-success/40 bg-success/10 text-success',
  closed: 'border-border bg-muted/30 text-muted-foreground',
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  critical: 'border-danger/40 bg-danger/8 text-danger',
  high: 'border-warning/40 bg-warning/8 text-warning-foreground',
  medium: 'border-secondary/40 bg-secondary/8 text-secondary',
  low: 'border-border bg-muted/20 text-muted-foreground',
};

// ─── Fetch state ────────────────────────────────────────────────────────────────

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface FetchState {
  status: FetchStatus;
  tickets: SupportTicket[];
  fetchedAt: string;
  errorMessage: string;
}

function initialFetchState(): FetchState {
  return { status: 'idle', tickets: [], fetchedAt: '', errorMessage: '' };
}

// ─── Top-level lab component ───────────────────────────────────────────────────

export function NetworkApiLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Network API Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <NetworkApiContent key={resetKey} />
    </PracticeLabLayout>
  );
}

// ─── Content — remounted on reset ─────────────────────────────────────────────

function NetworkApiContent() {
  const [state, setState] = useState<FetchState>(initialFetchState);

  const fetchTickets = useCallback(async (scenario?: 'error') => {
    setState((prev) => ({ ...prev, status: 'loading' }));
    try {
      const url = scenario === 'error' ? `${API_URL}?scenario=error` : API_URL;
      const response = await fetch(url);

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? `Request failed with status ${String(response.status)}`);
      }

      const data = (await response.json()) as { items: SupportTicket[]; fetchedAt: string };
      setState({ status: 'success', tickets: data.items, fetchedAt: data.fetchedAt, errorMessage: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setState((prev) => ({ ...prev, status: 'error', errorMessage: message }));
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <ControlPanel
        status={state.status}
        onRefresh={() => void fetchTickets()}
        onSimulateError={() => void fetchTickets('error')}
      />

      {/* Status / data area */}
      {state.status === 'idle' && (
        <p role="status" className="text-sm text-muted-foreground">
          Waiting for initial load…
        </p>
      )}

      {state.status === 'loading' && <LoadingPanel />}

      {state.status === 'error' && (
        <ErrorPanel
          message={state.errorMessage}
          onRetry={() => void fetchTickets()}
        />
      )}

      {state.status === 'success' && (
        <TicketDashboard tickets={state.tickets} fetchedAt={state.fetchedAt} />
      )}
    </div>
  );
}

// ─── Control panel ─────────────────────────────────────────────────────────────

interface ControlPanelProps {
  status: FetchStatus;
  onRefresh: () => void;
  onSimulateError: () => void;
}

function ControlPanel({ status, onRefresh, onSimulateError }: ControlPanelProps) {
  const busy = status === 'loading';

  return (
    <div className="stage-card flex flex-wrap items-center gap-3 p-5">
      <p className="mr-auto text-sm font-bold text-card-foreground">Ticket dashboard controls</p>

      <button
        type="button"
        onClick={onRefresh}
        disabled={busy}
        aria-label="Refresh ticket list"
        className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition enabled:hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span aria-hidden="true">↻</span>
        Refresh ticket list
      </button>

      <button
        type="button"
        onClick={onSimulateError}
        disabled={busy}
        aria-label="Simulate error response"
        className="inline-flex items-center gap-2 rounded-full border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-bold text-danger transition enabled:hover:bg-danger/20 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span aria-hidden="true">⚠</span>
        Simulate error response
      </button>
    </div>
  );
}

// ─── Loading panel ─────────────────────────────────────────────────────────────

function LoadingPanel() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading ticket data…"
      className="stage-card flex items-center gap-3 p-6"
    >
      <span
        aria-hidden="true"
        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent"
      />
      <p className="text-sm font-semibold text-secondary">Loading ticket data…</p>
    </div>
  );
}

// ─── Error panel ───────────────────────────────────────────────────────────────

interface ErrorPanelProps {
  message: string;
  onRetry: () => void;
}

function ErrorPanel({ message, onRetry }: ErrorPanelProps) {
  return (
    <div
      role="alert"
      className="stage-card space-y-4 border-danger/30 bg-danger/8 p-6"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-lg text-danger">✗</span>
        <p className="text-sm font-bold text-danger">Failed to load ticket data</p>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        aria-label="Retry loading ticket data"
        className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Retry
      </button>
    </div>
  );
}

// ─── Ticket dashboard ──────────────────────────────────────────────────────────

interface TicketDashboardProps {
  tickets: SupportTicket[];
  fetchedAt: string;
}

function TicketDashboard({ tickets, fetchedAt }: TicketDashboardProps) {
  const formattedTime = new Date(fetchedAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="space-y-4">
      {/* Meta row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-card-foreground">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </p>
        <p
          aria-live="polite"
          className="text-xs font-semibold text-muted-foreground"
          data-testid="fetched-at"
        >
          Last fetched: {formattedTime}
        </p>
      </div>

      {/* Table */}
      <div className="stage-card overflow-x-auto">
        <table className="w-full text-sm" aria-label="Support tickets">
          <thead className="border-b border-border">
            <tr>
              {['ID', 'Title', 'Status', 'Priority', 'Category', 'Assignee'].map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-card-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                aria-label={ticket.title}
                className="transition hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-mono text-xs font-bold text-muted-foreground">
                  {ticket.id}
                </td>
                <td className="px-4 py-3 font-semibold text-card-foreground">
                  {ticket.title}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[ticket.status]}`}
                  >
                    {STATUS_LABELS[ticket.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${PRIORITY_COLORS[ticket.priority]}`}
                  >
                    {PRIORITY_LABELS[ticket.priority]}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{ticket.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{ticket.assignee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
