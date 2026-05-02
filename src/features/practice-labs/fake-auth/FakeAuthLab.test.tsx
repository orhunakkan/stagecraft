import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FakeAuthLab } from './FakeAuthLab';
import { buildSession, PRACTICE_CREDENTIALS, writeSession } from './fake-session';

// ─── Mock next/navigation ──────────────────────────────────────────────────────

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => '/practice/fake-auth',
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  mockPush.mockClear();
  mockReplace.mockClear();
});

afterEach(() => {
  localStorage.clear();
});

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('FakeAuthLab — sign-in form', () => {
  it('renders the lab heading', async () => {
    render(<FakeAuthLab />);
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: /fake auth session lab/i }),
      ).toBeVisible(),
    );
  });

  it('shows the sign-in form when no session is active', async () => {
    render(<FakeAuthLab />);
    await waitFor(() =>
      expect(screen.getByRole('form', { name: /sign in/i })).toBeVisible(),
    );
  });

  it('displays the documented practice credentials', async () => {
    render(<FakeAuthLab />);
    await waitFor(() =>
      expect(screen.getByRole('complementary', { name: /practice credentials/i })).toBeVisible(),
    );
    expect(screen.getByText(PRACTICE_CREDENTIALS.username)).toBeVisible();
    expect(screen.getByText(PRACTICE_CREDENTIALS.password)).toBeVisible();
  });

  it('has username and password inputs', async () => {
    render(<FakeAuthLab />);
    await waitFor(() => expect(screen.getByLabelText(/username/i)).toBeVisible());
    expect(screen.getByLabelText(/password/i)).toBeVisible();
  });

  it('shows an error alert when wrong credentials are submitted', async () => {
    const user = userEvent.setup();
    render(<FakeAuthLab />);

    await waitFor(() => expect(screen.getByLabelText(/username/i)).toBeVisible());

    await user.type(screen.getByLabelText(/username/i), 'wrong');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByText(/incorrect credentials/i)).toBeVisible();
  });

  it('writes session and navigates to protected page on correct credentials', async () => {
    const user = userEvent.setup();
    render(<FakeAuthLab />);

    await waitFor(() => expect(screen.getByLabelText(/username/i)).toBeVisible());

    await user.type(screen.getByLabelText(/username/i), PRACTICE_CREDENTIALS.username);
    await user.type(screen.getByLabelText(/password/i), PRACTICE_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockPush).toHaveBeenCalledWith('/practice/fake-auth/protected');
    expect(localStorage.getItem('stagecraft_fake_session')).not.toBeNull();
  });

  it('trims whitespace around the username before validating', async () => {
    const user = userEvent.setup();
    render(<FakeAuthLab />);

    await waitFor(() => expect(screen.getByLabelText(/username/i)).toBeVisible());

    await user.type(screen.getByLabelText(/username/i), `  ${PRACTICE_CREDENTIALS.username}  `);
    await user.type(screen.getByLabelText(/password/i), PRACTICE_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(mockPush).toHaveBeenCalledWith('/practice/fake-auth/protected');
  });
});

describe('FakeAuthLab — signed-in state', () => {
  beforeEach(() => {
    const session = buildSession(PRACTICE_CREDENTIALS.username, '2025-01-01T12:00:00.000Z');
    writeSession(session);
  });

  it('shows the signed-in panel when a session is active', async () => {
    render(<FakeAuthLab />);
    await waitFor(() =>
      expect(screen.getByText(/already signed in/i)).toBeVisible(),
    );
  });

  it('shows a link to the protected area', async () => {
    render(<FakeAuthLab />);
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /go to protected area/i })).toBeVisible(),
    );
  });

  it('clears the session and shows the sign-in form when Sign out is clicked', async () => {
    const user = userEvent.setup();
    render(<FakeAuthLab />);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /sign out/i })).toBeVisible(),
    );
    await user.click(screen.getByRole('button', { name: /sign out/i }));

    expect(localStorage.getItem('stagecraft_fake_session')).toBeNull();
    await waitFor(() =>
      expect(screen.getByRole('form', { name: /sign in/i })).toBeVisible(),
    );
  });
});
