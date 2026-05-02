import type { Metadata } from 'next';

import { DebuggingReportingConcepts } from '@/features/practice-labs/debugging-reporting/DebuggingReportingConcepts';

export const metadata: Metadata = {
  title: 'Debugging and Reporting Concepts — Stagecraft',
  description:
    'Practice planning trace, screenshot, video, retry, timeout, annotation, and reporting strategies.',
};

export default function DebuggingReportingConceptPage() {
  return <DebuggingReportingConcepts />;
}
