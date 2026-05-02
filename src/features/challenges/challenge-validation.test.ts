import { describe, expect, it } from 'vitest';

import { challenges } from './challenge-data';
import type { Challenge } from './challenge-types';
import { validateChallenges } from './challenge-validation';

function createChallenge(overrides: Partial<Challenge> = {}): Challenge {
  return {
    id: 'accessible-locators',
    title: 'Accessible Locators Lab',
    difficulty: 'beginner',
    estimatedMinutes: 20,
    primaryConcept: 'Accessible locators',
    summary: 'Practice finding controls by user-facing semantics.',
    tags: ['locators', 'accessibility'],
    practice: {
      labId: 'accessible-locators',
      title: 'Accessible Locators Lab',
      route: '/practice/accessible-locators',
    },
    content: {
      scenario: 'A product team needs stable checks for a semantic page.',
      learningObjective: 'Identify user-visible signals that make locators resilient.',
      instructions: ['Inspect the page structure.', 'Write tests around observable behavior.'],
      acceptanceCriteria: ['The main call to action can be found by role and name.'],
      constraints: ['Do not depend on generated class names.'],
      hints: ['Think about how a screen reader would describe each control.'],
      conceptReferences: ['Role-based locators', 'Accessible names'],
    },
    ...overrides,
  };
}

describe('validateChallenges', () => {
  it('accepts the initial documentation-backed challenge metadata', () => {
    const result = validateChallenges(challenges);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('accepts a complete challenge model required by the spec', () => {
    const result = validateChallenges([createChallenge()]);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reports missing challenge IDs', () => {
    const result = validateChallenges([createChallenge({ id: '' })]);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      challengeId: '<missing-id>',
      field: 'id',
      message: 'Challenge id is required.',
    });
  });

  it('reports duplicate challenge IDs', () => {
    const result = validateChallenges([createChallenge(), createChallenge()]);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      challengeId: 'accessible-locators',
      field: 'id',
      message: 'Challenge id must be unique.',
    });
  });

  it('reports invalid practice routes', () => {
    const result = validateChallenges([
      createChallenge({
        practice: { labId: 'bad-route', title: 'Bad Route', route: 'practice/bad' },
      }),
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      challengeId: 'accessible-locators',
      field: 'practice.route',
      message: 'Practice route must start with /practice/.',
    });
  });

  it('reports empty learner-facing instructions', () => {
    const result = validateChallenges([
      createChallenge({ content: { ...createChallenge().content, instructions: [] } }),
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      challengeId: 'accessible-locators',
      field: 'content.instructions',
      message: 'At least one instruction is required.',
    });
  });

  it('reports blank required learner-facing copy', () => {
    const result = validateChallenges([
      createChallenge({ content: { ...createChallenge().content, learningObjective: '   ' } }),
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual({
      challengeId: 'accessible-locators',
      field: 'content.learningObjective',
      message: 'Learning objective is required.',
    });
  });
});
