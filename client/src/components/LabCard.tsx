import { Link } from 'react-router-dom';
import type { Lab } from '../labs';

interface LabCardProps {
  lab: Lab;
  completed?: boolean;
}

export function LabCard({ lab, completed = false }: LabCardProps) {
  const isReady = lab.status === 'ready';

  const inner = (
    <article
      className={[
        'group flex h-full flex-col rounded-xl border p-4 transition-all duration-150',
        isReady
          ? 'border-edge bg-surface hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer'
          : 'border-edge/50 bg-canvas/60',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-content leading-snug">{lab.title}</h2>

        <div className="flex shrink-0 items-center gap-1.5">
          {completed && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ✓ Done
            </span>
          )}
          <span
            className={[
              'rounded-full px-2 py-0.5 text-xs font-medium',
              isReady
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                : 'bg-surface-raised text-muted',
            ].join(' ')}
          >
            {isReady ? 'Ready' : 'Soon'}
          </span>
        </div>
      </div>

      <p className="mt-1.5 flex-1 text-xs text-muted leading-relaxed">{lab.topic}</p>

      <div className="mt-3 flex flex-wrap gap-1">
        {lab.apis.slice(0, 3).map((api) => (
          <span
            key={api}
            className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] text-muted leading-normal"
          >
            {api}
          </span>
        ))}
        {lab.apis.length > 3 && (
          <span className="rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] text-muted leading-normal">
            +{lab.apis.length - 3}
          </span>
        )}
      </div>

      {lab.requiresBackend && (
        <p className="mt-2 text-[10px] text-muted flex items-center gap-1">
          <span>⬡</span> Requires backend
        </p>
      )}
    </article>
  );

  if (!isReady) return inner;

  return (
    <Link
      to={`/practice/${lab.slug}`}
      aria-label={lab.title}
      className="flex flex-col h-full no-underline"
    >
      {inner}
    </Link>
  );
}
