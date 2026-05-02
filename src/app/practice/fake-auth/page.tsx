import type { Metadata } from 'next';

import { FakeAuthLab } from '@/features/practice-labs/fake-auth/FakeAuthLab';

export const metadata: Metadata = {
  title: 'Fake Auth Session Lab — Stagecraft',
  description:
    'Practice safe login-like flows, redirects, logout, and reusable browser state without real credentials.',
};

export default function FakeAuthLabPage() {
  return <FakeAuthLab />;
}
