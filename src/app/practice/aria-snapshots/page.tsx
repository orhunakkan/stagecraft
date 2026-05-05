import type { Metadata } from 'next';

import { AriaSnapshotsLab } from '@/features/practice-labs/aria-snapshots/AriaSnapshotsLab';

export const metadata: Metadata = {
  title: 'ARIA Snapshots Lab — Stagecraft',
  description:
    'Practice verifying the structural accessibility tree of navigation, feature lists, and collapsible FAQ regions using toMatchAriaSnapshot.',
};

export default function AriaSnapshotsLabPage() {
  return <AriaSnapshotsLab />;
}
