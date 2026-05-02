import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildSession, PRACTICE_CREDENTIALS, writeSession } from './fake-session';
import { FakeProtectedPage } from './FakeProtectedPage';

// ─── Mock next/navigation ──────────────────────────────────────────────────────

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  usePathname: () => '/practice/fake-auth/protected',
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Setup ─────────────────────────────────────────────────────────────────────

const SIGNED_IN_AT = '2025-01-01T12:00:00.000Z';

beforeEach(() => {
  localStorage.clear();
  mockReplace.mockClear();
});

afterEach(() => {
  localStorage.clear();
});

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('FakeProtectedPage — unauthenticated', () => {
  it('calls router.replace to redirect when no session exists', async () => {
    render(<FakeProtectedPage />);
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/practice/fake-auth'),
    );
  });

  it('shows the redirecting status message while the redirect fires', async () => {
    render(<FakeProtectedPage />);
    await waitFor(() =>
      expect(screen.getByRole('status', { name: /redirecting to sign in/i })).toBeVisible(),
    );
  });
});

describe('FakeProtectedPage — authenticated', () => {
  beforeEach(() => {
    writeSession(buildSession(PRACTICE_CREDENTIALS.username, SIGNED_IN_AT));
  });

  it('shows the Practice Portal heading when a session is active', async () => {
    render(<FakeProtectedPage />);
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: /practice portal/i }),
      ).toBeVisible(),
    );
  });

  it('shows the welcome message with the learner display name', async () => {
    render(<FakeProtectedPage />);
    await waitFor(() =>
      expect(screen.getByText(/welcome back/i)).toBeVisible(),
    );
    // displayName appears in multiple places — verify at least one is visible
    expect(screen.getAllByText(/practice learner/i).length).toBeGreaterThan(0);
  });

  it('shows the signed-in username in the session details section', async () => {
    render(<FakeProtectedPage />);
    const section = await screen.findByRole('region', { name: /session details/i });
    expect(section).toBeVisible();
    expect(section.textContent).toContain(PRACTICE_CREDENTIALS.username);
  });

  it('shows the available modules section', async () => {
    render(<FakeProtectedPage />);
    await waitFor(() =>
      expect(screen.getByRole('region', { name: /available modules/i })).toBeVisible(),
    );
  });

  it('shows a Sign out button', async () => {
    render(<FakeProtectedPage />);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /sign out/i })).toBeVisible(),
    );
  });

  it('clears the session and redirects when Sign out is clicked', async () => {
    const user = userEvent.setup();
    render(<FakeProtectedPage />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /sign out/i })).toBeVisible(),
    );
    await user.click(screen.getByRole('button', { name: /sign out/i }));

    expect(localStorage.getItem('stagecraft_fake_session')).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/practice/fake-auth');
  });

  it('does not call router.replace when a valid session exists', async () => {
    render(<FakeProtectedPage />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /practice portal/i })).toBeVisible(),
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
