import type { ChallengeStatus } from './progress-types';

export const progressStorageKey = 'stagecraft:progress';

type ProgressMap = Record<string, ChallengeStatus>;

type StorageInterface = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function readProgressMap(storage: StorageInterface): ProgressMap {
  try {
    const raw = storage.getItem(progressStorageKey);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return parsed as ProgressMap;
  } catch {
    return {};
  }
}

function writeProgressMap(storage: StorageInterface, map: ProgressMap): void {
  try {
    storage.setItem(progressStorageKey, JSON.stringify(map));
  } catch {
    // Progress persistence is progressive enhancement; the UI still works without storage.
  }
}

/**
 * Returns the progress status for the given challenge id.
 * Defaults to 'notStarted' when no entry is found.
 */
export function getChallengeProgress(storage: StorageInterface, id: string): ChallengeStatus {
  return readProgressMap(storage)[id] ?? 'notStarted';
}

/**
 * Persists the progress status for the given challenge id.
 * Setting status to 'notStarted' removes the entry to keep storage lean.
 */
export function setChallengeProgress(
  storage: StorageInterface,
  id: string,
  status: ChallengeStatus,
): void {
  const map = readProgressMap(storage);
  if (status === 'notStarted') {
    delete map[id];
  } else {
    map[id] = status;
  }
  writeProgressMap(storage, map);
}

/**
 * Returns all stored progress entries as a plain object.
 */
export function getAllProgress(storage: StorageInterface): ProgressMap {
  return readProgressMap(storage);
}

/**
 * Removes all stored progress.
 */
export function resetAllProgress(storage: StorageInterface): void {
  try {
    storage.removeItem(progressStorageKey);
  } catch {
    // Ignore — storage may be unavailable.
  }
}
