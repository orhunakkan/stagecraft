import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NetworkApiLab } from './NetworkApiLab';
import {
  buildErrorResponse,
  buildTicketListResponse,
  SUPPORT_TICKETS,
} from './network-fixtures';

// ─── Fetch helpers ─────────────────────────────────────────────────────────────

const MOCK_FETCHED_AT = '2025-01-01T12:00:00.000Z';

function mockSuccessResponse() {
  return vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(buildTicketListResponse(MOCK_FETCHED_AT)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function mockErrorResponse() {
  return vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(buildErrorResponse()), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function mockNetworkFailure() {
  return vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
}

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('NetworkApiLab', () => {
  it('renders the lab heading', async () => {
    mockSuccessResponse();
    render(<NetworkApiLab />);
    expect(screen.getByRole('heading', { level: 1, name: /network api lab/i })).toBeVisible();
    // Wait for fetch to settle so no unhandled async state leaks
    await waitFor(() => expect(screen.getByRole('table')).toBeVisible());
  });

  it('shows loading state while the initial fetch is in flight', () => {
    // Never resolves — keeps the lab in loading state
    vi.spyOn(global, 'fetch').mockReturnValue(new Promise(() => undefined));
    render(<NetworkApiLab />);

    expect(screen.getByRole('status', { name: /loading ticket data/i })).toBeVisible();
  });

  it('shows the ticket table after a successful fetch', async () => {
    mockSuccessResponse();
    render(<NetworkApiLab />);

    await waitFor(() =>
      expect(screen.getByRole('table', { name: /support tickets/i })).toBeVisible(),
    );
  });

  it('renders a row for each fixture ticket', async () => {
    mockSuccessResponse();
    render(<NetworkApiLab />);

    await waitFor(() => expect(screen.getByRole('table')).toBeVisible());

    // 1 header row + N data rows
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(SUPPORT_TICKETS.length + 1);
  });

  it('shows the first ticket title in the table', async () => {
    mockSuccessResponse();
    render(<NetworkApiLab />);

    await waitFor(() =>
      expect(
        screen.getByRole('row', { name: /login page throws 500 on mobile safari/i }),
      ).toBeVisible(),
    );
  });

  it('shows the Last fetched time after a successful fetch', async () => {
    mockSuccessResponse();
    render(<NetworkApiLab />);

    await waitFor(() => expect(screen.getByText(/last fetched/i)).toBeVisible());
  });

  it('shows an error alert when the API returns a non-ok status', async () => {
    mockErrorResponse();
    render(<NetworkApiLab />);

    // Next.js route announcer also uses role=alert — scope to the lab content
    await waitFor(() =>
      expect(
        screen.getByText(/service temporarily unavailable/i),
      ).toBeVisible(),
    );

    expect(screen.getByRole('button', { name: /retry/i })).toBeVisible();
  });

  it('shows an error when fetch rejects with a network error', async () => {
    mockNetworkFailure();
    render(<NetworkApiLab />);

    await waitFor(() =>
      expect(screen.getByText(/network error/i)).toBeVisible(),
    );
  });

  it('calls the API again when Refresh is clicked', async () => {
    const fetchSpy = mockSuccessResponse();
    render(<NetworkApiLab />);

    // Wait for initial load
    await waitFor(() => expect(screen.getByRole('table')).toBeVisible());
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: /refresh ticket list/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
  });

  it('calls the API with ?scenario=error when Simulate error is clicked', async () => {
    const fetchSpy = mockSuccessResponse();
    render(<NetworkApiLab />);

    await waitFor(() => expect(screen.getByRole('table')).toBeVisible());

    // Override to return error for the next call
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(buildErrorResponse()), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await userEvent.click(screen.getByRole('button', { name: /simulate error response/i }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    const errorCallUrl = fetchSpy.mock.calls[1][0] as string;
    expect(errorCallUrl).toContain('scenario=error');
  });

  it('recovers to success after clicking Retry from an error state', async () => {
    mockErrorResponse();
    render(<NetworkApiLab />);

    // Wait for error
    await waitFor(() => expect(screen.getByText(/service temporarily unavailable/i)).toBeVisible());

    // Override next call to succeed
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(buildTicketListResponse(MOCK_FETCHED_AT)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() =>
      expect(screen.getByRole('table', { name: /support tickets/i })).toBeVisible(),
    );
  });

  it('Refresh button is disabled while loading', () => {
    vi.spyOn(global, 'fetch').mockReturnValue(new Promise(() => undefined));
    render(<NetworkApiLab />);

    expect(screen.getByRole('button', { name: /refresh ticket list/i })).toBeDisabled();
  });

  it('re-fetches and shows the table again after reset lab is clicked', async () => {
    mockSuccessResponse();
    render(<NetworkApiLab />);

    await waitFor(() => expect(screen.getByRole('table')).toBeVisible());

    // Override and track the post-reset fetch
    const postResetSpy = mockSuccessResponse();
    await userEvent.click(screen.getByRole('button', { name: /reset lab/i }));

    // After reset the component remounts and auto-fetches; table becomes visible again
    await waitFor(() => expect(postResetSpy).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole('table', { name: /support tickets/i })).toBeVisible(),
    );
  });
});
