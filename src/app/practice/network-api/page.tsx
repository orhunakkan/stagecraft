import type { Metadata } from 'next';

import { NetworkApiLab } from '@/features/practice-labs/network-api/NetworkApiLab';

export const metadata: Metadata = {
  title: 'Network API Lab — Stagecraft',
  description:
    'Practice deterministic API-backed UI behavior, request observation, response checking, and route mocking.',
};

export default function NetworkApiLabPage() {
  return <NetworkApiLab />;
}
