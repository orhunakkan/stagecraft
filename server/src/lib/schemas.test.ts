import { describe, expect, test } from 'vitest';
import { ZodError } from 'zod';
import { firstIssueMessage } from './schemas';

describe('firstIssueMessage', () => {
  test('returns the fallback when a Zod error has no issues', () => {
    expect(firstIssueMessage(new ZodError([]), 'Fallback message')).toBe('Fallback message');
  });
});
