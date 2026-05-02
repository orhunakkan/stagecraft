import { describe, expect, it } from 'vitest';

import { challenges } from './challenge-data';
import { findChallengeCopyViolations } from './challenge-copy-guard';

const allLearnerFacingCopy = challenges
  .flatMap((challenge) => [
    challenge.title,
    challenge.primaryConcept,
    challenge.summary,
    challenge.content.scenario,
    challenge.content.learningObjective,
    ...challenge.content.instructions,
    ...challenge.content.acceptanceCriteria,
    ...challenge.content.constraints,
    ...(challenge.content.hints ?? []),
    ...(challenge.content.conceptReferences ?? []),
  ])
  .join('\n');

describe('findChallengeCopyViolations', () => {
  it('allows conceptual challenge copy for the initial MVP challenge set', () => {
    expect(findChallengeCopyViolations(challenges)).toEqual([]);
  });

  it('flags complete Playwright test scripts in learner-facing copy', () => {
    const violations = findChallengeCopyViolations([
      {
        ...challenges[0],
        content: {
          ...challenges[0].content,
          hints: [
            "import { test, expect } from '@playwright/test'; test('solves it', async () => {})",
          ],
        },
      },
    ]);

    expect(violations).toContainEqual(
      expect.objectContaining({
        challengeId: challenges[0].id,
        field: 'content.hints[0]',
        rule: 'complete-playwright-script',
      }),
    );
  });

  it('flags copy-pasteable locator answers in learner-facing copy', () => {
    const violations = findChallengeCopyViolations([
      {
        ...challenges[0],
        content: {
          ...challenges[0].content,
          instructions: ["Use page.getByRole('button', { name: 'Start checkout' }) to continue."],
        },
      },
    ]);

    expect(violations).toContainEqual(
      expect.objectContaining({
        challengeId: challenges[0].id,
        field: 'content.instructions[0]',
        rule: 'copy-pasteable-locator',
      }),
    );
  });
});

describe('initial challenge copy', () => {
  it('includes all six MVP practice lab routes', () => {
    expect(challenges.map((challenge) => challenge.practice.route)).toEqual([
      '/practice/accessible-locators',
      '/practice/forms-validation',
      '/practice/tables-filtering',
      '/practice/async-ui',
      '/practice/network-api',
      '/practice/fake-auth',
    ]);
  });

  it('keeps official documentation references internal to the project', () => {
    expect(allLearnerFacingCopy).not.toMatch(/https?:\/\/|playwright\.dev/i);
  });
});
