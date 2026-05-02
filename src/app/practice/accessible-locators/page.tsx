import type { Metadata } from 'next';

import { AccessibleLocatorsLab } from '@/features/practice-labs/accessible-locators/AccessibleLocatorsLab';

export const metadata: Metadata = {
  title: 'Accessible Locators Lab — Stagecraft',
  description:
    'Practice identifying interactive and descriptive elements by user-facing semantics: roles, labels, alt text, titles, and visible text.',
};

export default function AccessibleLocatorsLabPage() {
  return <AccessibleLocatorsLab />;
}
