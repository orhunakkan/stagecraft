import Link from 'next/link';

const practiceAreas = [
  {
    title: 'Accessible locators',
    description: 'Practice roles, labels, headings, links, buttons, and visible text.',
    color: 'text-primary',
  },
  {
    title: 'Forms and validation',
    description: 'Work through labels, messages, enabled states, and user-observable feedback.',
    color: 'text-secondary',
  },
  {
    title: 'Async and network UI',
    description:
      'Explore loading, retry, deterministic API, and refresh behavior without flaky timing.',
    color: 'text-accent',
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-14 sm:py-20">
      <section className="stage-card relative overflow-hidden px-8 py-10 text-center sm:px-14 sm:py-14">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent" />
        <p className="stage-badge mx-auto mb-6">Playwright practice lab</p>
        <h1 className="stage-gradient-text text-6xl font-black tracking-tight sm:text-8xl">
          Stagecraft
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
          Practice modern Playwright test automation skills through hands-on browser challenges.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/challenges"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-stage-card transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Choose a challenge
          </Link>
          <Link
            href="#practice-areas"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 py-3 text-sm font-bold text-card-foreground transition hover:-translate-y-0.5 hover:border-ring focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Preview practice areas
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="choose-challenge-heading"
        className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div>
          <p className="stage-badge mb-4">Self-guided learning</p>
          <h2
            id="choose-challenge-heading"
            className="text-3xl font-black tracking-tight sm:text-4xl"
          >
            Choose a challenge, then write your own tests.
          </h2>
        </div>
        <div className="stage-card p-6">
          <p className="leading-8 text-muted-foreground">
            Stagecraft gives you realistic browser tasks without revealing answer scripts. Read the
            scenario, inspect the interface, and practice resilient Playwright automation in your
            own local project.
          </p>
        </div>
      </section>

      <section id="practice-areas" aria-labelledby="practice-areas-heading">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="stage-badge mb-4">Practice surfaces</p>
            <h2
              id="practice-areas-heading"
              className="text-3xl font-black tracking-tight sm:text-4xl"
            >
              Practice areas
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Labs are designed to be deterministic, accessible, and friendly to user-facing locators.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {practiceAreas.map((area) => (
            <article key={area.title} className="stage-card p-5">
              <h3 className={`text-lg font-black ${area.color}`}>{area.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{area.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
