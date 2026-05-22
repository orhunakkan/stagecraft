import { describe, expect, test } from 'vitest';
import { assertOk, getErrorMessage, readJson } from '../../src/lib/api';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('getErrorMessage', () => {
  test('returns the message from Error objects', () => {
    expect(getErrorMessage(new Error('oops'))).toBe('oops');
  });

  test('returns a fallback for non-Error values', () => {
    expect(getErrorMessage('string error')).toBe('Unknown error');
    expect(getErrorMessage(null)).toBe('Unknown error');
  });
});

describe('assertOk', () => {
  test('does not throw for ok responses', () => {
    expect(() => assertOk(jsonResponse({ ok: true }))).not.toThrow();
  });

  test('throws for non-ok responses', () => {
    expect(() => assertOk(jsonResponse({ error: 'missing' }, 404))).toThrow('HTTP 404');
  });
});

describe('readJson', () => {
  test('parses the JSON body from ok responses', async () => {
    await expect(readJson<{ ok: boolean }>(jsonResponse({ ok: true }))).resolves.toEqual({
      ok: true,
    });
  });

  test('rejects when the response is not ok', async () => {
    await expect(readJson(jsonResponse({ error: 'missing' }, 404))).rejects.toThrow('HTTP 404');
  });
});
