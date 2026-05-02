import type { Metadata } from 'next';

import { FramesContextsLab } from '@/features/practice-labs/frames-contexts/FramesContextsLab';

export const metadata: Metadata = {
  title: 'Frames and Contexts Lab — Stagecraft',
  description:
    'Practice iframe interactions and browser-context-like isolated state with deterministic local UI.',
};

export default function FramesContextsLabPage() {
  return <FramesContextsLab />;
}
