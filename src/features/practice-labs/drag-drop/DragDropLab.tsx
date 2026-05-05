'use client';

import { useRef, useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';
import {
  DEPLOYMENT_STEPS,
  INITIAL_ACTIVE,
  INITIAL_BACKLOG,
  moveCard,
  reorderItems,
  type DeploymentStep,
  type KanbanCard,
} from './drag-state';

const CHALLENGE_ID = 'drag-drop';
const OBJECTIVE =
  'Use locator.dragTo() to trigger drag-and-drop interactions and verify the resulting list order and column membership using visible user-facing content.';

// ─── Top-level lab component ───────────────────────────────────────────────────

export function DragDropLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Drag-and-Drop Ordering Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <DragDropContent key={resetKey} />
    </PracticeLabLayout>
  );
}

// ─── Content — remounted on reset ─────────────────────────────────────────────

function DragDropContent() {
  return (
    <div className="space-y-8">
      <SortableStepsSection />
      <KanbanBoardSection />
    </div>
  );
}

// ─── Section 1: Sortable deployment steps ────────────────────────────────────

function SortableStepsSection() {
  const [steps, setSteps] = useState<DeploymentStep[]>([...DEPLOYMENT_STEPS]);
  const draggedId = useRef<string | null>(null);

  function handleDragStart(id: string) {
    draggedId.current = id;
  }

  function handleDragOver(e: React.DragEvent) {
    // Required to allow the drop to register
    e.preventDefault();
  }

  function handleDrop(targetId: string) {
    const sourceId = draggedId.current;
    if (!sourceId || sourceId === targetId) {
      draggedId.current = null;
      return;
    }
    const fromIndex = steps.findIndex((s) => s.id === sourceId);
    const toIndex = steps.findIndex((s) => s.id === targetId);
    if (fromIndex !== -1 && toIndex !== -1) {
      setSteps(reorderItems(steps, fromIndex, toIndex));
    }
    draggedId.current = null;
  }

  function handleDragEnd() {
    draggedId.current = null;
  }

  return (
    <section aria-label="Deployment steps section" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 1 — Sortable Deployment Steps
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Five deployment steps in a required order. Drag a step to a new position and verify the
          list reflects the change. Use{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">locator.dragTo()</code>{' '}
          to move items and then assert the visible order.
        </p>
      </div>

      <ol aria-label="Deployment steps" className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={step.id}
            draggable
            onDragStart={() => handleDragStart(step.id)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(step.id)}
            onDragEnd={handleDragEnd}
            aria-label={step.label}
            data-step-id={step.id}
            className="flex cursor-grab items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition hover:border-ring/40 hover:shadow-sm active:cursor-grabbing"
          >
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-black text-muted-foreground"
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-card-foreground">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
            <span aria-hidden="true" className="shrink-0 text-muted-foreground">
              ⠿
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ─── Section 2: Kanban board ──────────────────────────────────────────────────

const PRIORITY_STYLES: Record<KanbanCard['priority'], string> = {
  High: 'border-danger/40 bg-danger/10 text-danger',
  Medium: 'border-warning/40 bg-warning/10 text-warning-foreground',
  Low: 'border-border bg-muted/30 text-muted-foreground',
};

function KanbanBoardSection() {
  const [backlog, setBacklog] = useState<KanbanCard[]>([...INITIAL_BACKLOG]);
  const [active, setActive] = useState<KanbanCard[]>([...INITIAL_ACTIVE]);
  const draggedCardId = useRef<string | null>(null);

  function handleCardDragStart(id: string) {
    draggedCardId.current = id;
  }

  function handleColumnDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDropOnBacklog() {
    const id = draggedCardId.current;
    if (!id) return;
    const inActive = active.some((c) => c.id === id);
    if (inActive) {
      const { source, dest } = moveCard(active, backlog, id);
      setActive(source);
      setBacklog(dest);
    }
    draggedCardId.current = null;
  }

  function handleDropOnActive() {
    const id = draggedCardId.current;
    if (!id) return;
    const inBacklog = backlog.some((c) => c.id === id);
    if (inBacklog) {
      const { source, dest } = moveCard(backlog, active, id);
      setBacklog(source);
      setActive(dest);
    }
    draggedCardId.current = null;
  }

  return (
    <section aria-label="Kanban board section" className="stage-card p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black tracking-tight text-card-foreground">
          Scenario 2 — Kanban Board
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Drag cards between the Backlog and Active columns. After a drag, verify the column card
          counts and that the card appears in the correct column.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Backlog column */}
        <div
          onDragOver={handleColumnDragOver}
          onDrop={handleDropOnBacklog}
          aria-label={`Backlog column — ${String(backlog.length)} card${backlog.length !== 1 ? 's' : ''}`}
          className="min-h-48 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-4 space-y-3 transition"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Backlog
            </h3>
            <span
              aria-label={`${String(backlog.length)} card${backlog.length !== 1 ? 's' : ''} in Backlog`}
              className="rounded-full border border-border bg-card px-2 py-0.5 text-xs font-bold text-muted-foreground"
            >
              {backlog.length}
            </span>
          </div>

          {backlog.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-6">
              No cards in Backlog
            </p>
          )}

          {backlog.map((card) => (
            <KanbanCardItem
              key={card.id}
              card={card}
              onDragStart={handleCardDragStart}
            />
          ))}
        </div>

        {/* Active column */}
        <div
          onDragOver={handleColumnDragOver}
          onDrop={handleDropOnActive}
          aria-label={`Active column — ${String(active.length)} card${active.length !== 1 ? 's' : ''}`}
          className="min-h-48 rounded-2xl border-2 border-dashed border-secondary/40 bg-secondary/5 p-4 space-y-3 transition"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-secondary">
              Active
            </h3>
            <span
              aria-label={`${String(active.length)} card${active.length !== 1 ? 's' : ''} in Active`}
              className="rounded-full border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-xs font-bold text-secondary"
            >
              {active.length}
            </span>
          </div>

          {active.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-6">
              No cards in Active
            </p>
          )}

          {active.map((card) => (
            <KanbanCardItem
              key={card.id}
              card={card}
              onDragStart={handleCardDragStart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Kanban card item ─────────────────────────────────────────────────────────

interface KanbanCardItemProps {
  card: KanbanCard;
  onDragStart: (id: string) => void;
}

function KanbanCardItem({ card, onDragStart }: KanbanCardItemProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(card.id)}
      aria-label={card.title}
      data-card-id={card.id}
      className="flex cursor-grab items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition hover:border-ring/40 active:cursor-grabbing"
    >
      <p className="text-sm font-semibold text-card-foreground">{card.title}</p>
      <span
        className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-bold ${PRIORITY_STYLES[card.priority]}`}
        aria-label={`Priority: ${card.priority}`}
      >
        {card.priority}
      </span>
    </div>
  );
}
