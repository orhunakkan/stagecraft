import type { Metadata } from 'next';

import { PageObjectsConcepts } from '@/features/practice-labs/page-objects/PageObjectsConcepts';

export const metadata: Metadata = {
  title: 'Page Object Model Lab — Stagecraft',
  description:
    'Concept practice: decide when to extract page objects, encapsulate locators and actions, and connect them to custom Playwright fixtures.',
};

export default function PageObjectsConceptPage() {
  return <PageObjectsConcepts />;
}
