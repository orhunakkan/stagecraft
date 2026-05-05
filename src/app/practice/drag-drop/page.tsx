import type { Metadata } from 'next';

import { DragDropLab } from '@/features/practice-labs/drag-drop/DragDropLab';

export const metadata: Metadata = {
  title: 'Drag-and-Drop Ordering Lab — Stagecraft',
  description:
    'Practice reordering deployment steps and moving Kanban cards between columns using locator.dragTo() in Playwright.',
};

export default function DragDropLabPage() {
  return <DragDropLab />;
}
