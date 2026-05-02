import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TablesFilteringLab } from './TablesFilteringLab';

describe('TablesFilteringLab', () => {
  it('renders the table with all 5 rows on the first page', () => {
    render(<TablesFilteringLab />);

    const table = screen.getByRole('table');
    // 5 data rows + 1 header row
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(6);
  });

  it('shows all four column headers', () => {
    render(<TablesFilteringLab />);

    expect(screen.getByRole('columnheader', { name: /task/i })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: /priority/i })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: /assignee/i })).toBeVisible();
  });

  it('filters rows by search term', async () => {
    const user = userEvent.setup();
    render(<TablesFilteringLab />);

    await user.type(screen.getByRole('searchbox', { name: /search tasks/i }), 'fix');

    const rows = screen.getAllByRole('row').slice(1); // skip header
    for (const row of rows) {
      expect(within(row).getByRole('cell', { name: /fix/i })).toBeVisible();
    }
  });

  it('filters rows by status', async () => {
    const user = userEvent.setup();
    render(<TablesFilteringLab />);

    await user.selectOptions(screen.getByRole('combobox', { name: /filter by status/i }), 'blocked');

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(1);
    expect(within(rows[0]).getByText('Blocked')).toBeVisible();
  });

  it('shows an empty state when no tasks match filters', async () => {
    const user = userEvent.setup();
    render(<TablesFilteringLab />);

    await user.type(screen.getByRole('searchbox', { name: /search tasks/i }), 'zzznomatch');

    expect(screen.getByRole('status')).toHaveTextContent(/no tasks match/i);
  });

  it('clears filters and restores all rows when Clear filters is clicked', async () => {
    const user = userEvent.setup();
    render(<TablesFilteringLab />);

    await user.type(screen.getByRole('searchbox', { name: /search tasks/i }), 'zzznomatch');
    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(5);
  });

  it('sorts rows by task name ascending on first click', async () => {
    const user = userEvent.setup();
    render(<TablesFilteringLab />);

    await user.click(screen.getByRole('button', { name: /sort by task/i }));

    const rows = screen.getAllByRole('row').slice(1);
    const names = rows.map((row) => within(row).getAllByRole('cell')[0].textContent ?? '');
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it('shows a View details button for each row', () => {
    render(<TablesFilteringLab />);

    const viewButtons = screen.getAllByRole('button', { name: /view details/i });
    expect(viewButtons).toHaveLength(5);
  });

  it('shows task detail panel when View details is clicked for a specific row', async () => {
    const user = userEvent.setup();
    render(<TablesFilteringLab />);

    const targetRow = screen.getByRole('row', { name: 'Update login page' });
    await user.click(within(targetRow).getByRole('button', { name: /view details/i }));

    const panel = screen.getByRole('region', { name: /task details/i });
    expect(panel).toBeVisible();
    expect(within(panel).getByText('Update login page')).toBeVisible();
  });

  it('marks a task complete and updates its status in the row', async () => {
    const user = userEvent.setup();
    render(<TablesFilteringLab />);

    // 'Fix cart calculation' starts as 'in-progress'
    const targetRow = screen.getByRole('row', { name: 'Fix cart calculation' });
    const completeButton = within(targetRow).getByRole('button', { name: /mark complete/i });
    await user.click(completeButton);

    expect(within(targetRow).getByText('Done')).toBeVisible();
    expect(within(targetRow).queryByRole('button', { name: /mark complete/i })).not.toBeInTheDocument();
  });

  it('navigates to page 2 with pagination', async () => {
    const user = userEvent.setup();
    render(<TablesFilteringLab />);

    await user.click(screen.getByRole('button', { name: /next page/i }));

    expect(screen.getByText('Page 2 of 2')).toBeVisible();
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(5); // 10 items total, 5 per page
  });

  it('Previous page button is disabled on page 1', () => {
    render(<TablesFilteringLab />);
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });

  it('resets the table state when the lab is reset', async () => {
    const user = userEvent.setup();
    render(<TablesFilteringLab />);

    await user.type(screen.getByRole('searchbox', { name: /search tasks/i }), 'fix');
    await user.click(screen.getByRole('button', { name: /reset lab/i }));

    expect(screen.getByRole('searchbox', { name: /search tasks/i })).toHaveValue('');
    expect(screen.getAllByRole('row').slice(1)).toHaveLength(5);
  });
});
