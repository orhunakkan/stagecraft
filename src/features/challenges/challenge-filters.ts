import type { Challenge, ChallengeDifficulty } from './challenge-types';

export interface ChallengeFilterState {
  search?: string;
  difficulty?: ChallengeDifficulty | 'all';
  concept?: string;
}

export function filterChallenges(
  challenges: readonly Challenge[],
  filters: ChallengeFilterState,
): readonly Challenge[] {
  const search = normalizeSearch(filters.search ?? '');
  const difficulty = filters.difficulty ?? 'all';
  const concept = filters.concept ?? 'all';

  return challenges.filter((challenge) => {
    const matchesSearch = search ? getSearchableText(challenge).includes(search) : true;
    const matchesDifficulty = difficulty === 'all' ? true : challenge.difficulty === difficulty;
    const matchesConcept = concept === 'all' ? true : challenge.primaryConcept === concept;

    return matchesSearch && matchesDifficulty && matchesConcept;
  });
}

export function getChallengeConceptOptions(challenges: readonly Challenge[]): readonly string[] {
  return [...new Set(challenges.map((challenge) => challenge.primaryConcept))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function getSearchableText(challenge: Challenge): string {
  return normalizeSearch(
    [challenge.title, challenge.primaryConcept, challenge.summary, ...challenge.tags].join(' '),
  );
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase();
}
