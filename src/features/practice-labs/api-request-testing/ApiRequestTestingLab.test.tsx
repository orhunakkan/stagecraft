import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiRequestTestingLab } from './ApiRequestTestingLab';
import { SEEDED_RUNS } from './run-fixtures';

// ─── Fetch mock ────────────────────────────────────────────────────────────────

function buildListResponse(runs = SEEDED_RUNS) {
  return { runs, total: runs.length, seeded: true };
}

function mockFetch(handler: (url: string, init?: RequestInit) => Response) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => handler(url, init)),
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  mockFetch((url, init) => {
    const method = (init?.method ?? 'GET').toUpperCase();

    if (method === 'GET' && url === '/api/practice/runs') {
      return new Response(JSON.stringify(buildListResponse()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST' && url === '/api/practice/runs') {
      const newRun = { ...SEEDED_RUNS[0], id: 'run-099', name: 'New run' };
      return new Response(JSON.stringify(newRun), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (method === 'DELETE' && url.startsWith('/api/practice/runs/')) {
      return new Response(null, { status: 204 });
    }

    return new Response(null, { status: 404 });
  });
});

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('ApiRequestTestingLab', () => {
  it('renders the lab title and section headings', async () => {
    render(<ApiRequestTestingLab />);

    expect(
      screen.getByRole('heading', { level: 1, name: /api request testing lab/i }),
    ).toBeVisible();

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /run registry/i })).toBeVisible(),
    );
    expect(screen.getByRole('heading', { name: /add run/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /api reference/i })).toBeVisible();
  });

  it('shows the seeded data notice', async () => {
    render(<ApiRequestTestingLab />);

    await waitFor(() =>
      expect(screen.getByRole('complementary', { name: /seeded data notice/i })).toBeVisible(),
    );
  });

  it('fetches and renders the run table on mount', async () => {
    render(<ApiRequestTestingLab />);

    const table = await screen.findByRole('table', { name: /test run registry/i });
    expect(table).toBeVisible();
    expect(within(table).getByRole('cell', { name: 'Homepage smoke test' })).toBeVisible();
  });

  it('shows each seeded run in the table', async () => {
    render(<ApiRequestTestingLab />);

    const table = await screen.findByRole('table', { name: /test run registry/i });
    for (const run of SEEDED_RUNS) {
      expect(within(table).getByRole('cell', { name: run.name })).toBeVisible();
    }
  });

  it('renders a delete button for each run', async () => {
    render(<ApiRequestTestingLab />);

    await screen.findByRole('table', { name: /test run registry/i });

    expect(
      screen.getByRole('button', { name: /delete homepage smoke test/i }),
    ).toBeVisible();
  });

  it('calls DELETE and refreshes after clicking a delete button', async () => {
    const user = userEvent.setup();
    render(<ApiRequestTestingLab />);

    await screen.findByRole('table', { name: /test run registry/i });

    await user.click(screen.getByRole('button', { name: /delete homepage smoke test/i }));

    const fetchMock = vi.mocked(fetch);
    const deleteCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        url === '/api/practice/runs/run-001' &&
        (init?.method ?? '').toUpperCase() === 'DELETE',
    );
    expect(deleteCall).toBeDefined();
  });

  it('renders API endpoint entries in the reference panel', async () => {
    render(<ApiRequestTestingLab />);

    await waitFor(() =>
      expect(screen.getByRole('list', { name: /available api endpoints/i })).toBeVisible(),
    );

    expect(screen.getAllByText('/api/practice/runs/{id}')).toHaveLength(2);
  });

  it('can submit the add-run form', async () => {
    const user = userEvent.setup();
    render(<ApiRequestTestingLab />);

    await screen.findByRole('table', { name: /test run registry/i });

    await user.type(screen.getByLabelText(/name/i), 'My new test');
    await user.click(screen.getByRole('button', { name: /add run/i }));

    const fetchMock = vi.mocked(fetch);
    const postCall = fetchMock.mock.calls.find(
      ([url, init]) => url === '/api/practice/runs' && (init?.method ?? '').toUpperCase() === 'POST',
    );
    expect(postCall).toBeDefined();
  });
});
