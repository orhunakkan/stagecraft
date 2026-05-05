import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DragDropLab } from './DragDropLab';

function setup() {
  render(<DragDropLab />);
}

describe('DragDropLab', () => {
  it('renders the lab heading', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 1, name: /drag-and-drop ordering lab/i }),
    ).toBeVisible();
  });

  it('shows both scenario sections', () => {
    setup();
    expect(screen.getByRole('region', { name: /deployment steps section/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /kanban board section/i })).toBeVisible();
  });

  // ── Scenario 1: Sortable steps ────────────────────────────────────────────

  it('renders the deployment steps ordered list', () => {
    setup();
    expect(screen.getByRole('list', { name: /deployment steps/i })).toBeVisible();
  });

  it('shows all five deployment steps', () => {
    setup();
    expect(screen.getByRole('listitem', { name: /build artefacts/i })).toBeVisible();
    expect(screen.getByRole('listitem', { name: /run test suite/i })).toBeVisible();
    expect(screen.getByRole('listitem', { name: /security scan/i })).toBeVisible();
    expect(screen.getByRole('listitem', { name: /deploy to staging/i })).toBeVisible();
    expect(screen.getByRole('listitem', { name: /promote to production/i })).toBeVisible();
  });

  it('renders all steps as draggable', () => {
    setup();
    const items = screen.getAllByRole('listitem');
    // The ordered list items (there are 5 step items)
    const draggableItems = items.filter(
      (el) => el.getAttribute('draggable') === 'true',
    );
    expect(draggableItems.length).toBe(5);
  });

  // ── Scenario 2: Kanban board ──────────────────────────────────────────────

  it('renders Backlog and Active columns', () => {
    setup();
    expect(screen.getByLabelText(/backlog column/i)).toBeVisible();
    expect(screen.getByLabelText(/active column/i)).toBeVisible();
  });

  it('shows the initial Backlog card count as 3', () => {
    setup();
    expect(screen.getByLabelText(/3 cards in backlog/i)).toBeVisible();
  });

  it('shows the initial Active card count as 2', () => {
    setup();
    expect(screen.getByLabelText(/2 cards in active/i)).toBeVisible();
  });

  it('shows all initial Backlog cards', () => {
    setup();
    expect(screen.getByLabelText('Database migration script')).toBeVisible();
    expect(screen.getByLabelText('Rollback runbook update')).toBeVisible();
    expect(screen.getByLabelText('Stakeholder notification')).toBeVisible();
  });

  it('shows all initial Active cards', () => {
    setup();
    expect(screen.getByLabelText('Post-deploy smoke tests')).toBeVisible();
    expect(screen.getByLabelText('Dashboard metrics review')).toBeVisible();
  });

  it('renders Kanban cards as draggable', () => {
    setup();
    // 5 deployment step items + 5 kanban cards, all draggable
    const draggable = Array.from(document.querySelectorAll('[draggable="true"]'));
    expect(draggable.length).toBeGreaterThanOrEqual(8); // 5 steps + 3 backlog + (2 active but drag is on the card)
  });

  // ── Reset ─────────────────────────────────────────────────────────────────

  it('shows the reset lab button', () => {
    setup();
    expect(screen.getByRole('button', { name: /reset lab/i })).toBeVisible();
  });
});
