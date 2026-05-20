import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { DebuggingReporting } from '../../src/pages/practice/DebuggingReporting';
import { FramesContexts } from '../../src/pages/practice/FramesContexts';
import { MultiTab } from '../../src/pages/practice/MultiTab';
import { MultiTabPopup } from '../../src/pages/practice/MultiTabPopup';
import { MultiTabWindow } from '../../src/pages/practice/MultiTabWindow';
import { StorageState } from '../../src/pages/practice/StorageState';

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

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('DebuggingReporting', () => {
  test('exercises flaky, slow, ticking, and screenshot states', async () => {
    vi.useFakeTimers();
    render(<DebuggingReporting />);

    fireEvent.click(screen.getByTestId('flaky-button'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.getByTestId('flaky-success')).toBeVisible();

    fireEvent.click(screen.getByTestId('flaky-button'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    fireEvent.click(screen.getByTestId('flaky-button'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(screen.getByTestId('flaky-error')).toBeVisible();

    fireEvent.click(screen.getByTestId('slow-button'));
    expect(screen.getByRole('status', { name: 'Loading' })).toBeVisible();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(screen.getByTestId('slow-result')).toBeVisible();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByTestId('live-counter')).toHaveTextContent(/\d+s/);

    fireEvent.click(screen.getByRole('button', { name: 'Expand panel' }));
    expect(screen.getByTestId('expandable-panel')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Collapse panel' }));
    expect(screen.queryByTestId('expandable-panel')).not.toBeInTheDocument();
  });
});

describe('FramesContexts', () => {
  test('switches between the counter and login iframe challenges', () => {
    render(<FramesContexts />);

    expect(screen.getByRole('tab', { name: 'Challenge 1' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTitle('Counter frame')).toBeVisible();

    fireEvent.click(screen.getByRole('tab', { name: 'Challenge 2' }));

    expect(screen.getByRole('tab', { name: 'Challenge 2' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByTitle('Login frame')).toBeVisible();
    expect(screen.queryByTitle('Counter frame')).not.toBeInTheDocument();
  });
});

describe('MultiTab flows', () => {
  test('opens the dashboard and popup URLs and displays shared storage', () => {
    localStorage.setItem('multi-tab:shared', 'from-another-tab');
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(<MultiTab />);

    expect(screen.getByTestId('shared-storage-value')).toHaveTextContent('from-another-tab');
    fireEvent.click(screen.getByRole('button', { name: 'Open dashboard in new tab' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open popup window' }));

    expect(openSpy).toHaveBeenCalledWith(
      '/practice/multi-tab/window',
      '_blank',
      'noopener,noreferrer',
    );
    expect(openSpy).toHaveBeenCalledWith(
      '/practice/multi-tab/popup',
      'stagecraft-popup',
      'width=480,height=360,noopener',
    );
  });

  test('increments the new-tab counter and writes shared storage', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1779292800000);
    render(<MultiTabWindow />);

    fireEvent.click(screen.getByRole('button', { name: 'Increment' }));
    expect(screen.getByTestId('tab-counter')).toHaveTextContent('1');

    fireEvent.click(screen.getByTestId('write-storage'));
    expect(localStorage.getItem('multi-tab:shared')).toBe('written-from-tab-1779292800000');
    expect(screen.getByTestId('tab-counter')).toHaveTextContent('2');
  });

  test('sends popup results to the opener', () => {
    const postMessage = vi.fn();
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: { postMessage },
    });

    render(<MultiTabPopup />);

    fireEvent.change(screen.getByLabelText('Value to send to opener'), {
      target: { value: 'Popup payload' },
    });
    fireEvent.click(screen.getByTestId('send-result'));

    expect(postMessage).toHaveBeenCalledWith(
      { type: 'POPUP_RESULT', value: 'Popup payload' },
      window.location.origin,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Sent!');
  });
});

describe('StorageState', () => {
  test('renders an admin profile with admin stats', async () => {
    const fetchMock = mockFetch();
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ id: 1, username: 'alice', displayName: 'Alice Smith', role: 'admin' }),
      )
      .mockResolvedValueOnce(jsonResponse({ totalUsers: 42, pendingReviews: 3 }));

    render(<StorageState />);

    expect(await screen.findByTestId('display-name')).toHaveTextContent('Alice Smith');
    expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
    expect(screen.getByTestId('total-users')).toHaveTextContent('42');
    expect(screen.getByTestId('pending-reviews')).toHaveTextContent('3');
  });

  test('renders regular and unauthenticated states without the admin panel', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ id: 2, username: 'bob', displayName: 'Bob Stone', role: 'user' }),
    );

    const { unmount } = render(<StorageState />);

    expect(await screen.findByTestId('display-name')).toHaveTextContent('Bob Stone');
    expect(screen.queryByTestId('admin-panel')).not.toBeInTheDocument();

    unmount();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 401));
    render(<StorageState />);
    expect(await screen.findByTestId('not-authenticated')).toBeVisible();
  });

  test('renders profile load failures', async () => {
    const fetchMock = mockFetch();
    fetchMock.mockRejectedValueOnce(new Error('offline'));

    render(<StorageState />);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load profile'),
    );
  });
});
