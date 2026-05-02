/**
 * Minimal in-memory notification bus for same-tab progress changes.
 *
 * useSyncExternalStore subscribes via this module so it re-reads localStorage
 * whenever setChallengeProgress or resetAllProgress is called in the same tab.
 * Cross-tab changes are picked up through the standard `storage` window event.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeToProgressStore(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function notifyProgressStore(): void {
  for (const listener of listeners) {
    listener();
  }
}
