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
      filterChallenges(challenges, { search: 'network observation' }).map((challenge) => challenge.id),
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
      'Browser API mocking with page.addInitScript',
      'Browser events and multi-page flows',
      'Clock control and time manipulation',
      'Data-driven testing',
      'Debugging artifacts and reports',
      'Direct API requests with the request fixture',
      'Drag-and-drop with locator.dragTo',
      'Emulation and input interactions',
      'Form interactions and validation',
      'Frames and context isolation',
      'Lists, tables, and scoped assertions',
      'Mocking real-time communication',
      'Network observation and API mocking',
      'Page Object Model and test fixtures',
      'Session state and protected routes',
      'Structural accessibility tree snapshots',
      'Visual regression testing',
    ]);
  });
});
