import type { Metadata } from 'next';

import { BrowserEventsLab } from '@/features/practice-labs/browser-events/BrowserEventsLab';

export const metadata: Metadata = {
  title: 'Browser Events Lab — Stagecraft',
  description:
    'Practice handling native browser dialogs, asserting download events, and interacting with file upload inputs.',
};

export default function BrowserEventsLabPage() {
  return <BrowserEventsLab />;
}
