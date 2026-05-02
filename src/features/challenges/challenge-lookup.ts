import type { Challenge } from './challenge-types';

/**
 * Returns the challenge with the given id, or undefined if no match is found.
 *
 * Lookup is case-sensitive and matches the full id string.
 */
export function getChallengeById(
  id: string,
  challenges: readonly Challenge[],
): Challenge | undefined {
  return challenges.find((challenge) => challenge.id === id);
}
