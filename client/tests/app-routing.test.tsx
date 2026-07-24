import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import App from '../src/App';
import { labs } from '../src/labs';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderAppAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith('/api/auth/me')) return Promise.resolve(jsonResponse({}, 401));
      if (url.includes('/api/feed'))
        return Promise.resolve(
          jsonResponse({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false }),
        );
      if (url.includes('/api/book-catalog'))
        return Promise.resolve(
          jsonResponse({ items: [], page: 1, pageSize: 10, total: 0, hasMore: false, sql: '' }),
        );
      return Promise.resolve(jsonResponse([]));
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('App routing', () => {
  test.each(labs)('loads $slug through the lazy practice route map', async (lab) => {
    renderAppAt(`/practice/${lab.slug}`);

    expect(await screen.findByRole('heading', { level: 1, name: lab.title })).toBeVisible();
  });

  test('loads the fake-auth dashboard extra route', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/api/auth/me')) {
          return Promise.resolve(
            jsonResponse({ id: 1, username: 'alice', displayName: 'Alice Smith' }),
          );
        }
        if (url.includes('/api/feed')) {
          return Promise.resolve(
            jsonResponse({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false }),
          );
        }
        return Promise.resolve(jsonResponse([]));
      }),
    );

    renderAppAt('/practice/fake-auth/dashboard');

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('loads the passkey-authentication dashboard extra route', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/api/passkey/me')) {
          return Promise.resolve(
            jsonResponse({ id: 1, username: 'alice', displayName: 'Alice Chen' }),
          );
        }
        if (url.includes('/api/feed')) {
          return Promise.resolve(
            jsonResponse({ items: [], page: 1, pageSize: 8, total: 0, hasMore: false }),
          );
        }
        return Promise.resolve(jsonResponse([]));
      }),
    );

    renderAppAt('/practice/passkey-authentication/dashboard');

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('loads the multi-tab window extra route', async () => {
    renderAppAt('/practice/multi-tab/window');

    expect(await screen.findByRole('heading', { name: 'Dashboard (New Tab)' })).toBeVisible();
  });

  test('loads the multi-tab popup extra route', async () => {
    renderAppAt('/practice/multi-tab/popup');

    expect(await screen.findByRole('heading', { name: 'Popup Window' })).toBeVisible();
  });

  test('renders the home route and redirects unknown practice slugs home', async () => {
    const { unmount } = renderAppAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Practice Labs' })).toBeVisible();

    unmount();
    renderAppAt('/practice/not-a-real-lab');

    expect(await screen.findByRole('heading', { level: 1, name: 'Practice Labs' })).toBeVisible();
  });
});
