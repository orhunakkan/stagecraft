import Link from 'next/link';

const conceptSections = [
  {
    title: 'Trace viewer triage',
    eyebrow: 'Failure timeline',
    body: 'Use a recorded trace when the sequence matters: actions, DOM snapshots, console messages, network calls, source locations, and attachments can be reviewed together after the run.',
    checks: [
      'Can you identify the action that failed and the visible state before and after it?',
      'Can console and network evidence explain whether the failure came from the app, data, or the test?',
      'Is trace collection limited to failed runs, retained failures, or retry attempts unless you are debugging locally?',
    ],
  },
  {
    title: 'Screenshots and videos',
    eyebrow: 'Visual evidence',
    body: 'Screenshots and videos are debugging artifacts that help humans understand what the browser displayed. They work best when captured intentionally and reviewed alongside assertions and traces.',
    checks: [
      'Would a screenshot, element image, or full-page capture show the missing or incorrect state?',
      'Would video help explain timing, navigation, or multi-page behavior that a still image cannot show?',
      'Could the artifact contain private data that should stay out of shared reports?',
    ],
  },
  {
    title: 'Retries and flaky outcomes',
    eyebrow: 'Signal, not silence',
    body: 'Retries can keep a CI run moving, but a test that passes after retry is still evidence of nondeterminism. Treat flaky outcomes as follow-up work, not as a hidden success.',
    checks: [
      'Does the report distinguish passed, failed, and flaky outcomes clearly?',
      'Are traces or videos collected on retry so the first failure has evidence?',
      'Can the test run independently in a fresh worker without depending on previous state?',
    ],
  },
  {
    title: 'Timeout boundaries',
    eyebrow: 'Patience with purpose',
    body: 'Timeouts belong at different layers: a whole test, an assertion, an action, a navigation, a fixture, or the full run. Increase the narrowest boundary only after understanding what is actually slow.',
    checks: [
      'Is the slow point an assertion waiting for user-visible UI, a navigation, setup, or the full test body?',
      'Would a better web-first assertion or deterministic setup remove the need for a longer timeout?',
      'Is a global timeout protecting the suite from runaway runs without hiding individual slow scenarios?',
    ],
  },
  {
    title: 'Annotations and reports',
    eyebrow: 'Readable evidence',
    body: 'Good reports tell a future teammate what the scenario intended to prove. Tags, annotations, named steps, and reporter choices should make triage faster without exposing secrets.',
    checks: [
      'Can someone scan the report and understand which product area, risk, or bug link the failure belongs to?',
      'Are local and CI reporters chosen for their audience: detailed locally, concise or machine-readable in automation?',
      'Do attachments and metadata support the failure story without leaking sensitive application content?',
    ],
  },
] as const;

const practicePrompts = [
  'Pick one failing or intentionally broken scenario in your own Playwright project.',
  'Predict the first artifact you would inspect before opening the source file.',
  'Run the scenario with the smallest useful diagnostic setting, then write down what evidence changed your understanding.',
  'Update your team notes with when to collect traces, screenshots, videos, retries, timeout changes, and report annotations.',
] as const;

export function DebuggingReportingConcepts() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12 sm:py-16">
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
          <li>
            <Link
              href="/challenges/debugging-reporting"
              className="transition hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Debugging and Reporting Concepts
            </Link>
          </li>
          <li aria-hidden="true" className="select-none">
            /
          </li>
          <li aria-current="page" className="font-semibold text-foreground">
            Concept practice
          </li>
        </ol>
      </nav>

      <header className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <p className="stage-badge mb-4">Concept practice</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Debugging and Reporting Concepts
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Use this answer-free checklist to decide which Playwright artifacts, retry policies,
            timeout boundaries, annotations, and reports belong in your own test project.
          </p>
        </div>

        <aside className="stage-card border-primary/25 bg-primary/7 p-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-primary">
            No local solution script
          </h2>
          <p className="mt-3 text-sm leading-6 text-card-foreground">
            This page is intentionally conceptual. Practice by applying the prompts to your own
            Playwright project and reviewing the artifacts your run produces.
          </p>
        </aside>
      </header>

      <section aria-labelledby="practice-prompts-heading" className="stage-card p-6">
        <h2 id="practice-prompts-heading" className="text-2xl font-black tracking-tight">
          Practice prompts
        </h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-2" aria-label="Debugging practice prompts">
          {practicePrompts.map((prompt, index) => (
            <li key={prompt} className="rounded-3xl border border-border bg-muted/35 p-4">
              <span
                aria-hidden="true"
                className="inline-flex size-7 items-center justify-center rounded-full bg-primary/14 text-xs font-black text-primary"
              >
                {index + 1}
              </span>
              <p className="mt-3 text-sm leading-6 text-card-foreground">{prompt}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-5">
        {conceptSections.map((section) => (
          <section
            key={section.title}
            aria-labelledby={`${section.title}-heading`}
            className="stage-card p-6"
          >
            <p className="text-xs font-black uppercase tracking-widest text-secondary">
              {section.eyebrow}
            </p>
            <h2 id={`${section.title}-heading`} className="mt-2 text-2xl font-black tracking-tight">
              {section.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{section.body}</p>
            <ul className="mt-5 grid gap-3" aria-label={`${section.title} checklist`}>
              {section.checks.map((check) => (
                <li
                  key={check}
                  className="flex gap-3 rounded-2xl border border-border bg-background/55 p-4"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1 size-2 shrink-0 rounded-full bg-success"
                  />
                  <span className="text-sm leading-6 text-card-foreground">{check}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
