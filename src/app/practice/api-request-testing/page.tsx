import type { Metadata } from 'next';

import { ApiRequestTestingLab } from '@/features/practice-labs/api-request-testing/ApiRequestTestingLab';

export const metadata: Metadata = {
  title: 'API Request Testing Lab — Stagecraft',
  description:
    'Practice GET, POST, and DELETE requests with the Playwright request fixture. Assert JSON shape, status codes, and hybrid API-plus-UI flows.',
};

export default function ApiRequestTestingLabPage() {
  return <ApiRequestTestingLab />;
}
