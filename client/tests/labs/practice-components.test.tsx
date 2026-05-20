import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AsyncUi } from '../../src/pages/practice/AsyncUi';
import { ClockTimers } from '../../src/pages/practice/ClockTimers';
import { DragAndDrop } from '../../src/pages/practice/DragAndDrop';
import { FormsValidation } from '../../src/pages/practice/FormsValidation';
import { TablesFiltering } from '../../src/pages/practice/TablesFiltering';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('FormsValidation', () => {
  test('submits a valid newsletter signup and can reset to the empty form', () => {
    render(<FormsValidation />);

    fireEvent.change(screen.getByLabelText(/Full name/), {
      target: { value: 'Alice Smith' },
    });
    fireEvent.change(screen.getByLabelText(/Email address/), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Topic category/), {
      target: { value: 'technology' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'Weekly' }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Subscribe' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Subscribed!');
    expect(screen.getByRole('alert')).toHaveTextContent('Welcome, Alice Smith.');

    fireEvent.click(screen.getByRole('button', { name: 'Reset form' }));

    expect(screen.getByRole('form', { name: 'Newsletter signup form' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeDisabled();
  });
});

describe('AsyncUi', () => {
  test('renders articles after the delayed successful load', async () => {
    vi.useFakeTimers();
    render(<AsyncUi />);

    fireEvent.click(screen.getByRole('button', { name: 'Load articles' }));

    expect(screen.getByRole('status', { name: 'Loading articles' })).toBeVisible();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(screen.getAllByRole('article')).toHaveLength(4);
    expect(screen.queryByRole('status', { name: 'Loading articles' })).not.toBeInTheDocument();
  });

  test('surfaces a delayed error and retries successfully', async () => {
    vi.useFakeTimers();
    render(<AsyncUi />);

    fireEvent.click(screen.getByRole('button', { name: 'Load with error' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load articles.');

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });

    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

  test('shows and dismisses the delayed notification toast', async () => {
    vi.useFakeTimers();
    render(<AsyncUi />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger notification' }));
    expect(screen.queryByText('Notification sent')).not.toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Notification sent');

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Notification sent')).not.toBeInTheDocument();
  });
});

describe('TablesFiltering', () => {
  test('filters employee rows by role and updates the result count', () => {
    render(<TablesFiltering />);

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'staff' },
    });

    expect(screen.getByRole('status')).toHaveTextContent('1 employees');
    expect(screen.getByRole('cell', { name: 'Sam Lewis' })).toBeVisible();
    expect(screen.queryByRole('cell', { name: 'Alice Chen' })).not.toBeInTheDocument();
  });

  test('removes an employee from the action menu', () => {
    render(<TablesFiltering />);

    fireEvent.click(screen.getByRole('button', { name: 'Actions for Alice Chen' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Remove' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Alice Chen removed.');
    expect(screen.queryByRole('cell', { name: 'Alice Chen' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('22 employees');
  });

  test('filters by department, handles empty results, and toggles sort direction', () => {
    render(<TablesFiltering />);

    fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'HR' } });
    expect(screen.getByRole('status')).toHaveTextContent('3 employees');
    expect(screen.getByRole('cell', { name: 'Iris Johnson' })).toBeVisible();
    expect(screen.queryByRole('cell', { name: 'Alice Chen' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'zzz' } });
    expect(screen.getByRole('status')).toHaveTextContent('No employees found.');
    expect(screen.getByText('No employees match your filters.')).toBeVisible();

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Department'), { target: { value: 'All' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sort by name descending' }));

    expect(screen.getAllByRole('row')[1]).toHaveTextContent('Wendy Hall');
  });

  test('paginates rows and opens the edit action notification', () => {
    vi.useFakeTimers();
    render(<TablesFiltering />);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Page 2 of 4')).toBeVisible();
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('Page 1 of 4')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Actions for Alice Chen' }));
    expect(screen.getByRole('menu', { name: 'Alice Chen actions' })).toBeVisible();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Editing Alice Chen');

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('ClockTimers', () => {
  test('counts down to expiration and resets', async () => {
    vi.useFakeTimers();
    render(<ClockTimers />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });

    expect(screen.getByRole('alert')).toHaveTextContent("Time's up!");
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByTestId('countdown')).toHaveTextContent('01:00');
    expect(screen.queryByText("Time's up!")).not.toBeInTheDocument();
  });

  test('pauses the countdown before expiration', async () => {
    vi.useFakeTimers();
    render(<ClockTimers />);

    fireEvent.click(screen.getByRole('button', { name: 'Start' }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByTestId('countdown')).toHaveTextContent('00:58');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByTestId('countdown')).toHaveTextContent('00:58');
  });

  test('shows, updates, and dismisses the session warning toast', async () => {
    vi.useFakeTimers();
    render(<ClockTimers />);

    fireEvent.click(screen.getByTestId('start-session'));
    expect(screen.getByText(/Session active/)).toBeVisible();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });
    expect(screen.getByTestId('expiry-countdown')).toHaveTextContent('3s');

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss session warning' }));
    expect(screen.queryByTestId('expiry-toast')).not.toBeInTheDocument();
    expect(screen.getByTestId('start-session')).toBeEnabled();
  });

  test('advances the polling refresh counter and relative timestamp', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-20T12:00:00Z'));
    render(<ClockTimers />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(screen.getByTestId('refresh-count')).toHaveTextContent('Refresh #1');
    expect(screen.getByTestId('last-refresh-ago')).toHaveTextContent('0s ago');
  });
});

describe('DragAndDrop', () => {
  test('moves a kanban card into a different column after drag and drop', () => {
    render(<DragAndDrop />);

    const todoColumn = screen.getByLabelText('To Do column');
    const doneColumn = screen.getByLabelText('Done column');
    const card = within(todoColumn).getByLabelText('Write Playwright tests');

    fireEvent.dragStart(card);
    fireEvent.drop(doneColumn);

    expect(within(doneColumn).getByText('Write Playwright tests')).toBeVisible();
    expect(within(todoColumn).queryByText('Write Playwright tests')).not.toBeInTheDocument();
  });

  test('handles file drop hover state and displays the dropped file size', () => {
    render(<DragAndDrop />);

    const dropZone = screen.getByTestId('drop-zone');
    fireEvent.dragOver(dropZone);
    expect(dropZone.className).toContain('border-indigo-400');

    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).toContain('border-zinc-300');

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [new File(['stagecraft'], 'stagecraft.txt', { type: 'text/plain' })],
      },
    });

    expect(screen.getByTestId('dropped-file')).toHaveTextContent('stagecraft.txt (0.0 KB)');
  });

  test('reorders the sortable list with drag and drop', () => {
    render(<DragAndDrop />);

    const list = screen.getByRole('list', { name: 'Sortable list' });
    const alpha = screen.getByTestId('sort-item-alpha');
    const delta = screen.getByTestId('sort-item-delta');

    fireEvent.dragStart(delta);
    fireEvent.drop(alpha);

    expect(
      within(list)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['⠿Delta', '⠿Alpha', '⠿Beta', '⠿Gamma', '⠿Epsilon']);
  });
});
