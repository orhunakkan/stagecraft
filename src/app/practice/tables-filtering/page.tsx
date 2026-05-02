import type { Metadata } from 'next';

import { TablesFilteringLab } from '@/features/practice-labs/tables-filtering/TablesFilteringLab';

export const metadata: Metadata = {
  title: 'Tables and Filtering Lab — Stagecraft',
  description:
    'Practice search, sort, filter, pagination, empty results, and row-level actions on deterministic table data.',
};

export default function TablesFilteringLabPage() {
  return <TablesFilteringLab />;
}
