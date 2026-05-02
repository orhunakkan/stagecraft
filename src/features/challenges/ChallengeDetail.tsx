import Link from 'next/link';

import { ProgressControls } from '@/features/progress/ProgressControls';

import type { Challenge } from './challenge-types';

interface ChallengeDetailProps {
  challenge: Challenge;
}

const difficultyColors = {
  beginner: 'bg-success/14 text-success border-success/30',
  intermediate: 'bg-warning/18 text-warning-foreground border-warning/40',
  advanced: 'bg-danger/12 text-danger border-danger/30',
} as const;

export function ChallengeDetail({ challenge }: ChallengeDetailProps) {
  const { content, practice } = challenge;
  const practiceKind = practice.kind ?? 'lab';
  const practiceDescription =
    practiceKind === 'concept'
      ? 'Open the concept page for a structured checklist of what to practice in your own Playwright project.'
      : 'Open the interactive lab to explore the UI your tests will automate.';

  return (
    <article aria-labelledby="challenge-detail-heading" className="space-y-8">
      {/* Header ---------------------------------------------------------- */}
      <header className="space-y-5">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link
                href="/challenges"
                className="transition hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Challenge catalog
              </Link>
            </li>
            <li aria-hidden="true" className="select-none">
              /
            </li>
            <li aria-current="page" className="truncate font-semibold text-foreground">
              {challenge.title}
            </li>
          </ol>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${difficultyColors[challenge.difficulty]}`}
          >
            {challenge.difficulty}
          </span>
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
            {challenge.estimatedMinutes} min
          </span>
        </div>

        <h1
          id="challenge-detail-heading"
          className="text-4xl font-black tracking-tight sm:text-5xl"
        >
          {challenge.title}
        </h1>
        <p className="text-lg font-bold text-secondary">{challenge.primaryConcept}</p>

        <ul aria-label="Challenge tags" className="flex flex-wrap gap-2">
          {challenge.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-border bg-background/55 px-2.5 py-1 text-xs font-semibold text-muted-foreground"
            >
              {tag}
            </li>
          ))}
        </ul>
      </header>

      {/* Two-column main layout ------------------------------------------ */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* Left column: main challenge content */}
        <div className="space-y-6">
          {/* Scenario ------------------------------------------------------ */}
          <section aria-labelledby="scenario-heading" className="stage-card p-6">
            <h2
              id="scenario-heading"
              className="text-xs font-black uppercase tracking-widest text-secondary"
            >
              Scenario
            </h2>
            <p className="mt-3 leading-7 text-card-foreground">{content.scenario}</p>
          </section>

          {/* Learning objective ------------------------------------------- */}
          <section aria-labelledby="objective-heading" className="stage-card p-6">
            <h2
              id="objective-heading"
              className="text-xs font-black uppercase tracking-widest text-accent"
            >
              Learning objective
            </h2>
            <p className="mt-3 leading-7 text-card-foreground">{content.learningObjective}</p>
          </section>

          {/* Instructions ------------------------------------------------- */}
          <section aria-labelledby="instructions-heading" className="stage-card p-6">
            <h2
              id="instructions-heading"
              className="text-xs font-black uppercase tracking-widest text-primary"
            >
              Instructions
            </h2>
            <ol className="mt-4 space-y-4" aria-label="Challenge instructions">
              {content.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/14 text-xs font-black text-primary"
                  >
                    {index + 1}
                  </span>
                  <span className="leading-7 text-card-foreground">{instruction}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Acceptance criteria ------------------------------------------ */}
          <section aria-labelledby="criteria-heading" className="stage-card p-6">
            <h2
              id="criteria-heading"
              className="text-xs font-black uppercase tracking-widest text-success"
            >
              Acceptance criteria
            </h2>
            <ul className="mt-4 space-y-3" aria-label="Acceptance criteria">
              {content.acceptanceCriteria.map((criterion, index) => (
                <li key={index} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1 size-2 shrink-0 rounded-full bg-success"
                  />
                  <span className="leading-7 text-card-foreground">{criterion}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Constraints -------------------------------------------------- */}
          <section aria-labelledby="constraints-heading" className="stage-card p-6">
            <h2
              id="constraints-heading"
              className="text-xs font-black uppercase tracking-widest text-warning-foreground"
            >
              Constraints
            </h2>
            <ul className="mt-4 space-y-3" aria-label="Constraints">
              {content.constraints.map((constraint, index) => (
                <li key={index} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1 size-2 shrink-0 rounded-full bg-warning"
                  />
                  <span className="leading-7 text-card-foreground">{constraint}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right column: hints, concepts, practice link */}
        <aside className="space-y-5">
          {/* Progress tracker --------------------------------------------- */}
          <ProgressControls challengeId={challenge.id} />

          {/* Practice link ------------------------------------------------ */}
          <div className="stage-card p-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-primary">
              Practice area
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{practiceDescription}</p>
            <Link
              href={practice.route}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-black text-primary-foreground transition hover:bg-primary/92 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Open {practice.title}
            </Link>
          </div>

          {/* Conceptual hints --------------------------------------------- */}
          {content.hints && content.hints.length > 0 && (
            <section aria-labelledby="hints-heading" className="stage-card p-6">
              <h2
                id="hints-heading"
                className="text-xs font-black uppercase tracking-widest text-accent"
              >
                Hints
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Conceptual guidance only — no solution scripts.
              </p>
              <ul className="mt-4 space-y-4" aria-label="Conceptual hints">
                {content.hints.map((hint, index) => (
                  <li
                    key={index}
                    className="border-l-2 border-accent/40 pl-4 text-sm leading-6 text-card-foreground"
                  >
                    {hint}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Concept references ------------------------------------------- */}
          {content.conceptReferences && content.conceptReferences.length > 0 && (
            <section aria-labelledby="concepts-heading" className="stage-card p-6">
              <h2
                id="concepts-heading"
                className="text-xs font-black uppercase tracking-widest text-muted-foreground"
              >
                Playwright concepts
              </h2>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Topics to explore in your own Playwright docs or test project.
              </p>
              <ul className="mt-4 space-y-2" aria-label="Playwright concept references">
                {content.conceptReferences.map((concept, index) => (
                  <li
                    key={index}
                    className="rounded-xl border border-border bg-muted/60 px-3 py-2 text-sm font-semibold text-muted-foreground"
                  >
                    {concept}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}
