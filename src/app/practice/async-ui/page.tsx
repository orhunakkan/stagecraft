import type { Metadata } from 'next';

import { AsyncUiLab } from '@/features/practice-labs/async-ui/AsyncUiLab';

export const metadata: Metadata = {
  title: 'Async UI Lab — Stagecraft',
  description:
    'Practice loading states, delayed UI updates, retry behavior, and web-first assertions without fixed time delays.',
};

export default function AsyncUiLabPage() {
  return <AsyncUiLab />;
}
