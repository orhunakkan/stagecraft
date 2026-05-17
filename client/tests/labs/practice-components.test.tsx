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
        expect(screen.getByRole('button', { name: 'Pause' })).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

        expect(screen.getByTestId('countdown')).toHaveTextContent('01:00');
        expect(screen.queryByText("Time's up!")).not.toBeInTheDocument();
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
});
