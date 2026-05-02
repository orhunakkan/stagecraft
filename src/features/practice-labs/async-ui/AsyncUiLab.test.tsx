import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AsyncUiLab } from './AsyncUiLab';

// The component uses real timers with delays of 350–600 ms.
// We use waitFor (default timeout 1000 ms) to wait for transitions.

function setup() {
  const user = userEvent.setup();
  render(<AsyncUiLab />);
  return { user };
}

describe('AsyncUiLab', () => {
  it('renders the lab heading', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: /async ui lab/i })).toBeVisible();
  });

  it('shows all three scenario sections', () => {
    setup();
    expect(screen.getByRole('region', { name: /basic success flow/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /retry error flow/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /staged updates flow/i })).toBeVisible();
  });

  it('shows idle status text and start buttons for all scenarios on mount', () => {
    setup();
    expect(screen.getByText(/workflow not started/i)).toBeVisible();
    expect(screen.getByText(/retry flow not started/i)).toBeVisible();
    expect(screen.getByText(/staged flow not started/i)).toBeVisible();

    expect(
      screen.getByRole('button', { name: /start basic success workflow/i }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /start retry error flow/i })).toBeVisible();
    expect(
      screen.getByRole('button', { name: /start staged updates flow/i }),
    ).toBeVisible();
  });

  // ── Scenario 1: Basic Success ─────────────────────────────────────────────

  it('shows loading state immediately after starting the basic success flow', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /start basic success workflow/i }));

    // Loading state is synchronous — visible before any timer fires
    expect(
      screen.getByRole('status', { name: /loading workflow data/i }),
    ).toBeVisible();
  });

  it('resolves to success state after the loading delay', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /start basic success workflow/i }));

    await waitFor(() => {
      expect(screen.getByText(/workflow complete/i)).toBeVisible();
    }, { timeout: 2000 });
  });

  it('shows the processed items list in the success state', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /start basic success workflow/i }));

    await waitFor(() => {
      expect(screen.getByRole('list', { name: /processed items/i })).toBeVisible();
    }, { timeout: 2000 });

    expect(screen.getByText(/report generated/i)).toBeVisible();
    expect(screen.getByText(/notifications sent/i)).toBeVisible();
    expect(screen.getByText(/log entry saved/i)).toBeVisible();
  });

  // ── Scenario 2: Retry Error ────────────────────────────────────────────────

  it('shows loading state immediately after starting the retry error flow', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /start retry error flow/i }));

    expect(screen.getByRole('status', { name: /connecting to service/i })).toBeVisible();
  });

  it('shows the error alert after the first loading delay', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /start retry error flow/i }));

    // Scope to the scenario section — the Next.js route announcer also uses role=alert
    await waitFor(() => {
      const retrySection = screen.getByRole('region', { name: /retry error flow/i });
      expect(retrySection.querySelector('[role="alert"]')).toBeTruthy();
    }, { timeout: 2000 });

    expect(screen.getByText(/connection failed \(simulated\)/i)).toBeVisible();
  });

  it('shows the Retry connection button in the error state', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /start retry error flow/i }));

    await waitFor(
      () => expect(screen.getByRole('button', { name: /retry connection/i })).toBeVisible(),
      { timeout: 2000 },
    );
  });

  it('resolves to success after clicking Retry', async () => {
    const { user } = setup();
    // Start → wait for error
    await user.click(screen.getByRole('button', { name: /start retry error flow/i }));
    await waitFor(
      () => expect(screen.getByRole('button', { name: /retry connection/i })).toBeVisible(),
      { timeout: 2000 },
    );

    // Retry → wait for success
    await user.click(screen.getByRole('button', { name: /retry connection/i }));
    await waitFor(
      () =>
        expect(screen.getByText(/connection restored after 1 retry attempt/i)).toBeVisible(),
      { timeout: 2000 },
    );
  });

  // ── Scenario 3: Staged Updates ─────────────────────────────────────────────

  it('shows loading state immediately after starting the staged updates flow', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /start staged updates flow/i }));

    expect(screen.getByRole('status', { name: /initializing pipeline/i })).toBeVisible();
  });

  it('shows the partial state with the first two stages', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /start staged updates flow/i }));

    await waitFor(
      () => expect(screen.getByText(/loading more… \(2 of 4 items\)/i)).toBeVisible(),
      { timeout: 1000 },
    );

    expect(screen.getByText(/stage 1: authentication verified/i)).toBeVisible();
    expect(screen.getByText(/stage 2: data validated/i)).toBeVisible();
  });

  it('does not show stages 3 or 4 during the partial state', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /start staged updates flow/i }));

    // Wait for partial state
    await waitFor(
      () => expect(screen.getByText(/loading more… \(2 of 4 items\)/i)).toBeVisible(),
      { timeout: 1000 },
    );

    // Stages 3 and 4 are not yet loaded
    expect(screen.queryByText(/stage 3/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/stage 4/i)).not.toBeInTheDocument();
  });

  it('shows all four stages once the pipeline is complete', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /start staged updates flow/i }));

    await waitFor(
      () => expect(screen.getByText(/pipeline complete \(4 of 4 items\)/i)).toBeVisible(),
      { timeout: 2000 },
    );

    expect(screen.getByText(/stage 3: report generated/i)).toBeVisible();
    expect(screen.getByText(/stage 4: notifications sent/i)).toBeVisible();
  });

  // ── Reset ──────────────────────────────────────────────────────────────────

  it('resets all scenarios to idle when reset lab is clicked', async () => {
    const { user } = setup();

    // Advance basic-success to the success state
    await user.click(screen.getByRole('button', { name: /start basic success workflow/i }));
    await waitFor(() => expect(screen.getByText(/workflow complete/i)).toBeVisible(), {
      timeout: 2000,
    });

    await user.click(screen.getByRole('button', { name: /reset lab/i }));

    expect(screen.queryByText(/workflow complete/i)).not.toBeInTheDocument();
    expect(screen.getByText(/workflow not started/i)).toBeVisible();
    expect(
      screen.getByRole('button', { name: /start basic success workflow/i }),
    ).toBeVisible();
  });
});
