import type { Metadata } from 'next';

import { ClockTimeLab } from '@/features/practice-labs/clock-time/ClockTimeLab';

export const metadata: Metadata = {
  title: 'Clock and Time Control Lab — Stagecraft',
  description:
    'Practice freezing Date.now(), fast-forwarding countdowns, and triggering scheduled refreshes with page.clock.',
};

export default function ClockTimeLabPage() {
  return <ClockTimeLab />;
}
