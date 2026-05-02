import type { Challenge } from './challenge-types';

export type ChallengeCopyGuardRule = 'complete-playwright-script' | 'copy-pasteable-locator';

export interface ChallengeCopyViolation {
  challengeId: string;
  field: string;
  rule: ChallengeCopyGuardRule;
  excerpt: string;
}

const completeScriptPatterns = [
  /import\s+\{?[^\n;]*\b(?:test|expect)\b[^\n;]*\}?\s+from\s+['"]@playwright\/test['"]/i,
  /\btest(?:\.describe)?\s*\(/i,
  /\bawait\s+expect\s*\(/i,
];

const copyPasteableLocatorPatterns = [
  /\b(?:page|locator|frame)\.(?:getByRole|getByText|getByLabel|getByPlaceholder|getByAltText|getByTitle|getByTestId|locator)\s*\(/i,
  /\b(?:getByRole|getByText|getByLabel|getByPlaceholder|getByAltText|getByTitle|getByTestId)\s*\(/i,
  /\bawait\s+(?:page|locator|frame)\.[a-zA-Z]+\s*\(/i,
];

export function findChallengeCopyViolations(
  challenges: readonly Challenge[],
): ChallengeCopyViolation[] {
  return challenges.flatMap((challenge) =>
    getLearnerFacingCopyEntries(challenge).flatMap(({ field, value }) =>
      findViolationsInValue(challenge.id, field, value),
    ),
  );
}

function findViolationsInValue(
  challengeId: string,
  field: string,
  value: string,
): ChallengeCopyViolation[] {
  const violations: ChallengeCopyViolation[] = [];

  if (completeScriptPatterns.some((pattern) => pattern.test(value))) {
    violations.push({
      challengeId,
      field,
      rule: 'complete-playwright-script',
      excerpt: createExcerpt(value),
    });
  }

  if (copyPasteableLocatorPatterns.some((pattern) => pattern.test(value))) {
    violations.push({
      challengeId,
      field,
      rule: 'copy-pasteable-locator',
      excerpt: createExcerpt(value),
    });
  }

  return violations;
}

function getLearnerFacingCopyEntries(challenge: Challenge): { field: string; value: string }[] {
  return [
    { field: 'title', value: challenge.title },
    { field: 'primaryConcept', value: challenge.primaryConcept },
    { field: 'summary', value: challenge.summary },
    { field: 'content.scenario', value: challenge.content.scenario },
    { field: 'content.learningObjective', value: challenge.content.learningObjective },
    ...toIndexedEntries('content.instructions', challenge.content.instructions),
    ...toIndexedEntries('content.acceptanceCriteria', challenge.content.acceptanceCriteria),
    ...toIndexedEntries('content.constraints', challenge.content.constraints),
    ...toIndexedEntries('content.hints', challenge.content.hints ?? []),
    ...toIndexedEntries('content.conceptReferences', challenge.content.conceptReferences ?? []),
  ];
}

function toIndexedEntries(
  field: string,
  values: readonly string[],
): { field: string; value: string }[] {
  return values.map((value, index) => ({ field: `${field}[${index}]`, value }));
}

function createExcerpt(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 120 ? `${normalized.slice(0, 117)}...` : normalized;
}
