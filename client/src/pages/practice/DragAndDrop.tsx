import { useState, useRef } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'drag-and-drop')!;

// ── Types ────────────────────────────────────────────────────────────────────
interface KanbanCard {
  id: string;
  title: string;
}

type ColumnId = 'todo' | 'in-progress' | 'done';
interface Column {
  id: ColumnId;
  label: string;
  cards: KanbanCard[];
}

const INITIAL_COLUMNS: Column[] = [
  {
    id: 'todo',
    label: 'To Do',
    cards: [
      { id: 'c1', title: 'Write Playwright tests' },
      { id: 'c2', title: 'Review pull request' },
      { id: 'c3', title: 'Update documentation' },
    ],
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    cards: [
      { id: 'c4', title: 'Implement drag and drop' },
      { id: 'c5', title: 'Fix flaky tests' },
    ],
  },
  {
    id: 'done',
    label: 'Done',
    cards: [{ id: 'c6', title: 'Set up CI pipeline' }],
  },
];

const INITIAL_LIST = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];

// ── Kanban board ─────────────────────────────────────────────────────────────
function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const dragCard = useRef<{ cardId: string; fromCol: ColumnId } | null>(null);

  const handleDragStart = (cardId: string, colId: ColumnId) => {
    dragCard.current = { cardId, fromCol: colId };
  };

  const handleDrop = (toColId: ColumnId) => {
    if (!dragCard.current) return;
    const { cardId, fromCol } = dragCard.current;
    if (fromCol === toColId) return;

    setColumns((prev) => {
      const next = prev.map((col) => ({ ...col, cards: [...col.cards] }));
      const from = next.find((c) => c.id === fromCol)!;
      const to = next.find((c) => c.id === toColId)!;
      const cardIdx = from.cards.findIndex((c) => c.id === cardId);
      const [card] = from.cards.splice(cardIdx, 1);
      if (card) to.cards.push(card);
      return next;
    });
    dragCard.current = null;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {columns.map((col) => (
        <div
          key={col.id}
          data-column={col.id}
          aria-label={`${col.label} column`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(col.id)}
          className="w-56 shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 p-3"
        >
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {col.label}{' '}
            <span className="ml-1 rounded-full bg-zinc-200 px-1.5 py-0.5 text-xs">
              {col.cards.length}
            </span>
          </h3>
          <div className="space-y-2">
            {col.cards.map((card) => (
              <div
                key={card.id}
                draggable
                aria-label={card.title}
                data-card-id={card.id}
                onDragStart={() => handleDragStart(card.id, col.id)}
                className="cursor-grab rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-800 shadow-sm hover:border-indigo-300 active:cursor-grabbing"
              >
                {card.title}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── File drop zone ────────────────────────────────────────────────────────────
function FileDropZone() {
  const [droppedFile, setDroppedFile] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setDroppedFile(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  return (
    <div
      role="region"
      aria-label="File drop zone"
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      data-testid="drop-zone"
      className={[
        'flex h-28 flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors',
        over ? 'border-indigo-400 bg-indigo-50' : 'border-zinc-300 bg-zinc-50',
      ].join(' ')}
    >
      {droppedFile ? (
        <p className="text-sm font-medium text-zinc-700" data-testid="dropped-file">
          ✓ {droppedFile}
        </p>
      ) : (
        <>
          <p className="text-sm text-zinc-500">Drop a file here</p>
          <p className="mt-1 text-xs text-zinc-400">or use locator.drop() in Playwright</p>
        </>
      )}
    </div>
  );
}

// ── Sortable list ────────────────────────────────────────────────────────────
function SortableList() {
  const [items, setItems] = useState(INITIAL_LIST);
  const dragIdx = useRef<number | null>(null);

  const handleDragStart = (idx: number) => {
    dragIdx.current = idx;
  };

  const handleDrop = (toIdx: number) => {
    if (dragIdx.current === null || dragIdx.current === toIdx) return;
    const next = [...items];
    const [item] = next.splice(dragIdx.current, 1);
    if (item !== undefined) next.splice(toIdx, 0, item);
    setItems(next);
    dragIdx.current = null;
  };

  return (
    <ol aria-label="Sortable list" className="space-y-2">
      {items.map((item, idx) => (
        <li
          key={item}
          draggable
          aria-label={item}
          data-testid={`sort-item-${item.toLowerCase()}`}
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(idx)}
          className="flex cursor-grab items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:border-indigo-300 active:cursor-grabbing"
        >
          <span className="text-zinc-300">⠿</span>
          {item}
        </li>
      ))}
    </ol>
  );
}

export function DragAndDrop() {
  return (
    <div>
      <LabHeader lab={lab} />

      <p className="mb-8 text-sm text-zinc-500">
        Three challenge tiers:{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">locator.dragTo()</code> for
        element-to-element, <code className="rounded bg-zinc-100 px-1 text-xs">locator.drop()</code>{' '}
        for file drops with a synthetic{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">DataTransfer</code>, and raw{' '}
        <code className="rounded bg-zinc-100 px-1 text-xs">dispatchEvent</code> for sortable lists.
      </p>

      <div className="space-y-10">
        <section aria-labelledby="kanban-heading">
          <h2 id="kanban-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Challenge 1 — Kanban board
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Drag a card from one column to another using{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">locator.dragTo()</code>. Assert that
            the card appears in the destination column and is gone from the source.
          </p>
          <KanbanBoard />
        </section>

        <section aria-labelledby="dropzone-heading">
          <h2 id="dropzone-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Challenge 2 — File drop zone
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Construct a <code className="rounded bg-zinc-100 px-1 text-xs">DataTransfer</code> with
            a file buffer in the page context and call{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">
              locator.drop(&#123; dataTransfer &#125;)
            </code>
            . Assert the filename appears.
          </p>
          <FileDropZone />
        </section>

        <section aria-labelledby="sortable-heading">
          <h2 id="sortable-heading" className="mb-1 text-base font-semibold text-zinc-900">
            Challenge 3 — Sortable list
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Reorder items by dragging. Assert the new order with{' '}
            <code className="rounded bg-zinc-100 px-1 text-xs">
              expect(locator).toHaveText(expectedOrder)
            </code>
            .
          </p>
          <SortableList />
        </section>
      </div>
    </div>
  );
}
