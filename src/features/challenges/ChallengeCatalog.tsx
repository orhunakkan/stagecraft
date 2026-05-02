'use client';

import { useMemo, useState } from 'react';

import { ChallengeCard } from './ChallengeCard';
import { filterChallenges, getChallengeConceptOptions } from './challenge-filters';
import { challengeDifficulties, type Challenge, type ChallengeDifficulty } from './challenge-types';

interface ChallengeCatalogProps {
  challenges: readonly Challenge[];
}

const allFilterValue = 'all';

type DifficultyFilter = ChallengeDifficulty | typeof allFilterValue;

export function ChallengeCatalog({ challenges }: ChallengeCatalogProps) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(allFilterValue);
  const [concept, setConcept] = useState(allFilterValue);

  const conceptOptions = useMemo(() => getChallengeConceptOptions(challenges), [challenges]);
  const visibleChallenges = useMemo(
    () => filterChallenges(challenges, { search, difficulty, concept }),
    [challenges, concept, difficulty, search],
  );

  const resultLabel = `${visibleChallenges.length} ${visibleChallenges.length === 1 ? 'challenge' : 'challenges'}`;

  function resetFilters(): void {
    setSearch('');
    setDifficulty(allFilterValue);
    setConcept(allFilterValue);
  }

  return (
    <section aria-labelledby="challenge-catalog-heading" className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="stage-badge mb-4">Challenge library</p>
          <h1
            id="challenge-catalog-heading"
            className="text-4xl font-black tracking-tight sm:text-5xl"
          >
            Challenge catalog
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Browse answer-free Playwright practice challenges, then write your own tests against
            deterministic local labs.
          </p>
        </div>
        <div className="stage-card p-5">
          <p className="text-sm font-bold text-card-foreground">Find the right practice target</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Search by title, concept, or tag. Filter by difficulty and primary concept when you want
            a focused session.
          </p>
        </div>
      </div>

      <form
        className="stage-card grid gap-4 p-5 lg:grid-cols-[1fr_0.7fr_0.9fr_auto] lg:items-end"
        onSubmit={(event) => event.preventDefault()}
      >
        <div>
          <label htmlFor="challenge-search" className="text-sm font-bold text-card-foreground">
            Search challenges
          </label>
          <input
            id="challenge-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try forms, network, or auth"
            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
          />
        </div>

        <div>
          <label htmlFor="challenge-difficulty" className="text-sm font-bold text-card-foreground">
            Difficulty
          </label>
          <select
            id="challenge-difficulty"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as DifficultyFilter)}
            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
          >
            <option value={allFilterValue}>All difficulties</option>
            {challengeDifficulties.map((difficultyOption) => (
              <option key={difficultyOption} value={difficultyOption}>
                {difficultyOption}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="challenge-concept" className="text-sm font-bold text-card-foreground">
            Primary concept
          </label>
          <select
            id="challenge-concept"
            value={concept}
            onChange={(event) => setConcept(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
          >
            <option value={allFilterValue}>All concepts</option>
            {conceptOptions.map((conceptOption) => (
              <option key={conceptOption} value={conceptOption}>
                {conceptOption}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-full border border-border bg-card px-5 py-3 text-sm font-black text-card-foreground transition hover:border-ring hover:bg-muted focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Reset filters
        </button>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="text-sm font-black text-card-foreground">
          {resultLabel}
        </p>
        <p className="text-sm text-muted-foreground">
          Challenge copy is conceptual and does not include solution scripts.
        </p>
      </div>

      {visibleChallenges.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleChallenges.map((challenge, index) => (
            <ChallengeCard key={challenge.id} challenge={challenge} accentIndex={index} />
          ))}
        </div>
      ) : (
        <div role="status" className="stage-card px-6 py-12 text-center">
          <h2 className="text-2xl font-black tracking-tight">No challenges match your filters</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            Try a broader search term, choose all difficulties, or reset filters to see the full MVP
            challenge set.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition hover:bg-primary/92 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Show all challenges
          </button>
        </div>
      )}
    </section>
  );
}
