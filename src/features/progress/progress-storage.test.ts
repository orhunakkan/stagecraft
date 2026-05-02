import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  getAllProgress,
  getChallengeProgress,
  progressStorageKey,
  resetAllProgress,
  setChallengeProgress,
} from './progress-storage';

// Use a fresh in-memory fake storage for each test so tests stay isolated.
function makeFakeStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key: (index: number) => [...store.keys()][index] ?? null,
  };
}

describe('getChallengeProgress', () => {
  it('returns notStarted when no progress has been recorded', () => {
    const storage = makeFakeStorage();
    expect(getChallengeProgress(storage, 'accessible-locators')).toBe('notStarted');
  });

  it('returns the stored status for a known challenge', () => {
    const storage = makeFakeStorage();
    setChallengeProgress(storage, 'accessible-locators', 'inProgress');
    expect(getChallengeProgress(storage, 'accessible-locators')).toBe('inProgress');
  });

  it('returns notStarted for an unknown challenge even when other progress exists', () => {
    const storage = makeFakeStorage();
    setChallengeProgress(storage, 'forms-validation', 'completed');
    expect(getChallengeProgress(storage, 'accessible-locators')).toBe('notStarted');
  });
});

describe('setChallengeProgress', () => {
  it('stores each status value correctly', () => {
    const storage = makeFakeStorage();

    for (const status of ['notStarted', 'inProgress', 'practiced', 'completed'] as const) {
      setChallengeProgress(storage, 'async-ui', status);
      expect(getChallengeProgress(storage, 'async-ui')).toBe(status);
    }
  });

  it('preserves progress for other challenges when updating one', () => {
    const storage = makeFakeStorage();
    setChallengeProgress(storage, 'forms-validation', 'practiced');
    setChallengeProgress(storage, 'network-api', 'completed');

    expect(getChallengeProgress(storage, 'forms-validation')).toBe('practiced');
    expect(getChallengeProgress(storage, 'network-api')).toBe('completed');
  });

  it('removes the entry when status is set back to notStarted', () => {
    const storage = makeFakeStorage();
    setChallengeProgress(storage, 'async-ui', 'inProgress');
    setChallengeProgress(storage, 'async-ui', 'notStarted');

    const all = getAllProgress(storage);
    expect('async-ui' in all).toBe(false);
    expect(getChallengeProgress(storage, 'async-ui')).toBe('notStarted');
  });
});

describe('getAllProgress', () => {
  it('returns an empty object when no progress has been recorded', () => {
    const storage = makeFakeStorage();
    expect(getAllProgress(storage)).toEqual({});
  });

  it('returns all stored challenge progress entries', () => {
    const storage = makeFakeStorage();
    setChallengeProgress(storage, 'accessible-locators', 'completed');
    setChallengeProgress(storage, 'forms-validation', 'practiced');

    expect(getAllProgress(storage)).toEqual({
      'accessible-locators': 'completed',
      'forms-validation': 'practiced',
    });
  });
});

describe('resetAllProgress', () => {
  it('removes all stored progress', () => {
    const storage = makeFakeStorage();
    setChallengeProgress(storage, 'accessible-locators', 'completed');
    setChallengeProgress(storage, 'tables-filtering', 'inProgress');

    resetAllProgress(storage);

    expect(getAllProgress(storage)).toEqual({});
    expect(getChallengeProgress(storage, 'accessible-locators')).toBe('notStarted');
  });

  it('does not throw when storage is already empty', () => {
    const storage = makeFakeStorage();
    expect(() => resetAllProgress(storage)).not.toThrow();
  });
});

describe('storage resilience', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = makeFakeStorage();
  });

  afterEach(() => {
    storage.clear();
  });

  it('returns notStarted when stored JSON is malformed', () => {
    storage.setItem(progressStorageKey, '{ not valid json !!');
    expect(getChallengeProgress(storage, 'any-id')).toBe('notStarted');
  });

  it('returns notStarted when stored value is not an object', () => {
    storage.setItem(progressStorageKey, '"just a string"');
    expect(getChallengeProgress(storage, 'any-id')).toBe('notStarted');
  });

  it('returns notStarted when stored value is an array', () => {
    storage.setItem(progressStorageKey, '[]');
    expect(getChallengeProgress(storage, 'any-id')).toBe('notStarted');
  });
});
