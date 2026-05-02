'use client';

import Link from 'next/link';

interface PracticeLabLayoutProps {
  /** Title displayed as the page heading and in the breadcrumb. */
  labTitle: string;
  /** Challenge id used to build the back-to-challenge breadcrumb link. */
  challengeId: string;
  /** The learning objective shown below the heading. */
  objective: string;
  /** Called when the learner clicks "Reset lab". */
  onReset: () => void;
  /** The interactive lab content. Pass a `key={resetKey}` on the content
   *  component to remount it whenever `onReset` triggers a new resetKey. */
  children: React.ReactNode;
}

export function PracticeLabLayout({
  labTitle,
  challengeId,
  objective,
  onReset,
  children,
}: PracticeLabLayoutProps) {
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
              href={`/challenges/${challengeId}`}
              className="transition hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {labTitle}
            </Link>
          </li>
          <li aria-hidden="true" className="select-none">
            /
          </li>
          <li aria-current="page" className="font-semibold text-foreground">
            Practice
          </li>
        </ol>
      </nav>

      {/* Header ----------------------------------------------------------- */}
      <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
        <div>
          <p className="stage-badge mb-4">Practice area</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{labTitle}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{objective}</p>
        </div>
        <div className="flex items-start gap-3 lg:pt-2">
          <button
            type="button"
            aria-label="Reset lab to its initial state"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-ring/60 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <span aria-hidden="true">↺</span>
            Reset lab
          </button>
        </div>
      </header>

      {/* Lab content ------------------------------------------------------- */}
      <main>{children}</main>
    </div>
  );
}
