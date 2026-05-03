'use client';

import { useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';
import {
  filterTasks,
  PAGE_SIZE,
  paginateTasks,
  PRIORITY_LABELS,
  RELEASE_TASKS,
  sortTasks,
  STATUS_LABELS,
  type ReleaseTask,
  type SortDirection,
  type SortField,
  type SortState,
  type TaskStatus,
} from './table-data';

// ─── Sortable column header ───────────────────────────────────────────────────

interface SortableColumnHeaderProps {
  field: SortField;
  label: string;
  sort: SortState | null;
  onSort: (field: SortField) => void;
}

function SortableColumnHeader({ field, label, sort, onSort }: SortableColumnHeaderProps) {
  const isActive = sort?.field === field;
  const indicator = isActive ? (sort!.direction === 'asc' ? ' ↑' : ' ↓') : '';
  const sortDescription = isActive
    ? ` (sorted ${sort!.direction === 'asc' ? 'ascending' : 'descending'})`
    : '';
  return (
    <th scope="col" className="px-4 py-3 text-left font-black text-card-foreground">
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 transition hover:text-primary focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`Sort by ${label.toLowerCase()}${sortDescription}`}
      >
        {label}{indicator}
      </button>
    </th>
  );
}

const CHALLENGE_ID = 'tables-filtering';
const OBJECTIVE =
  'Scope checks to the row, list, or table region that matters so tests verify the correct item without relying on fragile DOM traversal.';

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'border-warning/40 bg-warning/12 text-warning-foreground',
  'in-progress': 'border-secondary/40 bg-secondary/12 text-secondary',
  done: 'border-success/40 bg-success/12 text-success',
  blocked: 'border-danger/40 bg-danger/12 text-danger',
};

export function TablesFilteringLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Tables and Filtering Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <TablesFilteringContent key={resetKey} />
    </PracticeLabLayout>
  );
}

function TablesFilteringContent() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, TaskStatus>>({});
  const [viewingTask, setViewingTask] = useState<ReleaseTask | null>(null);

  const tasksWithOverrides = RELEASE_TASKS.map((t) => ({
    ...t,
    status: (statusOverrides[t.id] ?? t.status) as TaskStatus,
  }));

  const filtered = filterTasks(tasksWithOverrides, { search, status: statusFilter });
  const sorted = sort ? sortTasks(filtered, sort) : filtered;
  const { items: pageItems, totalPages, totalItems } = paginateTasks(sorted, page, PAGE_SIZE);

  function handleSort(field: SortField): void {
    setSort((prev) => {
      if (prev?.field === field) {
        const next: SortDirection = prev.direction === 'asc' ? 'desc' : 'asc';
        return { field, direction: next };
      }
      return { field, direction: 'asc' };
    });
    setPage(1);
  }

  function handleMarkComplete(id: string): void {
    setStatusOverrides((prev) => ({ ...prev, [id]: 'done' }));
  }

  function handleClearFilters(): void {
    setSearch('');
    setStatusFilter('');
    setPage(1);
  }

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="stage-card flex flex-wrap items-end gap-4 p-5">
        <div className="min-w-48 flex-1">
          <label
            htmlFor="task-search"
            className="mb-1.5 block text-sm font-bold text-card-foreground"
          >
            Search tasks
          </label>
          <input
            id="task-search"
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Task name or assignee"
            aria-label="Search tasks"
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
          />
        </div>

        <div>
          <label
            htmlFor="status-filter"
            className="mb-1.5 block text-sm font-bold text-card-foreground"
          >
            Filter by status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as TaskStatus | '');
              setPage(1);
            }}
            aria-label="Filter by status"
            className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleClearFilters}
          className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-black text-card-foreground transition hover:border-ring hover:bg-muted focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Clear filters
        </button>
      </div>

      {/* Result count */}
      <p aria-live="polite" className="text-sm font-black text-card-foreground">
        {totalItems === 0
          ? 'No tasks match your filters'
          : `${totalItems} task${totalItems === 1 ? '' : 's'} — page ${page} of ${totalPages}`}
      </p>

      {/* Table */}
      <div className="stage-card overflow-x-auto">
        <table className="w-full text-sm" aria-label="Release tasks">
          <thead className="border-b border-border">
            <tr>
              <SortableColumnHeader field="name" label="Task" sort={sort} onSort={handleSort} />
              <SortableColumnHeader field="status" label="Status" sort={sort} onSort={handleSort} />
              <th scope="col" className="px-4 py-3 text-left font-black text-card-foreground">
                Priority
              </th>
              <th scope="col" className="px-4 py-3 text-left font-black text-card-foreground">
                Assignee
              </th>
              <th scope="col" className="px-4 py-3 text-left font-black text-card-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <div role="status" className="text-muted-foreground">
                    No tasks match your filters. Try a different search term or clear the filters.
                  </div>
                </td>
              </tr>
            ) : (
              pageItems.map((task) => (
                <tr
                  key={task.id}
                  aria-label={task.name}
                  className="transition hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-semibold text-card-foreground">{task.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${STATUS_COLORS[task.status]}`}
                    >
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {PRIORITY_LABELS[task.priority]}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{task.assignee}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingTask(task)}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-muted-foreground transition hover:border-ring hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        View details
                      </button>
                      {task.status !== 'done' && (
                        <button
                          type="button"
                          onClick={() => handleMarkComplete(task.id)}
                          className="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-bold text-success transition hover:bg-success/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          Mark complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Table pagination" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              aria-label="Previous page"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-card-foreground transition enabled:hover:border-ring disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              ← Previous page
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              aria-label="Next page"
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold text-card-foreground transition enabled:hover:border-ring disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Next page →
            </button>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            Page {page} of {totalPages}
          </p>
        </nav>
      )}

      {/* Task detail panel */}
      {viewingTask && (
        <section
          aria-label="Task details"
          className="stage-card p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="stage-badge mb-3">Task detail</p>
              <h3 className="text-xl font-black tracking-tight text-card-foreground">
                {viewingTask.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setViewingTask(null)}
              aria-label="Close task details"
              className="rounded-full border border-border p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span aria-hidden="true" className="block text-base leading-none">×</span>
            </button>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Status', value: STATUS_LABELS[viewingTask.status] },
              { label: 'Priority', value: PRIORITY_LABELS[viewingTask.priority] },
              { label: 'Assignee', value: viewingTask.assignee },
              { label: 'ID', value: `TASK-${viewingTask.id.padStart(3, '0')}` },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 font-semibold text-card-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
