import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  buildSession,
  clearSession,
  PRACTICE_CREDENTIALS,
  readSession,
  SESSION_KEY,
  validateCredentials,
  writeSession,
} from './fake-session';

const VALID_SIGNED_IN_AT = '2025-01-01T12:00:00.000Z';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('validateCredentials', () => {
  it('returns true for the documented practice credentials', () => {
    expect(
      validateCredentials(PRACTICE_CREDENTIALS.username, PRACTICE_CREDENTIALS.password),
    ).toBe(true);
  });

  it('returns false for a wrong password', () => {
    expect(validateCredentials(PRACTICE_CREDENTIALS.username, 'wrong')).toBe(false);
  });

  it('returns false for a wrong username', () => {
    expect(validateCredentials('admin', PRACTICE_CREDENTIALS.password)).toBe(false);
  });

  it('returns false when both fields are empty', () => {
    expect(validateCredentials('', '')).toBe(false);
  });

  it('trims leading and trailing whitespace from the username', () => {
    expect(
      validateCredentials(`  ${PRACTICE_CREDENTIALS.username}  `, PRACTICE_CREDENTIALS.password),
    ).toBe(true);
  });

  it('does not trim the password', () => {
    expect(
      validateCredentials(PRACTICE_CREDENTIALS.username, ` ${PRACTICE_CREDENTIALS.password}`),
    ).toBe(false);
  });
});

describe('buildSession', () => {
  it('returns a session with the provided username and displayName', () => {
    const session = buildSession(PRACTICE_CREDENTIALS.username, VALID_SIGNED_IN_AT);
    expect(session.username).toBe(PRACTICE_CREDENTIALS.username);
    expect(session.displayName).toBe(PRACTICE_CREDENTIALS.displayName);
    expect(session.signedInAt).toBe(VALID_SIGNED_IN_AT);
  });

  it('uses the current time when no signedInAt is provided', () => {
    const before = Date.now();
    const session = buildSession(PRACTICE_CREDENTIALS.username);
    const after = Date.now();
    const signedInMs = new Date(session.signedInAt).getTime();
    expect(signedInMs).toBeGreaterThanOrEqual(before);
    expect(signedInMs).toBeLessThanOrEqual(after);
  });
});

describe('readSession', () => {
  it('returns null when localStorage has no session key', () => {
    expect(readSession()).toBeNull();
  });

  it('returns null when the stored value is invalid JSON', () => {
    localStorage.setItem(SESSION_KEY, 'not-json');
    expect(readSession()).toBeNull();
  });

  it('returns the parsed session when it was previously written', () => {
    const session = buildSession(PRACTICE_CREDENTIALS.username, VALID_SIGNED_IN_AT);
    writeSession(session);
    expect(readSession()).toEqual(session);
  });
});

describe('writeSession', () => {
  it('stores the session so that readSession can retrieve it', () => {
    const session = buildSession(PRACTICE_CREDENTIALS.username, VALID_SIGNED_IN_AT);
    writeSession(session);
    expect(localStorage.getItem(SESSION_KEY)).not.toBeNull();
    expect(readSession()).toEqual(session);
  });
});

describe('clearSession', () => {
  it('removes the session key from localStorage', () => {
    const session = buildSession(PRACTICE_CREDENTIALS.username, VALID_SIGNED_IN_AT);
    writeSession(session);
    clearSession();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('does not throw when there is no session to clear', () => {
    expect(() => clearSession()).not.toThrow();
  });
});
