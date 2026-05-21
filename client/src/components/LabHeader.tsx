import { useLabProgress } from '../lib/useLabProgress';
import type { Lab } from '../labs';

interface LabHeaderProps {
  lab: Lab;
}

export function LabHeader({ lab }: LabHeaderProps) {
  const { isCompleted, toggle } = useLabProgress();
  const done = isCompleted(lab.slug);

  return (
    <div className="mb-8 border-b border-edge pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-content">{lab.title}</h1>
          <p className="mt-1 text-muted">{lab.topic}</p>
        </div>
        <button
          type="button"
          onClick={() => toggle(lab.slug)}
          aria-pressed={done}
          className={[
            'shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
            done
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900'
              : 'border-edge bg-surface text-muted hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-accent',
          ].join(' ')}
        >
          {done ? '✓ Completed' : 'Mark complete'}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {lab.apis.map((api) => (
          <span
            key={api}
            className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          >
            {api}
          </span>
        ))}
      </div>
    </div>
  );
}
