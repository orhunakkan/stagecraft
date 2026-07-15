import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ClientStoragePartitioning } from '../../src/pages/practice/ClientStoragePartitioning';
import { ConsoleRuntimeDiagnostics } from '../../src/pages/practice/ConsoleRuntimeDiagnostics';
import { DebuggingReporting } from '../../src/pages/practice/DebuggingReporting';
import { FramesContexts } from '../../src/pages/practice/FramesContexts';
import { MultiTab } from '../../src/pages/practice/MultiTab';
import { MultiTabPopup } from '../../src/pages/practice/MultiTabPopup';
import { MultiTabWindow } from '../../src/pages/practice/MultiTabWindow';
import { StorageState } from '../../src/pages/practice/StorageState';

function clearWidgetCookie() {
  document.cookie = 'widget_partitioned=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

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
  sessionStorage.clear();
  clearWidgetCookie();
  Object.defineProperty(window, 'opener', { configurable: true, value: undefined });
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
      'width=480,height=360',
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

  test('handles incoming opener requests without losing the popup form', () => {
    const postMessage = vi.fn();
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: { postMessage },
    });

    render(<MultiTabPopup />);

    window.dispatchEvent(new MessageEvent('message', { data: { type: 'REQUEST_VALUE' } }));

    expect(postMessage).toHaveBeenCalledWith(
      { type: 'POPUP_RESULT', value: 'Hello from popup' },
      '*',
    );
    expect(screen.getByLabelText('Value to send to opener')).toBeVisible();
  });

  test('ignores unrelated opener messages', () => {
    const postMessage = vi.fn();
    Object.defineProperty(window, 'opener', {
      configurable: true,
      value: { postMessage },
    });

    render(<MultiTabPopup />);

    window.dispatchEvent(new MessageEvent('message', { data: { type: 'IGNORED' } }));

    expect(postMessage).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Value to send to opener')).toBeVisible();
  });

  test('does not show a sent state when no opener exists', () => {
    render(<MultiTabPopup />);

    fireEvent.click(screen.getByTestId('send-result'));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Value to send to opener')).toBeVisible();
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

describe('ClientStoragePartitioning', () => {
  test('cycles the theme preference and persists it to localStorage', () => {
    render(<ClientStoragePartitioning />);

    expect(screen.getByTestId('theme-pref-value')).toHaveTextContent('system');

    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme preference' }));
    expect(screen.getByTestId('theme-pref-value')).toHaveTextContent('dark');
    expect(localStorage.getItem('labTheme')).toBe('dark');

    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme preference' }));
    expect(screen.getByTestId('theme-pref-value')).toHaveTextContent('light');
  });

  test('persists the draft note to sessionStorage as it is typed', () => {
    render(<ClientStoragePartitioning />);

    fireEvent.change(screen.getByLabelText('Draft note'), {
      target: { value: 'Remember the widget cookie' },
    });

    expect(sessionStorage.getItem('labDraftNote')).toBe('Remember the widget cookie');
  });

  test('shows the widget as locked until the cookie is present, then unlocks on recheck', () => {
    render(<ClientStoragePartitioning />);

    expect(screen.getByTestId('widget-status')).toHaveTextContent('Widget locked');

    document.cookie = 'widget_partitioned=1; path=/;';
    fireEvent.click(screen.getByRole('button', { name: 'Re-check cookie' }));

    expect(screen.getByTestId('widget-status')).toHaveTextContent('Widget content unlocked');
  });
});

describe('ConsoleRuntimeDiagnostics', () => {
  test('logs an info, warning, and error message and records each in the action log', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ConsoleRuntimeDiagnostics />);

    fireEvent.click(screen.getByRole('button', { name: 'Log info' }));
    fireEvent.click(screen.getByRole('button', { name: 'Log warning' }));
    fireEvent.click(screen.getByRole('button', { name: 'Log error' }));

    expect(logSpy).toHaveBeenCalledWith('Info message logged');
    expect(warnSpy).toHaveBeenCalledWith('Warning message logged');
    expect(errorSpy).toHaveBeenCalledWith('Error message logged');
    expect(screen.getByTestId('action-log')).toHaveTextContent('Logged an info message');
    expect(screen.getByTestId('action-log')).toHaveTextContent('Logged a warning message');
    expect(screen.getByTestId('action-log')).toHaveTextContent('Logged an error message');
  });

  test('fetching a missing resource requests the expected path', () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValueOnce(jsonResponse({}, 404));

    render(<ConsoleRuntimeDiagnostics />);

    fireEvent.click(screen.getByRole('button', { name: 'Fetch a missing resource' }));

    expect(fetchMock).toHaveBeenCalledWith('/diagnostics-lab/missing-resource');
    expect(screen.getByTestId('action-log')).toHaveTextContent('Requested a missing resource');
  });

  test('records the throw action in the log without letting the timer fire during the test', () => {
    vi.useFakeTimers();

    render(<ConsoleRuntimeDiagnostics />);

    fireEvent.click(screen.getByRole('button', { name: 'Throw uncaught error' }));

    expect(screen.getByTestId('action-log')).toHaveTextContent('Threw an uncaught error');
  });
});
