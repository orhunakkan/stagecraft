import { describe, expect, it } from 'vitest';

import { challenges } from './challenge-data';
import { getChallengeById } from './challenge-lookup';

describe('getChallengeById', () => {
  it('returns the matching challenge when the id exists', () => {
    const result = getChallengeById('accessible-locators', challenges);

    expect(result).toBeDefined();
    expect(result?.id).toBe('accessible-locators');
    expect(result?.title).toBe('Accessible Locators Lab');
  });

  it('returns undefined for an unknown id', () => {
    expect(getChallengeById('does-not-exist', challenges)).toBeUndefined();
  });

  it('returns undefined for an empty string id', () => {
    expect(getChallengeById('', challenges)).toBeUndefined();
  });

  it('returns undefined when the challenge list is empty', () => {
    expect(getChallengeById('accessible-locators', [])).toBeUndefined();
  });

  it('is case-sensitive — does not match a differently-cased id', () => {
    expect(getChallengeById('Accessible-Locators', challenges)).toBeUndefined();
  });

  it('returns each known challenge by id', () => {
    const expectedIds = [
      'accessible-locators',
      'forms-validation',
      'tables-filtering',
      'async-ui',
      'network-api',
      'fake-auth-session',
    ];

    for (const id of expectedIds) {
      expect(getChallengeById(id, challenges)?.id).toBe(id);
    }
  });
});
