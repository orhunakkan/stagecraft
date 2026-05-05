import Link from 'next/link';

const conceptSections = [
  {
    title: 'When to use page objects',
    eyebrow: 'Readability threshold',
    body: 'A page object is worth creating when the same locators or interaction sequences appear in more than one test, or when a test body spends more time describing mechanics than describing user intent. One repeated selector is a coincidence; three is a signal.',
    checks: [
      'Do two or more tests share the same locator for the same element? Centralise it.',
      'Does the test body read like a list of selectors rather than a story about user behaviour?',
      'Would a future reader understand what the test proves without reading the page source?',
    ],
  },
  {
    title: 'Encapsulating locators',
    eyebrow: 'Stable selectors',
    body: 'Store every locator that appears in tests as a readonly property on the page object class. This means selector changes require updates in exactly one place, and the rest of the test suite adjusts automatically.',
    checks: [
      'Is every selector for a given page or component defined in exactly one place?',
      'Do locator properties use the most user-facing selector available — role, label, visible text?',
      'Is the constructor the only place that calls page.getByRole / page.getByLabel / page.locator?',
    ],
  },
  {
    title: 'Composing actions',
    eyebrow: 'Higher-level API',
    body: 'Group related interactions into named methods that describe what a user does, not which elements they click. A method called signIn(email, password) is more readable and reusable than three separate fill/click steps repeated in every test.',
    checks: [
      'Does each method represent a single, cohesive user action rather than an arbitrary bundle of clicks?',
      'Can a test call one or two page object methods and still understand what it is testing?',
      'Are methods short enough to be read in full without scrolling?',
    ],
  },
  {
    title: 'Combining POM with fixtures',
    eyebrow: 'Fixture-scoped objects',
    body: 'Wrap page object instantiation and navigation in a custom fixture built with test.extend(). The fixture handles setup once, and every test that receives it starts with the page already loaded and ready — no repeated beforeEach blocks.',
    checks: [
      'Does the fixture call goto() internally so tests never need to navigate manually?',
      'Is the fixture scope set to "test" so each test gets a fresh context?',
      'Can the fixture be composed with other fixtures without creating circular dependencies?',
    ],
  },
  {
    title: 'Naming and file organisation',
    eyebrow: 'Project layout',
    body: 'Keep page objects alongside the tests that use them, or in a dedicated directory at the root of the test tree. Name each file after the page or component it represents. Avoid deep inheritance chains — prefer composition and shared helpers.',
    checks: [
      'Is the file location consistent with the rest of the test suite so a new contributor can find it quickly?',
      'Does the class name match the page or component name, making the connection obvious?',
      'Is the hierarchy shallow — at most one base class, or none at all?',
    ],
  },
] as const;

const practicePrompts = [
  'Choose one Stagecraft lab that has more than three repeated locators across its e2e tests. Extract them into a page object class.',
  'Write a goto() method that navigates and awaits the first stable, user-visible element before the method returns.',
  'Create a custom fixture with test.extend() that instantiates the page object so tests receive it directly in their arguments.',
  'Refactor one beforeEach setup block to use the fixture and confirm each test still expresses its intent clearly.',
] as const;

export function PageObjectsConcepts() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12 sm:py-16">
      {/* Breadcrumb -------------------------------------------------------- */}
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
              href="/challenges/page-objects"
              className="transition hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Page Object Model Lab
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

      {/* Header ----------------------------------------------------------- */}
      <header className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <p className="stage-badge mb-4">Concept practice</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Page Object Model Lab
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Use this answer-free guide to decide when a page object is worth creating, how to
            encapsulate locators and actions, and how to connect page objects to custom fixtures
            in your own Playwright project.
          </p>
        </div>

        <aside className="stage-card border-primary/25 bg-primary/7 p-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-primary">
            No local solution script
          </h2>
          <p className="mt-3 text-sm leading-6 text-card-foreground">
            This page is intentionally conceptual. Apply the prompts to your own Playwright
            project and use the checklist questions to review what you build.
          </p>
        </aside>
      </header>

      {/* Practice prompts ------------------------------------------------- */}
      <section aria-labelledby="practice-prompts-heading" className="stage-card p-6">
        <h2 id="practice-prompts-heading" className="text-2xl font-black tracking-tight">
          Practice prompts
        </h2>
        <ol
          className="mt-5 grid gap-4 md:grid-cols-2"
          aria-label="Page object model practice prompts"
        >
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

      {/* Concept sections ------------------------------------------------- */}
      <div className="grid gap-5">
        {conceptSections.map((section) => (
          <section
            key={section.title}
            aria-labelledby={`${section.title.toLowerCase().replace(/\s+/g, '-')}-heading`}
            className="stage-card p-6"
          >
            <p className="text-xs font-black uppercase tracking-widest text-secondary">
              {section.eyebrow}
            </p>
            <h2
              id={`${section.title.toLowerCase().replace(/\s+/g, '-')}-heading`}
              className="mt-2 text-2xl font-black tracking-tight"
            >
              {section.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {section.body}
            </p>
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
