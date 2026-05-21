import { Router } from 'express';

interface FeedItem {
  id: number;
  title: string;
  body: string;
  createdAt: string;
}

const FEED_ITEMS: FeedItem[] = [
  {
    id: 1,
    title: 'Deployed new feature',
    body: 'Rolled out dark mode to all users.',
    createdAt: '2026-05-01T08:00:00Z',
  },
  {
    id: 2,
    title: 'Bug fixed',
    body: 'Resolved crash in settings page on iOS.',
    createdAt: '2026-05-01T09:15:00Z',
  },
  {
    id: 3,
    title: 'PR merged',
    body: 'Merged "Refactor auth middleware" after 3 reviews.',
    createdAt: '2026-05-01T10:30:00Z',
  },
  {
    id: 4,
    title: 'Test suite green',
    body: 'All 312 tests pass after dependency upgrade.',
    createdAt: '2026-05-01T11:45:00Z',
  },
  {
    id: 5,
    title: 'Database migrated',
    body: 'Added index on users.email for faster lookups.',
    createdAt: '2026-05-02T08:00:00Z',
  },
  {
    id: 6,
    title: 'API documented',
    body: 'Published OpenAPI spec to the internal dev portal.',
    createdAt: '2026-05-02T09:30:00Z',
  },
  {
    id: 7,
    title: 'Incident resolved',
    body: 'Upstream CDN outage cleared after 22 minutes.',
    createdAt: '2026-05-02T11:00:00Z',
  },
  {
    id: 8,
    title: 'Dependency updated',
    body: 'Bumped React from 18.2 to 18.3.',
    createdAt: '2026-05-02T13:00:00Z',
  },
  {
    id: 9,
    title: 'Code review completed',
    body: 'Reviewed and approved "Add pagination" PR.',
    createdAt: '2026-05-03T08:30:00Z',
  },
  {
    id: 10,
    title: 'Monitoring alert',
    body: 'p95 latency spike at 14:02 UTC — auto-scaled.',
    createdAt: '2026-05-03T09:00:00Z',
  },
  {
    id: 11,
    title: 'Feature flagged on',
    body: 'Enabled beta CSV export for 10% of users.',
    createdAt: '2026-05-03T10:15:00Z',
  },
  {
    id: 12,
    title: 'Sprint started',
    body: 'Sprint 42 kick-off: focus on accessibility.',
    createdAt: '2026-05-03T11:00:00Z',
  },
  {
    id: 13,
    title: 'Docs updated',
    body: 'Updated onboarding guide with new SSO steps.',
    createdAt: '2026-05-04T08:00:00Z',
  },
  {
    id: 14,
    title: 'Cache invalidated',
    body: 'Cleared stale product thumbnails from CDN.',
    createdAt: '2026-05-04T09:45:00Z',
  },
  {
    id: 15,
    title: 'Performance win',
    body: 'LCP improved from 3.2 s to 1.8 s after lazy-loading.',
    createdAt: '2026-05-04T11:30:00Z',
  },
  {
    id: 16,
    title: 'Security patch',
    body: 'Applied CVE-2026-1234 fix to image parser.',
    createdAt: '2026-05-04T13:00:00Z',
  },
  {
    id: 17,
    title: 'Hotfix shipped',
    body: 'Fixed broken checkout flow on Safari 17.',
    createdAt: '2026-05-05T08:15:00Z',
  },
  {
    id: 18,
    title: 'A/B test ended',
    body: 'Variant B wins: 12% higher signup rate.',
    createdAt: '2026-05-05T09:30:00Z',
  },
  {
    id: 19,
    title: 'Refactor merged',
    body: 'Extracted shared form hook into useFormField.',
    createdAt: '2026-05-05T11:00:00Z',
  },
  {
    id: 20,
    title: 'Lint rules updated',
    body: 'Enabled @typescript-eslint/no-floating-promises.',
    createdAt: '2026-05-05T13:30:00Z',
  },
  {
    id: 21,
    title: 'New hire onboarded',
    body: 'Welcomed Priya to the platform team.',
    createdAt: '2026-05-06T08:00:00Z',
  },
  {
    id: 22,
    title: 'API versioned',
    body: 'Released /api/v2/products with breaking changes.',
    createdAt: '2026-05-06T09:15:00Z',
  },
  {
    id: 23,
    title: 'E2E suite expanded',
    body: 'Added 15 Playwright tests for the checkout flow.',
    createdAt: '2026-05-06T10:45:00Z',
  },
  {
    id: 24,
    title: 'Staging deploy',
    body: 'Build #447 deployed to staging for QA sign-off.',
    createdAt: '2026-05-06T12:00:00Z',
  },
  {
    id: 25,
    title: 'PR opened',
    body: 'Opened "Add infinite scroll to activity feed".',
    createdAt: '2026-05-07T08:30:00Z',
  },
  {
    id: 26,
    title: 'Review requested',
    body: 'Requested review from @alex and @morgan.',
    createdAt: '2026-05-07T09:00:00Z',
  },
  {
    id: 27,
    title: 'CI fixed',
    body: 'Resolved flaky test by adding network idle wait.',
    createdAt: '2026-05-07T10:15:00Z',
  },
  {
    id: 28,
    title: 'Rollback executed',
    body: 'Reverted build #445 after memory regression.',
    createdAt: '2026-05-07T11:30:00Z',
  },
  {
    id: 29,
    title: 'Audit completed',
    body: 'WCAG 2.1 AA audit passed with 0 critical issues.',
    createdAt: '2026-05-08T08:00:00Z',
  },
  {
    id: 30,
    title: 'Load test passed',
    body: 'Sustained 5000 RPS for 10 minutes without errors.',
    createdAt: '2026-05-08T09:30:00Z',
  },
  {
    id: 31,
    title: 'Feature shipped',
    body: 'Launched real-time notifications to all users.',
    createdAt: '2026-05-08T11:00:00Z',
  },
  {
    id: 32,
    title: 'DB backup verified',
    body: 'Restored snapshot and confirmed data integrity.',
    createdAt: '2026-05-08T13:00:00Z',
  },
  {
    id: 33,
    title: 'Analytics integrated',
    body: 'Added event tracking for the new onboarding flow.',
    createdAt: '2026-05-09T08:15:00Z',
  },
  {
    id: 34,
    title: 'Config updated',
    body: 'Increased session TTL from 1 h to 8 h.',
    createdAt: '2026-05-09T09:45:00Z',
  },
  {
    id: 35,
    title: 'Image optimized',
    body: 'Converted hero images to AVIF — 40% smaller.',
    createdAt: '2026-05-09T11:15:00Z',
  },
  {
    id: 36,
    title: 'Rate limit raised',
    body: 'Bumped /api/export limit to 100 req/min.',
    createdAt: '2026-05-09T12:30:00Z',
  },
  {
    id: 37,
    title: 'OAuth provider added',
    body: 'Added GitHub login alongside Google SSO.',
    createdAt: '2026-05-10T08:00:00Z',
  },
  {
    id: 38,
    title: 'Alert silenced',
    body: 'Snoozed low-disk alert on log server for 24 h.',
    createdAt: '2026-05-10T09:30:00Z',
  },
  {
    id: 39,
    title: 'Schema validated',
    body: 'Added Zod validation to all POST endpoints.',
    createdAt: '2026-05-10T11:00:00Z',
  },
  {
    id: 40,
    title: 'Sprint closed',
    body: 'Sprint 42 complete: 18/20 story points delivered.',
    createdAt: '2026-05-10T13:00:00Z',
  },
  {
    id: 41,
    title: 'Canary promoted',
    body: 'Canary build promoted to stable after 48 h soak.',
    createdAt: '2026-05-11T08:30:00Z',
  },
  {
    id: 42,
    title: 'Dependency removed',
    body: 'Dropped lodash in favour of native array methods.',
    createdAt: '2026-05-11T10:00:00Z',
  },
];

const router = Router();

router.get('/', (req, res) => {
  const page = Math.max(1, Number(req.query['page']) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query['pageSize']) || 10));
  const total = FEED_ITEMS.length;
  const start = (page - 1) * pageSize;
  const items = FEED_ITEMS.slice(start, start + pageSize);
  const hasMore = start + pageSize < total;

  res.json({ items, page, pageSize, total, hasMore });
});

export default router;
