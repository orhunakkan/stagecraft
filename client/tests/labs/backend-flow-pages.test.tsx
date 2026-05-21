import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiRequestContext } from '../../src/pages/practice/ApiRequestContext';
import { FakeAuth } from '../../src/pages/practice/FakeAuth';
import { FakeAuthDashboard } from '../../src/pages/practice/FakeAuthDashboard';
import { HarRecording } from '../../src/pages/practice/HarRecording';
import { NetworkApi } from '../../src/pages/practice/NetworkApi';
import { ScrollLazyLoading } from '../../src/pages/practice/ScrollLazyLoading';
import { ServiceWorkers } from '../../src/pages/practice/ServiceWorkers';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function mockFetch() {
  const fetchMock = vi.fn<(...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>>();
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderWithRouter(ui: React.ReactNode, initialEntries: string[] = ['/']) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ApiRequestContext', () => {
  test('loads, creates, completes, and deletes tasks through the API', async () => {
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse([
          { id: 1, title: 'Seed task', done: false, createdAt: '2026-05-20T12:00:00Z' },
        ]),
      )
      .mockResolvedValueOnce(
        jsonResponse({ id: 2, title: 'New task', done: false, createdAt: '2026-05-20T12:05:00Z' }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ id: 1, title: 'Seed task', done: true, createdAt: '2026-05-20T12:00:00Z' }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    render(<ApiRequestContext />);

    expect(await screen.findByText('Seed task')).toBeVisible();

    fireEvent.change(screen.getByLabelText('New task title'), { target: { value: ' New task ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(await screen.findByText('New task')).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tasks',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ title: 'New task' }) }),
    );

    fireEvent.click(screen.getByLabelText('Mark "Seed task" as complete'));
    await waitFor(() =>
      expect(screen.getByLabelText('Mark "Seed task" as incomplete')).toBeChecked(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete Seed task' }));
    await waitFor(() => expect(screen.queryByText('Seed task')).not.toBeInTheDocument());
  });

  test('shows the API error message when task loading fails', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Nope' }, 500));

    render(<ApiRequestContext />);

    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 500');
  });
});

describe('NetworkApi', () => {
  test('loads notes, adds a note, and deletes a note', async () => {
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse([{ id: 1, text: 'Existing note', createdAt: '2026-05-20T12:00:00Z' }]),
      )
      .mockResolvedValueOnce(
        jsonResponse({ id: 2, text: 'Follow-up note', createdAt: '2026-05-20T12:10:00Z' }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    render(<NetworkApi />);

    expect(await screen.findByText('Existing note')).toBeVisible();

    fireEvent.change(screen.getByLabelText('Add note'), { target: { value: 'Follow-up note' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(await screen.findByText('Follow-up note')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Delete note: Existing note' }));
    await waitFor(() => expect(screen.queryByText('Existing note')).not.toBeInTheDocument());
  });

  test('renders an empty state and fetch error state', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse([]));

    const { unmount } = render(<NetworkApi />);
    expect(await screen.findByText('No notes yet. Add one above.')).toBeVisible();

    unmount();
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'Nope' }, 503));
    render(<NetworkApi />);
    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 503');
  });
});

describe('FakeAuth', () => {
  test('shows invalid credentials and navigates after a successful login', async () => {
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    renderWithRouter(
      <Routes>
        <Route path="/" element={<FakeAuth />} />
        <Route path="/practice/fake-auth/dashboard" element={<p>Dashboard route</p>} />
      </Routes>,
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password.');

    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Dashboard route')).toBeVisible();
  });

  test('redirects the dashboard when unauthenticated and signs out an authenticated user', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 401));

    const { unmount } = renderWithRouter(
      <Routes>
        <Route path="/practice/fake-auth" element={<p>Login route</p>} />
        <Route path="/practice/fake-auth/dashboard" element={<FakeAuthDashboard />} />
      </Routes>,
      ['/practice/fake-auth/dashboard'],
    );

    expect(await screen.findByText('Login route')).toBeVisible();

    unmount();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: 7, username: 'alice', displayName: 'Alice Smith' }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    renderWithRouter(
      <Routes>
        <Route path="/practice/fake-auth" element={<p>Login route</p>} />
        <Route path="/practice/fake-auth/dashboard" element={<FakeAuthDashboard />} />
      </Routes>,
      ['/practice/fake-auth/dashboard'],
    );

    expect(await screen.findByText(/Welcome back/)).toHaveTextContent('Alice Smith');
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByText('Login route')).toBeVisible();
  });
});

