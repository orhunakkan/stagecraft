export type TaskStatus = 'pending' | 'in-progress' | 'done' | 'blocked';
export type TaskPriority = 'high' | 'medium' | 'low';
export type SortField = 'name' | 'status' | 'priority' | 'assignee';
export type SortDirection = 'asc' | 'desc';

export interface ReleaseTask {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
}

export interface TableFilters {
  search?: string;
  status?: TaskStatus | '';
}

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export interface PaginationResult {
  items: readonly ReleaseTask[];
  totalPages: number;
  totalItems: number;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In progress',
  done: 'Done',
  blocked: 'Blocked',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/** Deterministic dataset — 10 release tasks, 2 pages of 5 at default page size. */
export const RELEASE_TASKS: readonly ReleaseTask[] = [
  { id: '1', name: 'Update login page', status: 'done', priority: 'high', assignee: 'Alice' },
  { id: '2', name: 'Fix cart calculation', status: 'in-progress', priority: 'high', assignee: 'Bob' },
  { id: '3', name: 'Add dark mode toggle', status: 'pending', priority: 'medium', assignee: 'Carol' },
  { id: '4', name: 'Resolve checkout error', status: 'blocked', priority: 'high', assignee: 'Dave' },
  { id: '5', name: 'Write API docs', status: 'pending', priority: 'low', assignee: 'Eve' },
  { id: '6', name: 'Migrate to new auth', status: 'in-progress', priority: 'high', assignee: 'Alice' },
  { id: '7', name: 'Performance audit', status: 'pending', priority: 'medium', assignee: 'Bob' },
  { id: '8', name: 'Fix image upload bug', status: 'done', priority: 'medium', assignee: 'Carol' },
  { id: '9', name: 'Security headers check', status: 'in-progress', priority: 'high', assignee: 'Dave' },
  { id: '10', name: 'Release notes draft', status: 'done', priority: 'low', assignee: 'Eve' },
] as const;

export const PAGE_SIZE = 5;

/**
 * Returns tasks matching the given search term (name or assignee) and status.
 * An empty or omitted filter value matches all tasks.
 */
export function filterTasks(
  tasks: readonly ReleaseTask[],
  filters: TableFilters,
): readonly ReleaseTask[] {
  const search = (filters.search ?? '').trim().toLowerCase();
  const status = filters.status ?? '';

  return tasks.filter((task) => {
    const matchesSearch = search
      ? task.name.toLowerCase().includes(search) ||
        task.assignee.toLowerCase().includes(search)
      : true;
    const matchesStatus = status ? task.status === status : true;
    return matchesSearch && matchesStatus;
  });
}

/**
 * Returns a new sorted array without mutating the input.
 * Comparison uses localeCompare for consistent string ordering.
 */
export function sortTasks(
  tasks: readonly ReleaseTask[],
  sort: SortState,
): readonly ReleaseTask[] {
  return [...tasks].sort((a, b) => {
    const cmp = a[sort.field].localeCompare(b[sort.field]);
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}

/**
 * Returns the items for a given page, the total number of pages, and the
 * total number of items before pagination.
 */
export function paginateTasks(
  tasks: readonly ReleaseTask[],
  page: number,
  pageSize: number,
): PaginationResult {
  const totalItems = tasks.length;
  const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0;
  const start = (page - 1) * pageSize;
  const items = tasks.slice(start, start + pageSize);
  return { items, totalPages, totalItems };
}
