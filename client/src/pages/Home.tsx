import { labs } from '../labs';
import { LabCard } from '../components/LabCard';
import { useLabProgress } from '../lib/useLabProgress';

export function Home() {
  const { isCompleted } = useLabProgress();
  const readyLabs = labs.filter((l) => l.status === 'ready');
  const comingSoonLabs = labs.filter((l) => l.status === 'coming-soon');

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-content">Practice Labs</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Interactive Playwright challenges. Read the lab, interact with the UI, then write your own
          tests in a separate project — no spoilers here.
        </p>
      </div>

      <section className="mb-10" aria-label="Ready labs">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          Ready — {readyLabs.length} labs
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {readyLabs.map((lab) => (
            <LabCard key={lab.slug} lab={lab} completed={isCompleted(lab.slug)} />
          ))}
        </div>
      </section>

      <section aria-label="Coming soon labs">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
          Coming soon — {comingSoonLabs.length} labs
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoonLabs.map((lab) => (
            <LabCard key={lab.slug} lab={lab} />
          ))}
        </div>
      </section>
    </div>
  );
}
