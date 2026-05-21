import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { EmulationInput } from '../../src/pages/practice/EmulationInput';
import { DragAndDrop } from '../../src/pages/practice/DragAndDrop';

function wrap(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

afterEach(() => {
  cleanup();
});

describe('EmulationInput tokens', () => {
  test('section headings use text-content instead of text-zinc-900', () => {
    wrap(<EmulationInput />);
    const heading = screen.getByRole('heading', { name: /Keyboard/i });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('open palette button uses bg-surface instead of bg-white', () => {
    wrap(<EmulationInput />);
    const btn = screen.getByRole('button', { name: /Open command palette/i });
    expect(btn.className).toContain('bg-surface');
    expect(btn.className).not.toContain('bg-white');
  });

  test('kbd elements use bg-surface-raised instead of bg-zinc-100', () => {
    const { container } = wrap(<EmulationInput />);
    const kbdElements = container.querySelectorAll('kbd');
    expect(kbdElements.length).toBeGreaterThan(0);
    expect(kbdElements[0]?.className).toContain('bg-surface-raised');
    expect(kbdElements[0]?.className).not.toContain('bg-zinc-100');
  });
});

describe('DragAndDrop tokens', () => {
  test('section headings use text-content instead of text-zinc-900', () => {
    wrap(<DragAndDrop />);
    const heading = screen.getByRole('heading', { name: /Kanban board/i });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('kanban columns use bg-canvas instead of bg-zinc-50', () => {
    const { container } = wrap(<DragAndDrop />);
    const columns = container.querySelectorAll('[data-column]');
    expect(columns.length).toBeGreaterThan(0);
    expect(columns[0]?.className).toContain('bg-canvas');
    expect(columns[0]?.className).not.toContain('bg-zinc-50');
  });

  test('kanban cards use bg-surface instead of bg-white', () => {
    const { container } = wrap(<DragAndDrop />);
    const cards = container.querySelectorAll('[data-card-id]');
    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0]?.className).toContain('bg-surface');
    expect(cards[0]?.className).not.toContain('bg-white');
  });

  test('sortable list items use bg-surface instead of bg-white', () => {
    const { container } = wrap(<DragAndDrop />);
    const items = container.querySelectorAll('[data-testid^="sort-item-"]');
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.className).toContain('bg-surface');
    expect(items[0]?.className).not.toContain('bg-white');
  });
});