describe('HarRecording', () => {
  test('loads products on mount and renders stock status variants', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        { id: 1, name: 'Recorder', category: 'Tools', price: 19.5, inStock: true },
        { id: 2, name: 'Archived Fixture', category: 'Data', price: 7, inStock: false },
      ]),
    );

    render(<HarRecording />);

    expect(await screen.findByText('Recorder')).toBeVisible();
    expect(screen.getByText('$19.50')).toBeVisible();
    expect(screen.getByText('In stock')).toBeVisible();
    expect(screen.getByText('Out of stock')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('2 products loaded');
  });

  test('shows the HAR fetch error message', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 502));

    render(<HarRecording />);

    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 502');
  });
});

describe('ServiceWorkers', () => {
  test('registers a supported service worker and renders fetched item sources', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse([
        { id: 1, name: 'Cached response', source: 'cache' },
        { id: 2, name: 'Fresh response', source: 'network' },
      ]),
    );
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register: vi.fn().mockResolvedValue({}) },
    });

    render(<ServiceWorkers />);

    fireEvent.click(screen.getByRole('button', { name: 'Register service worker' }));
    expect(await screen.findByText('✓ Service worker registered')).toBeVisible();

    fireEvent.click(screen.getByTestId('fetch-items-btn'));
    expect(await screen.findByText('Cached response')).toBeVisible();
    expect(screen.getByText('cache')).toBeVisible();
    expect(screen.getByText('Fresh response')).toBeVisible();
    expect(screen.getByText('network')).toBeVisible();
  });

  test('reports unsupported service workers and failed item fetches', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: undefined,
    });

    render(<ServiceWorkers />);

    fireEvent.click(screen.getByRole('button', { name: 'Register service worker' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Registration failed');

    fireEvent.click(screen.getByTestId('fetch-items-btn'));
    await waitFor(() =>
      expect(
        screen.getAllByRole('alert').some((alert) => alert.textContent?.includes('HTTP 500')),
      ).toBe(true),
    );
  });
});

describe('ScrollLazyLoading', () => {
  test('loads the first feed page and shows the end marker when no more items remain', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        items: [
          {
            id: 1,
            title: 'First feed item',
            body: 'Loaded from the feed endpoint.',
            createdAt: '2026-05-20T12:00:00Z',
          },
        ],
        page: 1,
        pageSize: 8,
        total: 1,
        hasMore: false,
      }),
    );

    render(<ScrollLazyLoading />);

    expect(await screen.findByText('First feed item')).toBeVisible();
    expect(screen.getByTestId('end-marker')).toHaveTextContent("You're all caught up");
    expect(fetchMock).toHaveBeenCalledWith('/api/feed?page=1&pageSize=8');
  });

  test('ignores invalid jump targets and handles failed feed requests', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));

    render(<ScrollLazyLoading />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    fireEvent.change(screen.getByLabelText('Jump to item number'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Jump' }));

    expect(screen.queryByTestId('end-marker')).not.toBeInTheDocument();
  });

  test('loads another page when the sentinel intersects and jumps to a loaded item', async () => {
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          items: [
            {
              id: 1,
              title: 'First feed item',
              body: 'Initial page.',
              createdAt: '2026-05-20T12:00:00Z',
            },
          ],
          page: 1,
          pageSize: 8,
          total: 2,
          hasMore: true,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          items: [
            {
              id: 2,
              title: 'Second feed item',
              body: 'Loaded by intersection.',
              createdAt: '2026-05-20T12:05:00Z',
            },
          ],
          page: 2,
          pageSize: 8,
          total: 2,
          hasMore: false,
        }),
      );

    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    let observerCallback: IntersectionObserverCallback | undefined;
    class TriggerableIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver =
      TriggerableIntersectionObserver as unknown as typeof IntersectionObserver;

    render(<ScrollLazyLoading />);

    expect(await screen.findByText('First feed item')).toBeVisible();

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(await screen.findByText('Second feed item')).toBeVisible();
    fireEvent.change(screen.getByLabelText('Jump to item number'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Jump' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });
});
