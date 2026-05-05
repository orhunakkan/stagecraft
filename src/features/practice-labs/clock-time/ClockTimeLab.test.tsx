import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ClockTimeLab } from './ClockTimeLab';

describe('ClockTimeLab', () => {
  it('renders the lab title and all three scenario headings', () => {
    render(<ClockTimeLab />);

    expect(screen.getByRole('heading', { level: 1, name: /clock and time control lab/i })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: /scenario 1 — live clock display/i })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: /scenario 2 — session countdown/i })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: /scenario 3 — scheduled auto-refresh/i })).toBeVisible();
  });

  it('shows the live clock with a time element', () => {
    render(<ClockTimeLab />);

    expect(screen.getByLabelText(/current date and time/i)).toBeVisible();
  });

  it('shows the countdown in its idle state initially', () => {
    render(<ClockTimeLab />);

    expect(screen.getByRole('status', { name: /session countdown not started/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /start countdown/i })).toBeVisible();
  });

  it('starts the countdown when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<ClockTimeLab />);

    await user.click(screen.getByRole('button', { name: /start countdown/i }));

    expect(screen.getByRole('status', { name: /session expires in/i })).toBeVisible();
  });

  it('shows the auto-refresh in its idle state initially', () => {
    render(<ClockTimeLab />);

    expect(screen.getByRole('status', { name: /auto-refresh not started/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /start auto-refresh/i })).toBeVisible();
  });

  it('shows the auto-refresh panel when started', async () => {
    const user = userEvent.setup();
    render(<ClockTimeLab />);

    await user.click(screen.getByRole('button', { name: /start auto-refresh/i }));

    expect(screen.getByRole('status', { name: /refreshed 0 times/i })).toBeVisible();
  });

  it('resets the lab when the reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<ClockTimeLab />);

    // Start both interactive scenarios
    await user.click(screen.getByRole('button', { name: /start countdown/i }));
    await user.click(screen.getByRole('button', { name: /start auto-refresh/i }));

    // Both should be in active state
    expect(screen.getByRole('status', { name: /session expires in/i })).toBeVisible();
    expect(screen.getByRole('status', { name: /refreshed 0 times/i })).toBeVisible();

    // Reset
    await user.click(screen.getByRole('button', { name: /reset lab/i }));

    // Both should be back in idle state
    expect(screen.getByRole('status', { name: /session countdown not started/i })).toBeVisible();
    expect(screen.getByRole('status', { name: /auto-refresh not started/i })).toBeVisible();
  });
});
