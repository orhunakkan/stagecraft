import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiRequestContext } from '../../src/pages/practice/ApiRequestContext';
import { BookCatalog } from '../../src/pages/practice/BookCatalog';
import { FakeAuth } from '../../src/pages/practice/FakeAuth';
import { FakeAuthDashboard } from '../../src/pages/practice/FakeAuthDashboard';
import { HarRecording } from '../../src/pages/practice/HarRecording';
import { NetworkApi } from '../../src/pages/practice/NetworkApi';
import { PasskeyAuthentication } from '../../src/pages/practice/PasskeyAuthentication';
import { PasskeyAuthenticationDashboard } from '../../src/pages/practice/PasskeyAuthenticationDashboard';
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

  test('ignores blank task submissions', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse([]));

    render(<ApiRequestContext />);

    await screen.findByText('No tasks yet. Add one above or POST via the request fixture.');

    const input = screen.getByLabelText('New task title');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form')!);

    expect(fetchMock).toHaveBeenCalledTimes(1);
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

describe('BookCatalog', () => {
  function authorsPage(overrides: Partial<Record<string, unknown>> = {}) {
    return jsonResponse({
      items: [{ id: 1, name: 'Jane Austen', country: 'United Kingdom', birthYear: 1775 }],
      page: 1,
      pageSize: 10,
      total: 1,
      hasMore: false,
      sql: 'SELECT Id, Name, Country, BirthYear FROM Authors ORDER BY Name ASC',
      ...overrides,
    });
  }

  function booksPage(overrides: Partial<Record<string, unknown>> = {}) {
    return jsonResponse({
      items: [
        {
          id: 1,
          title: 'Pride and Prejudice',
          authorId: 1,
          genre: 'Classic',
          publishedYear: 1813,
          rating: 4.7,
        },
      ],
      page: 1,
      pageSize: 10,
      total: 1,
      hasMore: false,
      sql: 'SELECT Id, Title, AuthorId, Genre, PublishedYear, Rating FROM Books ORDER BY Title ASC',
      ...overrides,
    });
  }

  test('loads and paginates authors on mount', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(
      authorsPage({
        items: [{ id: 1, name: 'Jane Austen', country: 'United Kingdom', birthYear: 1775 }],
        total: 20,
        hasMore: true,
      }),
    );

    render(<BookCatalog />);

    expect(await screen.findByText('Jane Austen')).toBeVisible();
    expect(screen.getByText(/Page 1 of 2/)).toBeVisible();
    expect(screen.getByText(/SELECT Id, Name, Country, BirthYear FROM Authors/)).toBeVisible();

    fetchMock.mockResolvedValueOnce(
      authorsPage({
        items: [{ id: 2, name: 'George Orwell', country: 'United Kingdom', birthYear: 1903 }],
        page: 2,
        total: 20,
        hasMore: true,
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('George Orwell')).toBeVisible();
    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('page=2'));

    fireEvent.click(screen.getByRole('button', { name: 'Prev' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('page=1')),
    );
  });

  test('runs a new query with a search value only after clicking Run Query', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(authorsPage());

    render(<BookCatalog />);
    await screen.findByText('Jane Austen');

    fireEvent.change(screen.getByLabelText('Name contains'), { target: { value: 'orwell' } });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Run Query' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('search=orwell')),
    );
  });

  test('switching to the Books tab mounts a fresh panel against /api/book-catalog/books', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(authorsPage());

    render(<BookCatalog />);
    await screen.findByText('Jane Austen');

    fetchMock.mockResolvedValueOnce(booksPage());
    fireEvent.click(screen.getByRole('tab', { name: 'Books' }));

    expect(await screen.findByText('Pride and Prejudice')).toBeVisible();
    expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('/api/book-catalog/books'));
  });

  test('resets catalog data after confirming the dialog', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(authorsPage())
      .mockResolvedValueOnce(jsonResponse({ ok: true, seededAuthors: 12, seededBooks: 30 }))
      .mockResolvedValueOnce(authorsPage({ total: 12 }));

    render(<BookCatalog />);
    await screen.findByText('Jane Austen');

    fireEvent.click(screen.getByRole('button', { name: 'Reset catalog data' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/api/book-catalog/reseed', { method: 'POST' }),
    );
    expect(await screen.findByText(/\(12 total\)/)).toBeVisible();
  });

  test('does not reseed when the confirmation dialog is dismissed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(authorsPage());

    render(<BookCatalog />);
    await screen.findByText('Jane Austen');

    fireEvent.click(screen.getByRole('button', { name: 'Reset catalog data' }));

    await waitFor(() => {
      expect(fetchMock).not.toHaveBeenCalledWith('/api/book-catalog/reseed', { method: 'POST' });
    });
  });

  test('shows a generic error message on unexpected failures', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: 'Boom' }, 500));

    render(<BookCatalog />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Error: HTTP 500');
  });

  test('shows an empty state when no rows match', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(authorsPage({ items: [], total: 0 }));

    render(<BookCatalog />);

    expect(await screen.findByText('No authors match this query.')).toBeVisible();
  });

  test('includes a selected filter value only after clicking Run Query', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(authorsPage());

    render(<BookCatalog />);
    await screen.findByText('Jane Austen');

    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'Japan' } });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Run Query' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('country=Japan')),
    );
  });

  test('toggles sort direction and sends it on the next Run Query', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(authorsPage());

    render(<BookCatalog />);
    await screen.findByText('Jane Austen');

    expect(screen.getByRole('button', { name: 'Ascending ↑' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Ascending ↑' }));
    expect(screen.getByRole('button', { name: 'Descending ↓' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Run Query' }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(expect.stringContaining('direction=desc')),
    );
  });

  test('switching to the Catalog tab mounts the JOIN panel', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(authorsPage());

    render(<BookCatalog />);
    await screen.findByText('Jane Austen');

    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        items: [
          {
            id: 1,
            title: 'Pride and Prejudice',
            genre: 'Classic',
            publishedYear: 1813,
            rating: 4.7,
            authorName: 'Jane Austen',
            authorCountry: 'United Kingdom',
          },
        ],
        page: 1,
        pageSize: 10,
        total: 1,
        hasMore: false,
        sql: 'SELECT b.Id, b.Title FROM Books b JOIN Authors a ON b.AuthorId = a.Id',
      }),
    );
    fireEvent.click(screen.getByRole('tab', { name: 'Catalog (JOIN)' }));

    expect(await screen.findByRole('table', { name: 'catalog entries' })).toBeVisible();
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining('/api/book-catalog/catalog'),
    );
  });

  test('shows an error and re-enables the button when reset fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(authorsPage())
      .mockResolvedValueOnce(jsonResponse({ error: 'Boom' }, 500));

    render(<BookCatalog />);
    await screen.findByText('Jane Austen');

    fireEvent.click(screen.getByRole('button', { name: 'Reset catalog data' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Error: HTTP 500');
    expect(screen.getByRole('button', { name: 'Reset catalog data' })).toBeEnabled();
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

  test('shows a generic error when login fails with a non-401 response', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 503));

    renderWithRouter(
      <Routes>
        <Route path="/" element={<FakeAuth />} />
        <Route path="/practice/fake-auth/dashboard" element={<p>Dashboard route</p>} />
      </Routes>,
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'alice' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong. Please try again.',
    );
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

function stubCredentials(overrides: { create?: unknown; get?: unknown } = {}) {
  Object.defineProperty(navigator, 'credentials', {
    configurable: true,
    value: {
      create: overrides.create ?? vi.fn(),
      get: overrides.get ?? vi.fn(),
    },
  });
}

function rawIdCredential(id: string): { rawId: ArrayBuffer } {
  return { rawId: new TextEncoder().encode(id).buffer };
}

describe('PasskeyAuthentication', () => {
  test('registers a passkey and signs in, navigating to the dashboard', async () => {
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          challenge: 'Y2hhbGxlbmdl',
          rpId: 'localhost',
          rpName: 'Stagecraft Labs',
          userId: 'MQ',
          userName: 'alice',
          userDisplayName: 'Alice Chen',
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true }, 201))
      .mockResolvedValueOnce(
        jsonResponse({ challenge: 'Y2hhbGxlbmdl', allowCredentialIds: ['cred-1'] }),
      )
      .mockResolvedValueOnce(jsonResponse({ id: 1, username: 'alice', displayName: 'Alice Chen' }));

    stubCredentials({
      create: vi.fn().mockResolvedValue(rawIdCredential('cred-1')),
      get: vi.fn().mockResolvedValue(rawIdCredential('cred-1')),
    });

    renderWithRouter(
      <Routes>
        <Route path="/" element={<PasskeyAuthentication />} />
        <Route path="/practice/passkey-authentication/dashboard" element={<p>Dashboard route</p>} />
      </Routes>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Register passkey' }));
    expect(await screen.findByText('A passkey is registered for this session.')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with passkey' }));
    expect(await screen.findByText('Dashboard route')).toBeVisible();
  });

  test('shows an error when no matching passkey is found', async () => {
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ challenge: 'Y2hhbGxlbmdl', allowCredentialIds: [] }))
      .mockResolvedValueOnce(jsonResponse({ error: 'No matching passkey found' }, 401));

    stubCredentials({ get: vi.fn().mockResolvedValue(rawIdCredential('cred-unknown')) });

    renderWithRouter(<PasskeyAuthentication />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with passkey' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No matching passkey found. Register one first.',
    );
  });

  test('shows a generic error when the ceremony throws', async () => {
    stubCredentials({ create: vi.fn().mockRejectedValue(new Error('NotAllowedError')) });
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        challenge: 'Y2hhbGxlbmdl',
        rpId: 'localhost',
        rpName: 'Stagecraft Labs',
        userId: 'MQ',
        userName: 'alice',
        userDisplayName: 'Alice Chen',
      }),
    );

    renderWithRouter(<PasskeyAuthentication />);

    fireEvent.click(screen.getByRole('button', { name: 'Register passkey' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Passkey registration failed. Make sure a virtual authenticator is attached.',
    );
  });

  test('shows a generic error when the sign-in ceremony throws', async () => {
    stubCredentials({ get: vi.fn().mockRejectedValue(new Error('NotAllowedError')) });
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ challenge: 'Y2hhbGxlbmdl', allowCredentialIds: ['cred-1'] }),
    );

    renderWithRouter(<PasskeyAuthentication />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with passkey' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Passkey sign-in failed. Make sure a virtual authenticator is attached.',
    );
  });

  test('shows a generic error when registration returns no credential', async () => {
    stubCredentials({ create: vi.fn().mockResolvedValue(null) });
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        challenge: 'Y2hhbGxlbmdl',
        rpId: 'localhost',
        rpName: 'Stagecraft Labs',
        userId: 'MQ',
        userName: 'alice',
        userDisplayName: 'Alice Chen',
      }),
    );

    renderWithRouter(<PasskeyAuthentication />);

    fireEvent.click(screen.getByRole('button', { name: 'Register passkey' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Passkey registration failed. Make sure a virtual authenticator is attached.',
    );
  });

  test('shows a generic error when the registration request fails', async () => {
    stubCredentials({ create: vi.fn().mockResolvedValue(rawIdCredential('cred-1')) });
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          challenge: 'Y2hhbGxlbmdl',
          rpId: 'localhost',
          rpName: 'Stagecraft Labs',
          userId: 'MQ',
          userName: 'alice',
          userDisplayName: 'Alice Chen',
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ message: 'Nope' }, 500));

    renderWithRouter(<PasskeyAuthentication />);

    fireEvent.click(screen.getByRole('button', { name: 'Register passkey' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Passkey registration failed. Make sure a virtual authenticator is attached.',
    );
  });

  test('shows a generic error when sign-in returns no assertion', async () => {
    stubCredentials({ get: vi.fn().mockResolvedValue(null) });
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ challenge: 'Y2hhbGxlbmdl', allowCredentialIds: ['cred-1'] }),
    );

    renderWithRouter(<PasskeyAuthentication />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with passkey' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Passkey sign-in failed. Make sure a virtual authenticator is attached.',
    );
  });

  test('shows a generic error when the sign-in request fails with a non-401 response', async () => {
    stubCredentials({ get: vi.fn().mockResolvedValue(rawIdCredential('cred-1')) });
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ challenge: 'Y2hhbGxlbmdl', allowCredentialIds: ['cred-1'] }),
      )
      .mockResolvedValueOnce(jsonResponse({ message: 'Nope' }, 500));

    renderWithRouter(<PasskeyAuthentication />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with passkey' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Passkey sign-in failed. Make sure a virtual authenticator is attached.',
    );
  });
});

