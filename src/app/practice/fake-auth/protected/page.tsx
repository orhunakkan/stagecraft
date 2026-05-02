import type { Metadata } from 'next';

import { FakeProtectedPage } from '@/features/practice-labs/fake-auth/FakeProtectedPage';

export const metadata: Metadata = {
  title: 'Protected Area — Fake Auth Session Lab — Stagecraft',
  description:
    'The protected practice area. Sign in with the fake learner credentials to access this page.',
};

export default function FakeProtectedLabPage() {
  return <FakeProtectedPage />;
}
