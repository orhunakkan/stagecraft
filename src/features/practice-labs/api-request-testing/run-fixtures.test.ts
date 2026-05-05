import { beforeEach, describe, expect, it } from 'vitest';

import {
  createRun,
  deleteRun,
  getRun,
  getStore,
  resetStore,
  SEEDED_RUNS,
  validateCreateRunInput,
} from './run-fixtures';

beforeEach(() => {
  resetStore();
});

describe('getStore', () => {
  it('returns the seeded runs on a fresh store', () => {
    const { runs, seeded } = getStore();
    expect(seeded).toBe(true);
    expect(runs).toHaveLength(SEEDED_RUNS.length);
    expect(runs[0]).toMatchObject({ id: 'run-001', name: 'Homepage smoke test' });
  });

  it('returns a copy — mutations do not affect the store', () => {
    const { runs } = getStore();
    runs[0].name = 'mutated';
    expect(getStore().runs[0].name).toBe('Homepage smoke test');
  });
});

describe('createRun', () => {
  it('creates a run with the given name and status', () => {
    const run = createRun({ name: 'New test', status: 'pending' });
    expect(run.name).toBe('New test');
    expect(run.status).toBe('pending');
    expect(run.durationMs).toBeNull();
    expect(run.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('assigns sequential ids', () => {
    const first = createRun({ name: 'A', status: 'passed' });
    const second = createRun({ name: 'B', status: 'failed' });
    expect(first.id).toBe('run-006');
    expect(second.id).toBe('run-007');
  });

  it('stores the run so subsequent getStore() includes it', () => {
    const run = createRun({ name: 'Stored', status: 'skipped' });
    const { runs } = getStore();
    expect(runs.find((r) => r.id === run.id)).toBeDefined();
  });

  it('stores an optional durationMs value', () => {
    const run = createRun({ name: 'Timed', status: 'passed', durationMs: 1500 });
    expect(run.durationMs).toBe(1500);
  });

  it('sets seeded to false after a create', () => {
    createRun({ name: 'Any', status: 'passed' });
    expect(getStore().seeded).toBe(false);
  });
});

describe('deleteRun', () => {
  it('removes an existing run and returns true', () => {
    const deleted = deleteRun('run-001');
    expect(deleted).toBe(true);
    expect(getStore().runs.find((r) => r.id === 'run-001')).toBeUndefined();
  });

  it('returns false for a non-existent id', () => {
    expect(deleteRun('run-999')).toBe(false);
  });

  it('does not affect other runs', () => {
    deleteRun('run-001');
    expect(getStore().runs).toHaveLength(SEEDED_RUNS.length - 1);
    expect(getStore().runs[0].id).toBe('run-002');
  });
});

describe('getRun', () => {
  it('returns a matching run', () => {
    expect(getRun('run-003')).toMatchObject({ name: 'Cart total calculation' });
  });

  it('returns undefined for an unknown id', () => {
    expect(getRun('run-999')).toBeUndefined();
  });
});

describe('resetStore', () => {
  it('restores the original seed data after mutations', () => {
    createRun({ name: 'Extra', status: 'passed' });
    deleteRun('run-001');
    resetStore();
    const { runs, seeded } = getStore();
    expect(seeded).toBe(true);
    expect(runs).toHaveLength(SEEDED_RUNS.length);
    expect(runs[0].id).toBe('run-001');
  });

  it('resets the id counter so new runs start from run-006 again', () => {
    createRun({ name: 'A', status: 'passed' }); // run-006
    resetStore();
    const run = createRun({ name: 'B', status: 'passed' });
    expect(run.id).toBe('run-006');
  });
});

describe('validateCreateRunInput', () => {
  it('returns null for a valid input', () => {
    expect(validateCreateRunInput({ name: 'My test', status: 'passed' })).toBeNull();
  });

  it('rejects a missing name', () => {
    const err = validateCreateRunInput({ status: 'passed' });
    expect(err?.field).toBe('name');
  });

  it('rejects an empty name', () => {
    expect(validateCreateRunInput({ name: '   ', status: 'passed' })?.field).toBe('name');
  });

  it('rejects a name over 120 characters', () => {
    expect(
      validateCreateRunInput({ name: 'x'.repeat(121), status: 'passed' })?.field,
    ).toBe('name');
  });

  it('rejects an invalid status', () => {
    const err = validateCreateRunInput({ name: 'Test', status: 'unknown' });
    expect(err?.field).toBe('status');
  });

  it('rejects a non-object body', () => {
    expect(validateCreateRunInput(null)?.field).toBe('body');
    expect(validateCreateRunInput('string')?.field).toBe('body');
  });
});