describe('PasskeyAuthenticationDashboard', () => {
  test('redirects when unauthenticated and signs out an authenticated user', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 401));

    const { unmount } = renderWithRouter(
      <Routes>
        <Route path="/practice/passkey-authentication" element={<p>Registration route</p>} />
        <Route
          path="/practice/passkey-authentication/dashboard"
          element={<PasskeyAuthenticationDashboard />}
        />
      </Routes>,
      ['/practice/passkey-authentication/dashboard'],
    );

    expect(await screen.findByText('Registration route')).toBeVisible();

    unmount();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ id: 1, username: 'alice', displayName: 'Alice Chen' }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    renderWithRouter(
      <Routes>
        <Route path="/practice/passkey-authentication" element={<p>Registration route</p>} />
        <Route
          path="/practice/passkey-authentication/dashboard"
          element={<PasskeyAuthenticationDashboard />}
        />
      </Routes>,
      ['/practice/passkey-authentication/dashboard'],
    );

    expect(await screen.findByText(/Welcome back/)).toHaveTextContent('Alice Chen');
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByText('Registration route')).toBeVisible();
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

  test('falls back to "Unknown error" for non-Error fetch failures', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockRejectedValueOnce('boom');

    render(<HarRecording />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Unknown error');
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

  test('reports unsupported service workers when the API is unavailable', () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: undefined,
    });
    Reflect.deleteProperty(navigator as unknown as { serviceWorker?: unknown }, 'serviceWorker');

    render(<ServiceWorkers />);

    fireEvent.click(screen.getByRole('button', { name: 'Register service worker' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Registration failed');
  });

  test('reports failed item fetches', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 500));
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register: vi.fn().mockResolvedValue({}) },
    });

    render(<ServiceWorkers />);

    fireEvent.click(screen.getByTestId('fetch-items-btn'));
    await waitFor(() =>
      expect(
        screen.getAllByRole('alert').some((alert) => alert.textContent?.includes('HTTP 500')),
      ).toBe(true),
    );
  });

  test('falls back to "Unknown error" for non-Error fetch failures', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockRejectedValueOnce('boom');
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register: vi.fn().mockResolvedValue({}) },
    });

    render(<ServiceWorkers />);

    fireEvent.click(screen.getByTestId('fetch-items-btn'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unknown error');
  });
});

describe('ScrollLazyLoading', () => {
  test('does not request or append the first feed page twice when the sentinel intersects during initial load', async () => {
    const fetchMock = mockFetch();
    let resolveFirstPage: (response: Response) => void = () => {};
    const firstPage = new Promise<Response>((resolve) => {
      resolveFirstPage = resolve;
    });
    fetchMock.mockReturnValueOnce(firstPage);

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

    await act(async () => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirstPage(
        jsonResponse({
          items: [
            {
              id: 1,
              title: 'First feed item',
              body: 'Loaded once.',
              createdAt: '2026-05-20T12:00:00Z',
            },
          ],
          page: 1,
          pageSize: 8,
          total: 1,
          hasMore: false,
        }),
      );
      await firstPage;
    });

    expect(await screen.findByText('First feed item')).toBeVisible();
    expect(screen.getAllByText('First feed item')).toHaveLength(1);
  });

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
