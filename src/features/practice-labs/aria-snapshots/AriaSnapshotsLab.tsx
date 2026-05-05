'use client';

import { useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';

const CHALLENGE_ID = 'aria-snapshots';
const OBJECTIVE =
  'Use toMatchAriaSnapshot() to capture and verify the ARIA tree structure of interactive regions, including expanded and collapsed states and status badge labels.';

// ─── Static data ──────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Overview', href: '#overview', current: true },
  { label: 'Documentation', href: '#documentation', current: false },
  { label: 'API Reference', href: '#api-reference', current: false },
  { label: 'Examples', href: '#examples', current: false },
] as const;

type FeatureStatus = 'Active' | 'Beta' | 'Deprecated' | 'Coming Soon';

interface Feature {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
}

const FEATURES: Feature[] = [
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Token-based login flows with session management.',
    status: 'Active',
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Real-time event notifications sent to your endpoint.',
    status: 'Active',
  },
  {
    id: 'graphql',
    name: 'GraphQL API',
    description: 'Query only the data your client needs.',
    status: 'Beta',
  },
  {
    id: 'legacy-xml',
    name: 'XML Export',
    description: 'Legacy format no longer recommended for new integrations.',
    status: 'Deprecated',
  },
];

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-rate-limits',
    question: 'How are API rate limits applied?',
    answer:
      'Rate limits are applied per API key. Each key allows up to 1 000 requests per minute. Exceeding the limit returns a 429 response with a Retry-After header.',
  },
  {
    id: 'faq-auth',
    question: 'Which authentication methods are supported?',
    answer:
      'Bearer tokens, API keys in the Authorization header, and OAuth 2.0 client credentials are all supported. Session cookies are available for browser-based integrations.',
  },
  {
    id: 'faq-versioning',
    question: 'How is API versioning handled?',
    answer:
      'The API uses URL path versioning (e.g. /v1/, /v2/). Breaking changes are only introduced in new major versions. Previous versions remain available for at least 12 months after a new version ships.',
  },
  {
    id: 'faq-webhooks',
    question: 'What payload format do webhooks use?',
    answer:
      'Webhooks deliver JSON payloads signed with an HMAC-SHA256 signature in the X-Signature header. Verify the signature before processing the payload.',
  },
];

// ─── Status badge colours ─────────────────────────────────────────────────────

const STATUS_STYLES: Record<FeatureStatus, string> = {
  Active: 'border-success/40 bg-success/10 text-success',
  Beta: 'border-secondary/40 bg-secondary/10 text-secondary',
  Deprecated: 'border-danger/40 bg-danger/10 text-danger',
  'Coming Soon': 'border-warning/40 bg-warning/10 text-warning-foreground',
};

// ─── Top-level lab component ───────────────────────────────────────────────────

export function AriaSnapshotsLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="ARIA Snapshots Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <AriaSnapshotsContent key={resetKey} />
    </PracticeLabLayout>
  );
}

// ─── Content — remounted on reset ─────────────────────────────────────────────

function AriaSnapshotsContent() {
  return (
    <div className="space-y-8">
      <SiteNavigationSection />
      <FeatureRegistrySection />
      <FaqAccordionSection />
    </div>
  );
}

// ─── Section 1: Site navigation ───────────────────────────────────────────────

function SiteNavigationSection() {
  return (
    <section aria-label="Navigation section" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 1 — Site Navigation
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          A navigation landmark with four links, one marked as the current page. Take a{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            toMatchAriaSnapshot()
          </code>{' '}
          of the navigation region and verify the link names and current-page indicator.
        </p>
      </div>

      <nav aria-label="Site navigation">
        <ul className="flex flex-wrap gap-2" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                aria-current={link.current ? 'page' : undefined}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  link.current
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-card text-card-foreground hover:border-ring/60'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

// ─── Section 2: Feature registry ─────────────────────────────────────────────

function FeatureRegistrySection() {
  return (
    <section aria-label="Feature registry section" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 2 — Feature Status Registry
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          A list of platform features, each with a name, description, and status badge. Capture the
          full list with{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            toMatchAriaSnapshot()
          </code>{' '}
          and verify the feature names and badge labels.
        </p>
      </div>

      <ul aria-label="Platform features" className="space-y-3">
        {FEATURES.map((feature) => (
          <li
            key={feature.id}
            aria-label={feature.name}
            className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-muted/20 px-5 py-4"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-card-foreground">{feature.name}</p>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_STYLES[feature.status]}`}
              aria-label={`Status: ${feature.status}`}
            >
              {feature.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ─── Section 3: FAQ accordion ─────────────────────────────────────────────────

function FaqAccordionSection() {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <section aria-label="FAQ accordion section" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 3 — FAQ Accordion
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Four collapsible FAQ items with{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">aria-expanded</code>{' '}
          state. Toggle items open and take a snapshot that includes the{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">[expanded]</code> state.
        </p>
      </div>

      <div aria-label="Frequently asked questions" className="space-y-2">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openIds.has(item.id);
          const panelId = `${item.id}-panel`;

          return (
            <div key={item.id} className="rounded-2xl border border-border overflow-hidden">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted/30 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-ring"
              >
                <span className="text-sm font-bold text-card-foreground">{item.question}</span>
                <span
                  aria-hidden="true"
                  className={`shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                >
                  ▾
                </span>
              </button>

              {isOpen && (
                <div
                  id={panelId}
                  role="region"
                  aria-label={item.question}
                  className="border-t border-border px-5 py-4"
                >
                  <p className="text-sm leading-6 text-muted-foreground">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
