import type { Metadata } from 'next';

import { FormsValidationLab } from '@/features/practice-labs/forms-validation/FormsValidationLab';

export const metadata: Metadata = {
  title: 'Forms and Validation Lab — Stagecraft',
  description:
    'Practice automating labeled form controls, validation messages, disabled/enabled states, and successful submission feedback.',
};

export default function FormsValidationLabPage() {
  return <FormsValidationLab />;
}
