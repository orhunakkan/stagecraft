import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BrowserEventsLab } from './BrowserEventsLab';

// ─── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Mock native dialogs — jsdom doesn't implement them
  vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  vi.spyOn(window, 'prompt').mockReturnValue('hello');
  // Mock URL.createObjectURL and anchor.click for download tests
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('BrowserEventsLab', () => {
  it('renders the lab heading', () => {
    render(<BrowserEventsLab />);
    expect(screen.getByRole('heading', { level: 1, name: /browser events lab/i })).toBeVisible();
  });

  it('shows all event scenario sections', () => {
    render(<BrowserEventsLab />);
    expect(screen.getByRole('region', { name: /native dialogs/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /file upload/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /file download/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /popup and new tab/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /navigation events/i })).toBeVisible();
  });

  // ── Dialog panel ────────────────────────────────────────────────────────────

  it('shows the three dialog trigger buttons', () => {
    render(<BrowserEventsLab />);
    expect(screen.getByRole('button', { name: /trigger alert/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /trigger confirm/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /trigger prompt/i })).toBeVisible();
  });

  it('shows "Alert dismissed" result after triggering an alert', async () => {
    const user = userEvent.setup();
    render(<BrowserEventsLab />);

    await user.click(screen.getByRole('button', { name: /trigger alert/i }));

    expect(screen.getByText(/alert dismissed/i)).toBeVisible();
  });

  it('shows "Confirm: accepted" when confirm returns true', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<BrowserEventsLab />);

    await user.click(screen.getByRole('button', { name: /trigger confirm/i }));

    expect(screen.getByText(/confirm: accepted/i)).toBeVisible();
  });

  it('shows "Confirm: dismissed" when confirm returns false', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    render(<BrowserEventsLab />);

    await user.click(screen.getByRole('button', { name: /trigger confirm/i }));

    expect(screen.getByText(/confirm: dismissed/i)).toBeVisible();
  });

  it('shows the entered prompt value when prompt returns a string', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('practice input');
    const user = userEvent.setup();
    render(<BrowserEventsLab />);

    await user.click(screen.getByRole('button', { name: /trigger prompt/i }));

    expect(screen.getByText(/prompt value: "practice input"/i)).toBeVisible();
  });

  it('shows "Prompt: cancelled" when prompt returns null', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue(null);
    const user = userEvent.setup();
    render(<BrowserEventsLab />);

    await user.click(screen.getByRole('button', { name: /trigger prompt/i }));

    expect(screen.getByText(/prompt: cancelled/i)).toBeVisible();
  });

  // ── File upload panel ───────────────────────────────────────────────────────

  it('shows the file upload input with label', () => {
    render(<BrowserEventsLab />);
    expect(screen.getByLabelText(/choose file/i)).toBeVisible();
  });

  it('shows "No file selected" initially', () => {
    render(<BrowserEventsLab />);
    expect(screen.getByRole('status', { name: /no file selected/i })).toBeVisible();
  });

  it('shows filename and size after a file is selected', async () => {
    const user = userEvent.setup();
    render(<BrowserEventsLab />);

    const file = new File(['hello world'], 'practice.txt', { type: 'text/plain' });
    await user.upload(screen.getByLabelText(/choose file/i), file);

    await waitFor(() =>
      expect(screen.getByRole('listitem', { name: /practice\.txt/i })).toBeVisible(),
    );
    expect(screen.getByText('practice.txt')).toBeVisible();
  });

  it('shows multiple files when several are uploaded', async () => {
    const user = userEvent.setup();
    render(<BrowserEventsLab />);

    const files = [
      new File(['a'], 'file-a.txt', { type: 'text/plain' }),
      new File(['bb'], 'file-b.pdf', { type: 'application/pdf' }),
    ];
    await user.upload(screen.getByLabelText(/choose file/i), files);

    await waitFor(() => expect(screen.getByText('file-a.txt')).toBeVisible());
    expect(screen.getByText('file-b.pdf')).toBeVisible();
  });

  // ── Download panel ──────────────────────────────────────────────────────────

  it('shows the Download sample report button', () => {
    render(<BrowserEventsLab />);
    expect(screen.getByRole('button', { name: /download sample report/i })).toBeVisible();
  });

  it('shows "Download initiated" status after clicking the download button', async () => {
    const user = userEvent.setup();
    render(<BrowserEventsLab />);

    await user.click(screen.getByRole('button', { name: /download sample report/i }));

    const statusEl = screen.getByRole('status', { name: /download initiated/i });
    expect(statusEl).toBeVisible();
    // Filename appears in both the status text and the detail row
    // — check via the status element's text content to avoid strict-mode violation
    expect(statusEl).toHaveTextContent(/stagecraft-sample-report\.txt/i);
  });

  it('calls URL.createObjectURL when the download button is clicked', async () => {
    const user = userEvent.setup();
    render(<BrowserEventsLab />);

    await user.click(screen.getByRole('button', { name: /download sample report/i }));

    expect(URL.createObjectURL).toHaveBeenCalledOnce();
  });

  // ── Popup and navigation panels ─────────────────────────────────────────────

  it('exposes a popup link with a same-origin hash target', () => {
    render(<BrowserEventsLab />);

    const link = screen.getByRole('link', { name: /open popup note in new tab/i });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', '/practice/browser-events#popup-note');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('exposes a navigation link to the challenge detail page', () => {
    render(<BrowserEventsLab />);

    const link = screen.getByRole('link', {
      name: /navigate to browser events challenge detail/i,
    });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute('href', '/challenges/browser-events');
  });

  // ── Reset ───────────────────────────────────────────────────────────────────

  it('resets all panels to their initial state when reset lab is clicked', async () => {
    const user = userEvent.setup();
    render(<BrowserEventsLab />);

    // Trigger a dialog result
    await user.click(screen.getByRole('button', { name: /trigger alert/i }));
    expect(screen.getByText(/alert dismissed/i)).toBeVisible();

    await user.click(screen.getByRole('button', { name: /reset lab/i }));

    // After reset — no result shown
    expect(screen.queryByText(/alert dismissed/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no dialog triggered yet/i)).toBeVisible();
  });
});
