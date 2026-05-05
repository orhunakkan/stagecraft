import { describe, expect, it } from 'vitest';

import { formatClockDisplay, formatCountdown } from './clock-state';

describe('formatCountdown', () => {
  it('formats a full 5-minute duration', () => {
    expect(formatCountdown(5 * 60 * 1000)).toBe('5:00');
  });

  it('formats a sub-minute duration with leading zero on seconds', () => {
    expect(formatCountdown(59_000)).toBe('0:59');
  });

  it('formats exactly zero', () => {
    expect(formatCountdown(0)).toBe('0:00');
  });

  it('clamps negative values to 0:00', () => {
    expect(formatCountdown(-1000)).toBe('0:00');
  });

  it('formats a value in the middle of the countdown', () => {
    // 2 minutes and 30 seconds remaining
    expect(formatCountdown(2 * 60 * 1000 + 30 * 1000)).toBe('2:30');
  });

  it('pads single-digit seconds', () => {
    expect(formatCountdown(1 * 60 * 1000 + 5 * 1000)).toBe('1:05');
  });
});

describe('formatClockDisplay', () => {
  it('formats a UTC midnight date without cross-timezone offset', () => {
    // Use a fixed local-time-equivalent date to avoid timezone ambiguity.
    const date = new Date(2024, 1, 2, 10, 0, 0); // Feb 2, 2024 10:00:00 local
    expect(formatClockDisplay(date)).toBe('2024-02-02 10:00:00');
  });

  it('zero-pads month, day, hours, minutes, and seconds', () => {
    const date = new Date(2025, 0, 5, 9, 3, 7); // Jan 5, 2025 09:03:07 local
    expect(formatClockDisplay(date)).toBe('2025-01-05 09:03:07');
  });

  it('handles end-of-day time', () => {
    const date = new Date(2024, 11, 31, 23, 59, 59); // Dec 31, 2024 23:59:59
    expect(formatClockDisplay(date)).toBe('2024-12-31 23:59:59');
  });
});
