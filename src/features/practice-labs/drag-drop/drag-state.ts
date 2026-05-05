// Pure state-logic for the Drag-and-Drop Ordering Lab.
// All functions are side-effect free and independently testable.

// ─── Sortable list ────────────────────────────────────────────────────────────

export interface DeploymentStep {
  id: string;
  label: string;
  description: string;
}

export const DEPLOYMENT_STEPS: readonly DeploymentStep[] = [
  {
    id: 'step-build',
    label: 'Build artefacts',
    description: 'Compile source code and produce distributable bundles.',
  },
  {
    id: 'step-test',
    label: 'Run test suite',
    description: 'Execute unit, integration, and end-to-end tests.',
  },
  {
    id: 'step-scan',
    label: 'Security scan',
    description: 'Run static analysis and dependency vulnerability checks.',
  },
  {
    id: 'step-stage',
    label: 'Deploy to staging',
    description: 'Push artefacts to the staging environment.',
  },
  {
    id: 'step-prod',
    label: 'Promote to production',
    description: 'Run the release cut and update production traffic.',
  },
];

/**
 * Returns a new array with the item at `fromIndex` moved to `toIndex`.
 * The original array is not mutated.
 */
export function reorderItems<T>(items: readonly T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return [...items];
  const result = [...items];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

// ─── Kanban board ─────────────────────────────────────────────────────────────

export interface KanbanCard {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
}

export const INITIAL_BACKLOG: readonly KanbanCard[] = [
  { id: 'card-migrate', title: 'Database migration script', priority: 'High' },
  { id: 'card-rollback', title: 'Rollback runbook update', priority: 'Medium' },
  { id: 'card-notify', title: 'Stakeholder notification', priority: 'Low' },
];

export const INITIAL_ACTIVE: readonly KanbanCard[] = [
  { id: 'card-smoke', title: 'Post-deploy smoke tests', priority: 'High' },
  { id: 'card-metrics', title: 'Dashboard metrics review', priority: 'Medium' },
];

/**
 * Moves a card with the given `cardId` from `source` to `dest`.
 * Returns the updated source and dest arrays, or the originals if not found.
 */
export function moveCard(
  source: readonly KanbanCard[],
  dest: readonly KanbanCard[],
  cardId: string,
): { source: KanbanCard[]; dest: KanbanCard[] } {
  const card = source.find((c) => c.id === cardId);
  if (!card) return { source: [...source], dest: [...dest] };
  return {
    source: source.filter((c) => c.id !== cardId),
    dest: [...dest, card],
  };
}
