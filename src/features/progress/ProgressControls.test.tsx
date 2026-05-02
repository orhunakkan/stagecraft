import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { progressStorageKey } from '../progress/progress-storage';
import { ProgressControls } from './ProgressControls';

// Each test starts with a clean localStorage so progress doesn't leak between tests.
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('ProgressControls', () => {
  it('renders the progress section with a disclaimer about self-marking', () => {
    render(<ProgressControls challengeId="accessible-locators" />);

    expect(screen.getByRole('heading', { name: /my progress/i })).toBeVisible();
    expect(screen.getByText(/self-marked/i)).toBeVisible();
    expect(screen.getByText(/not graded/i)).toBeVisible();
  });

  it('shows all four status buttons', () => {
    render(<ProgressControls challengeId="accessible-locators" />);

    const group = screen.getByRole('group', { name: /mark your progress/i });
    expect(within(group).getByRole('button', { name: 'Not started' })).toBeVisible();
    expect(within(group).getByRole('button', { name: 'In progress' })).toBeVisible();
    expect(within(group).getByRole('button', { name: 'Practiced' })).toBeVisible();
    expect(within(group).getByRole('button', { name: 'Completed' })).toBeVisible();
  });

  it('defaults to Not started pressed when no stored progress', () => {
    render(<ProgressControls challengeId="accessible-locators" />);

    const group = screen.getByRole('group', { name: /mark your progress/i });
    expect(within(group).getByRole('button', { name: 'Not started' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(group).getByRole('button', { name: 'In progress' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('reflects existing stored progress on mount', () => {
    localStorage.setItem(
      progressStorageKey,
      JSON.stringify({ 'forms-validation': 'completed' }),
    );
    render(<ProgressControls challengeId="forms-validation" />);

    const group = screen.getByRole('group', { name: /mark your progress/i });
    expect(within(group).getByRole('button', { name: 'Completed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(group).getByRole('button', { name: 'Not started' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('updates progress and persists to storage when a status button is clicked', async () => {
    const user = userEvent.setup();
    render(<ProgressControls challengeId="async-ui" />);

    await user.click(screen.getByRole('button', { name: 'In progress' }));

    expect(screen.getByRole('button', { name: 'In progress' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    const stored = JSON.parse(localStorage.getItem(progressStorageKey) ?? '{}') as Record<
      string,
      string
    >;
    expect(stored['async-ui']).toBe('inProgress');
  });

  it('can cycle through all four statuses', async () => {
    const user = userEvent.setup();
    render(<ProgressControls challengeId="network-api" />);

    for (const label of ['In progress', 'Practiced', 'Completed', 'Not started']) {
      await user.click(screen.getByRole('button', { name: label }));
      expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-pressed', 'true');
    }
  });

  it('shows the reset all button', () => {
    render(<ProgressControls challengeId="accessible-locators" />);

    expect(screen.getByRole('button', { name: /reset all progress/i })).toBeVisible();
  });

  it('asks for confirmation before resetting all progress', async () => {
    const user = userEvent.setup();

    localStorage.setItem(
      progressStorageKey,
      JSON.stringify({ 'accessible-locators': 'completed' }),
    );
    render(<ProgressControls challengeId="accessible-locators" />);

    await screen.findByRole('button', { name: 'Completed' });

    // First click shows confirmation
    await user.click(screen.getByRole('button', { name: /reset all progress/i }));
    expect(screen.getByRole('button', { name: /confirm reset/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  it('resets all progress and returns to Not started after confirming', async () => {
    const user = userEvent.setup();

    localStorage.setItem(
      progressStorageKey,
      JSON.stringify({
        'accessible-locators': 'completed',
        'forms-validation': 'practiced',
      }),
    );
    render(<ProgressControls challengeId="accessible-locators" />);

    expect(screen.getByRole('button', { name: 'Completed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: /reset all progress/i }));
    await user.click(screen.getByRole('button', { name: /confirm reset/i }));

    expect(screen.getByRole('button', { name: 'Not started' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(localStorage.getItem(progressStorageKey)).toBeNull();
  });

  it('cancelling reset all leaves progress unchanged', async () => {
    const user = userEvent.setup();

    localStorage.setItem(
      progressStorageKey,
      JSON.stringify({ 'accessible-locators': 'practiced' }),
    );
    render(<ProgressControls challengeId="accessible-locators" />);

    await user.click(screen.getByRole('button', { name: /reset all progress/i }));
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.getByRole('button', { name: 'Practiced' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(JSON.parse(localStorage.getItem(progressStorageKey) ?? '{}')).toEqual({
      'accessible-locators': 'practiced',
    });
  });
});
