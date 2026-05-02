import { describe, expect, it } from 'vitest';

import {
  filterTasks,
  paginateTasks,
  RELEASE_TASKS,
  sortTasks,
  type SortState,
} from './table-data';

describe('filterTasks', () => {
  it('returns all tasks when no filters are active', () => {
    expect(filterTasks(RELEASE_TASKS, {})).toHaveLength(RELEASE_TASKS.length);
  });

  it('filters by search term matching task name (case-insensitive)', () => {
    const result = filterTasks(RELEASE_TASKS, { search: 'fix' });
    expect(result.length).toBeGreaterThanOrEqual(1);
    for (const task of result) {
      expect(task.name.toLowerCase()).toContain('fix');
    }
  });

  it('filters by search term matching assignee name', () => {
    const result = filterTasks(RELEASE_TASKS, { search: 'alice' });
    expect(result.length).toBeGreaterThanOrEqual(1);
    for (const task of result) {
      expect(task.assignee.toLowerCase()).toContain('alice');
    }
  });

  it('filters by status', () => {
    const result = filterTasks(RELEASE_TASKS, { status: 'blocked' });
    expect(result.length).toBeGreaterThanOrEqual(1);
    for (const task of result) {
      expect(task.status).toBe('blocked');
    }
  });

  it('combines search and status filters', () => {
    const result = filterTasks(RELEASE_TASKS, { search: 'fix', status: 'in-progress' });
    for (const task of result) {
      expect(task.name.toLowerCase()).toContain('fix');
      expect(task.status).toBe('in-progress');
    }
  });

  it('returns an empty array when no tasks match', () => {
    expect(filterTasks(RELEASE_TASKS, { search: 'zzznomatch' })).toHaveLength(0);
  });

  it('returns an empty array when filtering on an unmatched status', () => {
    const result = filterTasks([], { status: 'blocked' });
    expect(result).toHaveLength(0);
  });
});

describe('sortTasks', () => {
  it('sorts by name ascending', () => {
    const sort: SortState = { field: 'name', direction: 'asc' };
    const result = sortTasks(RELEASE_TASKS, sort);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].name.localeCompare(result[i + 1].name)).toBeLessThanOrEqual(0);
    }
  });

  it('sorts by name descending', () => {
    const sort: SortState = { field: 'name', direction: 'desc' };
    const result = sortTasks(RELEASE_TASKS, sort);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].name.localeCompare(result[i + 1].name)).toBeGreaterThanOrEqual(0);
    }
  });

  it('sorts by status ascending', () => {
    const sort: SortState = { field: 'status', direction: 'asc' };
    const result = sortTasks(RELEASE_TASKS, sort);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].status.localeCompare(result[i + 1].status)).toBeLessThanOrEqual(0);
    }
  });

  it('does not mutate the original array', () => {
    const original = [...RELEASE_TASKS];
    sortTasks(RELEASE_TASKS, { field: 'name', direction: 'asc' });
    expect(RELEASE_TASKS[0]).toEqual(original[0]);
  });
});

describe('paginateTasks', () => {
  it('returns the correct slice for page 1', () => {
    const { items, totalPages } = paginateTasks(RELEASE_TASKS, 1, 5);
    expect(items).toHaveLength(5);
    expect(items[0]).toEqual(RELEASE_TASKS[0]);
    expect(totalPages).toBe(Math.ceil(RELEASE_TASKS.length / 5));
  });

  it('returns the correct slice for page 2', () => {
    const { items } = paginateTasks(RELEASE_TASKS, 2, 5);
    expect(items).toHaveLength(5);
    expect(items[0]).toEqual(RELEASE_TASKS[5]);
  });

  it('returns fewer items on the last partial page', () => {
    // 10 items with pageSize=3 → 4 pages; last page has 10 mod 3 = 1 item
    const { items, totalPages } = paginateTasks(RELEASE_TASKS, 4, 3);
    expect(items).toHaveLength(1);
    expect(totalPages).toBe(4);
  });

  it('returns empty items and zero total pages for an empty list', () => {
    const { items, totalPages, totalItems } = paginateTasks([], 1, 5);
    expect(items).toHaveLength(0);
    expect(totalPages).toBe(0);
    expect(totalItems).toBe(0);
  });

  it('exposes totalItems for display in UI', () => {
    const { totalItems } = paginateTasks(RELEASE_TASKS, 1, 5);
    expect(totalItems).toBe(RELEASE_TASKS.length);
  });
});
