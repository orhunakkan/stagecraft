import type { Metadata } from 'next';

import { MockBrowserApisLab } from '@/features/practice-labs/mock-browser-apis/MockBrowserApisLab';

export const metadata: Metadata = {
  title: 'Mock Browser APIs Lab — Stagecraft',
  description:
    'Practice injecting mock geolocation, network status, and user preferences with page.addInitScript() before the page loads.',
};

export default function MockBrowserApisLabPage() {
  return <MockBrowserApisLab />;
}
