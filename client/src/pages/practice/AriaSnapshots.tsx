import { useState } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'aria-snapshots')!;

const STEPS = ['Account', 'Profile', 'Preferences', 'Review'];

const ACCORDION_SECTIONS = [
  {
    id: 'what-is',
    title: 'What is an ARIA snapshot?',
    content:
      'An ARIA snapshot is a YAML representation of the full accessibility tree of a page or element. It captures roles, names, properties, and hierarchy — the information assistive technologies use to describe a UI to users.',
  },
  {
    id: 'when-to-use',
    title: 'When should I use toMatchAriaSnapshot?',
    content:
      'Use it to catch structural regressions: a heading that changed level, a button that became a link, a list that lost items, or a landmark that was removed. It complements visual regression tests by asserting semantics, not pixels.',
  },
  {
    id: 'vs-role',
    title: 'How is this different from getByRole?',
    content:
      'getByRole finds a single element by its ARIA role and accessible name. toMatchAriaSnapshot asserts the entire subtree structure — multiple elements, their nesting, and their relationships — in a single assertion.',
  },
];

export function AriaSnapshots() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
    const section = ACCORDION_SECTIONS.find((s) => s.id === id);
    setAnnouncement(
      openSection === id
        ? `${section?.title} collapsed`
        : `${section?.title} expanded`,
    );
  };

  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-8 text-sm text-zinc-500">
        This lab is about asserting the <em>structure</em> of the accessibility tree — not finding
        elements by role (see{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">/practice/accessible-locators</code>
        ). Use{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">
          expect(locator).toMatchAriaSnapshot()
        </code>{' '}
        to compare a YAML template against the live tree.
      </p>

      {/* Live region for announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <div className="space-y-10">
        {/* ── Accordion ──────────────────────────────────────────────────── */}
        <section aria-labelledby="accordion-heading">
          <h2 id="accordion-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Challenge 1 — Accordion
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Capture the ARIA snapshot of the accordion. Open different sections and assert that the
            tree updates correctly — expanded sections reveal child content nodes. Try{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">/children: equal</code> for strict
            matching.
          </p>

          <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
            {ACCORDION_SECTIONS.map((section) => {
              const isOpen = openSection === section.id;
              return (
                <div key={section.id}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      aria-expanded={isOpen}
                      aria-controls={`${section.id}-content`}
                      id={`${section.id}-btn`}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50"
                    >
                      {section.title}
                      <span aria-hidden="true" className="ml-2 shrink-0 text-zinc-400">
                        {isOpen ? '▲' : '▼'}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`${section.id}-content`}
                    role="region"
                    aria-labelledby={`${section.id}-btn`}
                    hidden={!isOpen}
                    className="px-4 pb-4 pt-1 text-sm text-zinc-600"
                  >
                    {section.content}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Wizard / step indicator ───────────────────────────────────── */}
        <section aria-labelledby="wizard-heading">
          <h2 id="wizard-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Challenge 2 — Step wizard
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Navigate through the wizard steps. Assert that the{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">aria-current=&quot;step&quot;</code>{' '}
            attribute moves to the correct step. Capture before/after snapshots to verify
            structural transitions.
          </p>

          <nav aria-label="Registration wizard steps" className="mb-6">
            <ol className="flex gap-2">
              {STEPS.map((label, i) => (
                <li key={label}>
                  <button
                    type="button"
                    aria-current={i === step ? 'step' : undefined}
                    onClick={() => setStep(i)}
                    className={[
                      'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                      i === step
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : i < step
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-zinc-200 text-zinc-500',
                    ].join(' ')}
                  >
                    {i + 1}. {label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div
            role="form"
            aria-label={`${STEPS[step]} step`}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <h3 className="mb-3 text-sm font-semibold text-zinc-800">
              Step {step + 1}: {STEPS[step]}
            </h3>
            {step === 0 && (
              <div className="space-y-3">
                <label className="block text-xs text-zinc-600">
                  Email
                  <input
                    type="email"
                    aria-label="Email address"
                    className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="you@example.com"
                  />
                </label>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-3">
                <label className="block text-xs text-zinc-600">
                  Display name
                  <input
                    type="text"
                    aria-label="Display name"
                    className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="Your name"
                  />
                </label>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input type="checkbox" aria-label="Email notifications" />
                  Email notifications
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input type="checkbox" aria-label="Dark mode" />
                  Dark mode
                </label>
              </div>
            )}
            {step === 3 && (
              <p className="text-sm text-zinc-600">
                Review your details and submit. The accessibility tree at this step differs
                structurally from the others — assert it with a separate snapshot.
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={step === STEPS.length - 1}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* ── Live region ───────────────────────────────────────────────── */}
        <section aria-labelledby="live-heading">
          <h2 id="live-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Challenge 3 — Live region
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            The announcement region updates when accordion sections are toggled. Capture a snapshot
            that includes the live region and verify its content changes predictably.
          </p>
          <div
            aria-label="Live announcements"
            aria-live="polite"
            className="min-h-[2.5rem] rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-600"
          >
            {announcement || <span className="text-zinc-400">No announcement yet</span>}
          </div>
        </section>
      </div>
    </div>
  );
}
