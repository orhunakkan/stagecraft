import { describe, expect, it } from 'vitest';

import {
  formatCoordinate,
  formatEffectiveType,
  geolocationErrorMessage,
} from './browser-api-state';

describe('formatCoordinate', () => {
  it('formats a positive coordinate to 6 decimal places', () => {
    expect(formatCoordinate(51.507351)).toBe('51.507351');
  });

  it('formats a negative coordinate to 6 decimal places', () => {
    expect(formatCoordinate(-0.127758)).toBe('-0.127758');
  });

  it('pads an integer coordinate with trailing zeros', () => {
    expect(formatCoordinate(0)).toBe('0.000000');
  });
});

describe('formatEffectiveType', () => {
  it('returns the type string when provided', () => {
    expect(formatEffectiveType('4g')).toBe('4g');
    expect(formatEffectiveType('3g')).toBe('3g');
  });

  it('returns "unknown" when type is null', () => {
    expect(formatEffectiveType(null)).toBe('unknown');
  });
});

describe('geolocationErrorMessage', () => {
  it('returns a permission-denied message for code 1', () => {
    expect(geolocationErrorMessage(1)).toContain('Permission denied');
  });

  it('returns a position-unavailable message for code 2', () => {
    expect(geolocationErrorMessage(2)).toContain('unavailable');
  });

  it('returns a timeout message for code 3', () => {
    expect(geolocationErrorMessage(3)).toContain('timed out');
  });

  it('returns a generic message for an unrecognised code', () => {
    expect(geolocationErrorMessage(99)).toContain('unknown');
  });
});
