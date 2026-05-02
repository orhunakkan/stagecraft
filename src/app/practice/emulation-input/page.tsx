import type { Metadata } from 'next';

import { EmulationInputLab } from '@/features/practice-labs/emulation-input/EmulationInputLab';

export const metadata: Metadata = {
  title: 'Emulation and Input Lab — Stagecraft',
  description:
    'Practice viewport-aware behavior, keyboard input, pointer interactions, and touch-friendly controls.',
};

export default function EmulationInputLabPage() {
  return <EmulationInputLab />;
}
