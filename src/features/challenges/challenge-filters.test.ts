import { describe, expect, it } from 'vitest';

import { challenges } from './challenge-data';
import { filterChallenges, getChallengeConceptOptions } from './challenge-filters';

describe('filterChallenges', () => {
  it('returns all challenges when no filters are active', () => {
    expect(filterChallenges(challenges, {})).toEqual(challenges);
  });

  it('searches by title, primary concept, and tags', () => {
    expect(
      filterChallenges(challenges, { search: 'forms' }).map((challenge) => challenge.id),
    ).toEqual(['forms-validation']);
    expect(
      filterChallenges(challenges, { search: 'mocking' }).map((challenge) => challenge.id),
    ).toEqual(['network-api']);
    expect(
      filterChallenges(challenges, { search: 'auth' }).map((challenge) => challenge.id),
    ).toEqual(['fake-auth-session']);
    expect(
      filterChallenges(challenges, { search: 'reporting' }).map((challenge) => challenge.id),
    ).toEqual(['debugging-reporting']);
  });

  it('filters by difficulty and concept together', () => {
    const result = filterChallenges(challenges, {
      difficulty: 'intermediate',
      concept: 'Network observation and API mocking',
    });

    expect(result.map((challenge) => challenge.id)).toEqual(['network-api']);
  });

  it('returns an empty list when no challenge matches', () => {
    expect(filterChallenges(challenges, { search: 'visual snapshots' })).toEqual([]);
  });
});

describe('getChallengeConceptOptions', () => {
  it('returns sorted unique primary concepts', () => {
    expect(getChallengeConceptOptions(challenges)).toEqual([
      'Accessible locators',
      'Auto-waiting and async assertions',
      'Browser events and multi-page flows',
      'Debugging artifacts and reports',
      'Emulation and input interactions',
      'Form interactions and validation',
      'Frames and context isolation',
      'Lists, tables, and scoped assertions',
      'Network observation and API mocking',
      'Session state and protected routes',
    ]);
  });
});
