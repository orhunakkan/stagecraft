import Link from 'next/link';

import type { Challenge, ChallengeDifficulty } from './challenge-types';

interface ChallengeCardProps {
  challenge: Challenge;
  accentIndex: number;
}

const difficultyStyles: Record<ChallengeDifficulty, string> = {
  beginner: 'bg-success/14 text-success border-success/30',
  intermediate: 'bg-warning/18 text-warning-foreground border-warning/40',
  advanced: 'bg-danger/12 text-danger border-danger/30',
};

const accentStyles = [
  'from-primary/18 via-secondary/12 to-transparent',
  'from-secondary/18 via-accent/12 to-transparent',
  'from-accent/18 via-success/12 to-transparent',
] as const;

export function ChallengeCard({ challenge, accentIndex }: ChallengeCardProps) {
  const headingId = `${challenge.id}-title`;
  const accentClass = accentStyles[accentIndex % accentStyles.length];

  return (
    <article
      aria-labelledby={headingId}
      className="stage-card group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-1 hover:border-ring/70"
    >
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentClass}`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${difficultyStyles[challenge.difficulty]}`}
        >
          {challenge.difficulty}
        </span>
        <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
          {challenge.estimatedMinutes} min
        </span>
      </div>

      <h2 id={headingId} className="mt-4 text-2xl font-black tracking-tight text-card-foreground">
        {challenge.title}
      </h2>
      <p className="mt-2 text-sm font-bold text-secondary">{challenge.primaryConcept}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{challenge.summary}</p>

      <ul aria-label={`${challenge.title} tags`} className="mt-5 flex flex-wrap gap-2">
        {challenge.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full border border-border bg-background/55 px-2.5 py-1 text-xs font-semibold text-muted-foreground"
          >
            {tag}
          </li>
        ))}
      </ul>

      <Link
        href={`/challenges/${challenge.id}`}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-black text-primary-foreground transition group-hover:bg-primary/92 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        Open {challenge.title}
      </Link>
    </article>
  );
}
