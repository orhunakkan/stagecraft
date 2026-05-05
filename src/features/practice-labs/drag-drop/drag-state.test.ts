import { describe, expect, it } from 'vitest';

import {
  DEPLOYMENT_STEPS,
  INITIAL_ACTIVE,
  INITIAL_BACKLOG,
  moveCard,
  reorderItems,
} from './drag-state';

describe('reorderItems', () => {
  it('moves an item from a later index to an earlier index', () => {
    const result = reorderItems(['a', 'b', 'c', 'd'], 3, 0);
    expect(result).toEqual(['d', 'a', 'b', 'c']);
  });

  it('moves an item from an earlier index to a later index', () => {
    const result = reorderItems(['a', 'b', 'c', 'd'], 0, 3);
    expect(result).toEqual(['b', 'c', 'd', 'a']);
  });

  it('returns an identical array when fromIndex equals toIndex', () => {
    const result = reorderItems(['a', 'b', 'c'], 1, 1);
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the original array', () => {
    const original = ['a', 'b', 'c'];
    reorderItems(original, 0, 2);
    expect(original).toEqual(['a', 'b', 'c']);
  });

  it('handles a two-element swap', () => {
    const result = reorderItems(['a', 'b'], 1, 0);
    expect(result).toEqual(['b', 'a']);
  });

  it('works with DEPLOYMENT_STEPS data', () => {
    const result = reorderItems(DEPLOYMENT_STEPS, 4, 0);
    expect(result[0].id).toBe('step-prod');
    expect(result[1].id).toBe('step-build');
  });
});

describe('moveCard', () => {
  it('removes the card from source and appends it to dest', () => {
    const { source, dest } = moveCard(INITIAL_BACKLOG, INITIAL_ACTIVE, 'card-migrate');
    expect(source.map((c) => c.id)).not.toContain('card-migrate');
    expect(dest[dest.length - 1].id).toBe('card-migrate');
  });

  it('does not change arrays when cardId is not in source', () => {
    const { source, dest } = moveCard(INITIAL_BACKLOG, INITIAL_ACTIVE, 'card-smoke');
    // card-smoke is already in INITIAL_ACTIVE, not source — no change
    expect(source).toHaveLength(INITIAL_BACKLOG.length);
    expect(dest).toHaveLength(INITIAL_ACTIVE.length);
  });

  it('leaves source empty when the only card is moved', () => {
    const singleSource = [INITIAL_BACKLOG[0]];
    const { source } = moveCard(singleSource, [], singleSource[0].id);
    expect(source).toHaveLength(0);
  });

  it('does not mutate the original arrays', () => {
    const sourceSnapshot = INITIAL_BACKLOG.map((c) => c.id);
    const destSnapshot = INITIAL_ACTIVE.map((c) => c.id);
    moveCard(INITIAL_BACKLOG, INITIAL_ACTIVE, 'card-migrate');
    expect(INITIAL_BACKLOG.map((c) => c.id)).toEqual(sourceSnapshot);
    expect(INITIAL_ACTIVE.map((c) => c.id)).toEqual(destSnapshot);
  });

  it('preserves the order of remaining source items', () => {
    const { source } = moveCard(INITIAL_BACKLOG, INITIAL_ACTIVE, 'card-rollback');
    expect(source.map((c) => c.id)).toEqual(['card-migrate', 'card-notify']);
  });
});
