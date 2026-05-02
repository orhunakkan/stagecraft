'use client';

import Image from 'next/image';
import { useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';

const CHALLENGE_ID = 'accessible-locators';
const OBJECTIVE =
  'Recognize how roles, accessible names, labels, visible text, alternative text, and titles can make browser automation easier to read and less brittle.';

const FEATURES = [
  {
    id: 'resilient',
    name: 'Resilient',
    description:
      'Tests that use roles and labels survive visual redesigns and DOM restructuring without breaking.',
  },
  {
    id: 'readable',
    name: 'Readable',
    description:
      'Locators that mirror how users see the page are easier for team members to understand and review.',
  },
  {
    id: 'maintainable',
    name: 'Maintainable',
    description:
      'Accessible selectors reduce the cost of test maintenance as the application grows and changes.',
  },
] as const;

// Simple inline SVG used as the practice image source — no external file required.
const DIAGRAM_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 260' fill='none'%3E%3Crect width='480' height='260' rx='12' fill='%23f1f5f9'/%3E%3Crect x='40' y='40' width='160' height='40' rx='8' fill='%23e2e8f0'/%3E%3Ctext x='120' y='66' text-anchor='middle' fill='%2364748b' font-size='13' font-family='sans-serif'%3Ebutton%3C/text%3E%3Crect x='40' y='100' width='160' height='40' rx='8' fill='%23e2e8f0'/%3E%3Ctext x='120' y='126' text-anchor='middle' fill='%2364748b' font-size='13' font-family='sans-serif'%3Eheading%3C/text%3E%3Crect x='40' y='160' width='160' height='40' rx='8' fill='%23e2e8f0'/%3E%3Ctext x='120' y='186' text-anchor='middle' fill='%2364748b' font-size='13' font-family='sans-serif'%3Eimg alt%3C/text%3E%3Cline x1='200' y1='60' x2='280' y2='60' stroke='%2394a3b8' stroke-width='2' stroke-dasharray='4'/%3E%3Cline x1='200' y1='120' x2='280' y2='120' stroke='%2394a3b8' stroke-width='2' stroke-dasharray='4'/%3E%3Cline x1='200' y1='180' x2='280' y2='180' stroke='%2394a3b8' stroke-width='2' stroke-dasharray='4'/%3E%3Crect x='280' y='40' width='160' height='40' rx='8' fill='%23dbeafe'/%3E%3Ctext x='360' y='66' text-anchor='middle' fill='%231d4ed8' font-size='12' font-family='sans-serif'%3EgetByRole%3C/text%3E%3Crect x='280' y='100' width='160' height='40' rx='8' fill='%23dbeafe'/%3E%3Ctext x='360' y='126' text-anchor='middle' fill='%231d4ed8' font-size='12' font-family='sans-serif'%3EgetByRole%3C/text%3E%3Crect x='280' y='160' width='160' height='40' rx='8' fill='%23dbeafe'/%3E%3Ctext x='360' y='186' text-anchor='middle' fill='%231d4ed8' font-size='12' font-family='sans-serif'%3EgetByAltText%3C/text%3E%3C/svg%3E";

export function AccessibleLocatorsLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Accessible Locators Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <AccessibleLocatorsContent key={resetKey} />
    </PracticeLabLayout>
  );
}

function AccessibleLocatorsContent() {
  const [demoActivated, setDemoActivated] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(true);

  return (
    <section aria-label="Practice page demo" className="overflow-hidden rounded-3xl border border-border bg-background-strong shadow-stage-card">
      {/* Notification alert ------------------------------------------------ */}
      {notificationVisible && (
        <div
          role="alert"
          aria-label="Practice tip"
          className="flex items-center justify-between gap-4 border-b border-border bg-secondary/10 px-6 py-3"
        >
          <p className="text-sm text-card-foreground">
            <span className="font-bold">Practice tip:</span> Use{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-semibold text-secondary">
              getByRole(&apos;alert&apos;)
            </code>{' '}
            to locate this element. Dismiss it and verify it is gone.
          </p>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotificationVisible(false)}
            className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span aria-hidden="true" className="block text-base leading-none">
              ×
            </span>
          </button>
        </div>
      )}

      {/* Site header ------------------------------------------------------- */}
      <header className="flex items-center justify-between border-b border-border bg-card/80 px-6 py-4">
        <a
          href="#lab-main-content"
          aria-label="Stagecraft Demo home"
          className="flex items-center gap-2 font-black tracking-tight text-card-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span aria-hidden="true" className="text-lg">
            ⚡
          </span>
          Stagecraft Demo
        </a>
        <nav aria-label="Site navigation" className="flex items-center gap-1">
          {(['Features', 'About', 'Contact'] as const).map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      {/* Main content ------------------------------------------------------ */}
      <main id="lab-main-content">
        {/* Hero section */}
        <section
          aria-labelledby="hero-heading"
          className="grid gap-8 px-6 py-10 md:grid-cols-2 md:items-center"
        >
          <div className="space-y-5">
            <h2
              id="hero-heading"
              className="text-3xl font-black tracking-tight text-card-foreground sm:text-4xl"
            >
              Build resilient test automation
            </h2>
            <p className="leading-7 text-muted-foreground">
              Write tests that describe your app the way users see it — using roles, labels, and
              visible text. Your selectors will survive redesigns and stay readable.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setDemoActivated(true)}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                Start demo
              </button>
              <a
                href="#features"
                className="text-sm font-semibold text-secondary transition hover:text-secondary/80 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                View features →
              </a>
            </div>
          </div>

          <figure className="overflow-hidden rounded-2xl border border-border">
            <Image
              src={DIAGRAM_SRC}
              alt="Diagram showing test selectors connecting to UI elements through roles and labels"
              width={480}
              height={260}
              unoptimized
              className="block h-auto w-full"
            />
            <figcaption className="border-t border-border bg-muted/60 px-4 py-2 text-xs text-muted-foreground">
              User-facing selectors make tests readable and maintainable
            </figcaption>
          </figure>
        </section>

        {/* Status region */}
        <div
          role="status"
          aria-live="polite"
          aria-label="Demo status"
          className="mx-6 mb-6 min-h-[2.5rem] rounded-2xl border border-border bg-muted/60 px-4 py-2 text-sm text-muted-foreground"
        >
          {demoActivated && (
            <span className="font-semibold text-success">
              ✓ Demo activated — your test located the primary action and can verify this message.
            </span>
          )}
        </div>

        {/* Features section */}
        <section
          aria-labelledby="features-heading"
          id="features"
          className="border-t border-border px-6 py-10"
        >
          <h2
            id="features-heading"
            className="text-2xl font-black tracking-tight text-card-foreground"
          >
            Why accessible locators?
          </h2>
          <ul role="list" className="mt-6 grid gap-5 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.id}>
                <article
                  aria-labelledby={`feature-${feature.id}`}
                  className="stage-card p-5"
                >
                  <h3 id={`feature-${feature.id}`} className="font-black text-card-foreground">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* Footer ------------------------------------------------------------ */}
      <footer
        role="contentinfo"
        className="flex items-center justify-between border-t border-border px-6 py-4"
      >
        <p className="text-xs text-muted-foreground">© Stagecraft Demo — Practice environment</p>
        <button
          type="button"
          aria-label="Open settings"
          title="Customize lab preferences"
          className="rounded-full border border-border p-2 text-muted-foreground transition hover:border-ring/60 hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span aria-hidden="true" className="block text-base leading-none">
            ⚙
          </span>
        </button>
      </footer>
    </section>
  );
}
