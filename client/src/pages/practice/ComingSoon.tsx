import type { Lab } from '../../labs';

interface ComingSoonProps {
  lab: Lab;
}

export function ComingSoon({ lab }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Coming Soon
        </span>
      </div>

      <h1 className="text-2xl font-bold text-zinc-900">{lab.title}</h1>
      <p className="mt-2 text-zinc-500">{lab.topic}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {lab.apis.map((api) => (
          <span key={api} className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-600">
            {api}
          </span>
        ))}
      </div>

      <p className="mt-8 text-sm text-zinc-400">This lab is under construction. Check back soon.</p>
    </div>
  );
}
