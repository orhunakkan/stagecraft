/** localStorage key used to persist the fake learner session. */
export const SESSION_KEY = 'stagecraft_fake_session';

/**
 * Documented practice credentials.
 * These are intentionally non-sensitive training values — not real secrets.
 */
export const PRACTICE_CREDENTIALS = {
  username: 'learner',
  password: 'practice',
  displayName: 'Practice Learner',
} as const;

export interface FakeSession {
  username: string;
  displayName: string;
  signedInAt: string;
}

// ─── Validation ────────────────────────────────────────────────────────────────

/**
 * Returns true when the provided username and password match the documented
 * practice credentials. Comparison is case-sensitive and trim-insensitive for
 * the username only.
 */
export function validateCredentials(username: string, password: string): boolean {
  return (
    username.trim() === PRACTICE_CREDENTIALS.username &&
    password === PRACTICE_CREDENTIALS.password
  );
}

// ─── Session builders ──────────────────────────────────────────────────────────

/**
 * Builds a new fake session object for the given username.
 * `signedInAt` defaults to `new Date().toISOString()` but can be overridden for
 * deterministic tests.
 */
export function buildSession(
  username: string,
  signedInAt: string = new Date().toISOString(),
): FakeSession {
  return { username, displayName: PRACTICE_CREDENTIALS.displayName, signedInAt };
}

// ─── localStorage helpers ──────────────────────────────────────────────────────

/**
 * Reads the fake session from localStorage.
 * Returns null if no session is present or the stored value cannot be parsed.
 */
export function readSession(): FakeSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FakeSession;
  } catch {
    return null;
  }
}

/** Persists a fake session to localStorage. */
export function writeSession(session: FakeSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Removes the fake session from localStorage. */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
