// ─── Types ─────────────────────────────────────────────────────────────────────

export type RunStatus = 'passed' | 'failed' | 'skipped' | 'pending';

export interface TestRun {
  id: string;
  name: string;
  status: RunStatus;
  durationMs: number | null;
  createdAt: string; // ISO 8601
}

export interface RunListResponse {
  runs: TestRun[];
  total: number;
  seeded: boolean;
}

export type CreateRunInput = {
  name: string;
  status: RunStatus;
  durationMs?: number | null;
};

export type ValidationError = {
  error: string;
  field: string;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

export const VALID_STATUSES: RunStatus[] = ['passed', 'failed', 'skipped', 'pending'];

export const STATUS_LABELS: Record<RunStatus, string> = {
  passed: 'Passed',
  failed: 'Failed',
  skipped: 'Skipped',
  pending: 'Pending',
};

/** Visual colour tokens (Tailwind class suffixes) for each status. */
export const STATUS_COLORS: Record<RunStatus, string> = {
  passed: 'border-success/40 bg-success/10 text-success',
  failed: 'border-danger/40 bg-danger/10 text-danger',
  skipped: 'border-border bg-muted/30 text-muted-foreground',
  pending: 'border-secondary/40 bg-secondary/10 text-secondary',
};

// ─── Seed data ─────────────────────────────────────────────────────────────────

export const SEEDED_RUNS: TestRun[] = [
  {
    id: 'run-001',
    name: 'Homepage smoke test',
    status: 'passed',
    durationMs: 1240,
    createdAt: '2025-04-28T09:00:00.000Z',
  },
  {
    id: 'run-002',
    name: 'Login form validation',
    status: 'passed',
    durationMs: 2880,
    createdAt: '2025-04-28T09:01:00.000Z',
  },
  {
    id: 'run-003',
    name: 'Cart total calculation',
    status: 'failed',
    durationMs: 3150,
    createdAt: '2025-04-28T09:02:00.000Z',
  },
  {
    id: 'run-004',
    name: 'File upload progress',
    status: 'skipped',
    durationMs: null,
    createdAt: '2025-04-28T09:03:00.000Z',
  },
  {
    id: 'run-005',
    name: 'Search results pagination',
    status: 'pending',
    durationMs: null,
    createdAt: '2025-04-28T09:04:00.000Z',
  },
];

// ─── In-memory store ───────────────────────────────────────────────────────────

let _runs: TestRun[] = SEEDED_RUNS.map((r) => ({ ...r }));
let _nextCounter = SEEDED_RUNS.length + 1;
let _seeded = true;

/** Returns a shallow copy of the current run list and seeded flag. */
export function getStore(): { runs: TestRun[]; seeded: boolean } {
  return { runs: _runs.map((r) => ({ ...r })), seeded: _seeded };
}

/** Creates a new run, appends it to the store, and returns it. */
export function createRun(input: CreateRunInput): TestRun {
  const run: TestRun = {
    id: `run-${String(_nextCounter++).padStart(3, '0')}`,
    name: input.name,
    status: input.status,
    durationMs: input.durationMs ?? null,
    createdAt: new Date().toISOString(),
  };
  _runs.push(run);
  _seeded = false;
  return run;
}

/**
 * Deletes a run by id.
 * @returns `true` if a run was removed, `false` if no run matched.
 */
export function deleteRun(id: string): boolean {
  const before = _runs.length;
  _runs = _runs.filter((r) => r.id !== id);
  return _runs.length < before;
}

/** Returns a single run by id, or `undefined` if not found. */
export function getRun(id: string): TestRun | undefined {
  return _runs.find((r) => r.id === id);
}

/**
 * Resets the store back to the initial seeded state.
 * Exposed for use in tests and the optional reset API endpoint.
 */
export function resetStore(): void {
  _runs = SEEDED_RUNS.map((r) => ({ ...r }));
  _nextCounter = SEEDED_RUNS.length + 1;
  _seeded = true;
}

// ─── Input validation ──────────────────────────────────────────────────────────

/** Returns a `ValidationError` if the input is invalid, or `null` if valid. */
export function validateCreateRunInput(
  input: unknown,
): ValidationError | null {
  if (typeof input !== 'object' || input === null) {
    return { error: 'Request body must be a JSON object.', field: 'body' };
  }

  const { name, status } = input as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim().length === 0) {
    return { error: 'name is required and must be a non-empty string.', field: 'name' };
  }
  if (name.length > 120) {
    return { error: 'name must be 120 characters or fewer.', field: 'name' };
  }
  if (!VALID_STATUSES.includes(status as RunStatus)) {
    return {
      error: `status must be one of: ${VALID_STATUSES.join(', ')}.`,
      field: 'status',
    };
  }

  return null;
}
