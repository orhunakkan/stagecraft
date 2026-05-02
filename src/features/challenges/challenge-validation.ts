import { challengeDifficulties, challengeTags, type Challenge } from './challenge-types';

export interface ChallengeValidationError {
  challengeId: string;
  field: string;
  message: string;
}

export interface ChallengeValidationResult {
  valid: boolean;
  errors: ChallengeValidationError[];
}

const difficultySet = new Set<string>(challengeDifficulties);
const tagSet = new Set<string>(challengeTags);

export function validateChallenges(challenges: readonly Challenge[]): ChallengeValidationResult {
  const errors: ChallengeValidationError[] = [];
  const seenIds = new Set<string>();

  for (const challenge of challenges) {
    const challengeId = getChallengeIdForError(challenge);

    validateRequiredText(errors, challengeId, 'id', challenge.id, 'Challenge id is required.');

    if (challenge.id.trim()) {
      if (seenIds.has(challenge.id)) {
        addError(errors, challenge.id, 'id', 'Challenge id must be unique.');
      }
      seenIds.add(challenge.id);
    }

    validateRequiredText(errors, challengeId, 'title', challenge.title, 'Title is required.');
    validateRequiredText(
      errors,
      challengeId,
      'primaryConcept',
      challenge.primaryConcept,
      'Primary concept is required.',
    );
    validateRequiredText(errors, challengeId, 'summary', challenge.summary, 'Summary is required.');
    validatePositiveInteger(
      errors,
      challengeId,
      'estimatedMinutes',
      challenge.estimatedMinutes,
      'Estimated minutes must be a positive integer.',
    );

    if (!difficultySet.has(challenge.difficulty)) {
      addError(
        errors,
        challengeId,
        'difficulty',
        'Difficulty must be beginner, intermediate, or advanced.',
      );
    }

    validateNonEmptyList(
      errors,
      challengeId,
      'tags',
      challenge.tags,
      'At least one tag is required.',
    );
    for (const tag of challenge.tags) {
      if (!tagSet.has(tag)) {
        addError(errors, challengeId, 'tags', `Unsupported tag: ${tag}.`);
      }
    }

    validatePractice(errors, challengeId, challenge);
    validateContent(errors, challengeId, challenge);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validatePractice(
  errors: ChallengeValidationError[],
  challengeId: string,
  challenge: Challenge,
): void {
  validateRequiredText(
    errors,
    challengeId,
    'practice.labId',
    challenge.practice.labId,
    'Practice lab id is required.',
  );
  validateRequiredText(
    errors,
    challengeId,
    'practice.title',
    challenge.practice.title,
    'Practice title is required.',
  );

  if (!challenge.practice.route.startsWith('/practice/')) {
    addError(errors, challengeId, 'practice.route', 'Practice route must start with /practice/.');
  }
}

function validateContent(
  errors: ChallengeValidationError[],
  challengeId: string,
  challenge: Challenge,
): void {
  validateRequiredText(
    errors,
    challengeId,
    'content.scenario',
    challenge.content.scenario,
    'Scenario is required.',
  );
  validateRequiredText(
    errors,
    challengeId,
    'content.learningObjective',
    challenge.content.learningObjective,
    'Learning objective is required.',
  );
  validateNonEmptyList(
    errors,
    challengeId,
    'content.instructions',
    challenge.content.instructions,
    'At least one instruction is required.',
  );
  validateNonEmptyList(
    errors,
    challengeId,
    'content.acceptanceCriteria',
    challenge.content.acceptanceCriteria,
    'At least one acceptance criterion is required.',
  );
  validateNonEmptyList(
    errors,
    challengeId,
    'content.constraints',
    challenge.content.constraints,
    'At least one constraint is required.',
  );
}

function validateRequiredText(
  errors: ChallengeValidationError[],
  challengeId: string,
  field: string,
  value: string,
  message: string,
): void {
  if (!value.trim()) {
    addError(errors, challengeId, field, message);
  }
}

function validatePositiveInteger(
  errors: ChallengeValidationError[],
  challengeId: string,
  field: string,
  value: number,
  message: string,
): void {
  if (!Number.isInteger(value) || value <= 0) {
    addError(errors, challengeId, field, message);
  }
}

function validateNonEmptyList(
  errors: ChallengeValidationError[],
  challengeId: string,
  field: string,
  value: readonly string[],
  message: string,
): void {
  if (value.length === 0 || value.some((item) => !item.trim())) {
    addError(errors, challengeId, field, message);
  }
}

function getChallengeIdForError(challenge: Challenge): string {
  return challenge.id.trim() || '<missing-id>';
}

function addError(
  errors: ChallengeValidationError[],
  challengeId: string,
  field: string,
  message: string,
): void {
  errors.push({ challengeId, field, message });
}
