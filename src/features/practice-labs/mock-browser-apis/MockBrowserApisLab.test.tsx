import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// jsdom does not implement window.matchMedia — provide a minimal stub.
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

import { MockBrowserApisLab } from './MockBrowserApisLab';

function setup() {
  const user = userEvent.setup();
  render(<MockBrowserApisLab />);
  return { user };
}

describe('MockBrowserApisLab', () => {
  it('renders the lab heading', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 1, name: /mock browser apis lab/i }),
    ).toBeVisible();
  });

  it('shows all three scenario sections', () => {
    setup();
    expect(screen.getByRole('region', { name: /geolocation panel/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /network status panel/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /user preferences panel/i })).toBeVisible();
  });

  it('shows idle status text for each panel on mount', () => {
    setup();
    expect(screen.getByText(/location not requested yet/i)).toBeVisible();
    expect(screen.getByText(/connection not checked yet/i)).toBeVisible();
    expect(screen.getByText(/preferences not detected yet/i)).toBeVisible();
  });

  // ── Geolocation panel ─────────────────────────────────────────────────────

  it('shows the Request Location button', () => {
    setup();
    expect(screen.getByRole('button', { name: /request location/i })).toBeVisible();
  });

  it('shows an error state when geolocation is unavailable', async () => {
    // jsdom does not implement navigator.geolocation, so clicking triggers the error path
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /request location/i }));

    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByText(/location unavailable/i)).toBeVisible();
  });

  // ── Network status panel ──────────────────────────────────────────────────

  it('shows the Check Connection button', () => {
    setup();
    expect(screen.getByRole('button', { name: /check connection status/i })).toBeVisible();
  });

  it('shows a connection result status after clicking Check Connection', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /check connection status/i }));

    expect(screen.getByRole('status', { name: /connection result/i })).toBeVisible();
  });

  it('displays an online or offline status after checking', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /check connection status/i }));

    // jsdom sets navigator.onLine to true by default
    expect(screen.getByLabelText(/online status/i)).toBeVisible();
  });

  // ── User preferences panel ────────────────────────────────────────────────

  it('shows the Detect Preferences button', () => {
    setup();
    expect(screen.getByRole('button', { name: /detect user preferences/i })).toBeVisible();
  });

  it('shows preferences result after clicking Detect Preferences', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /detect user preferences/i }));

    // The preferences result region has role="status" and aria-label="Preferences result"
    expect(screen.getByText(/preferences detected/i)).toBeVisible();
  });

  it('shows reduced motion and color scheme rows after detection', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /detect user preferences/i }));

    // The <dd> elements have aria-label — verify their text content is visible
    expect(screen.getByText(/reduced motion/i)).toBeVisible();
    expect(screen.getByText(/color scheme/i)).toBeVisible();
  });

  // ── Reset ─────────────────────────────────────────────────────────────────

  it('resets all panels to idle when reset lab is clicked', async () => {
    const { user } = setup();

    // Activate network and preferences panels
    await user.click(screen.getByRole('button', { name: /check connection status/i }));
    await user.click(screen.getByRole('button', { name: /detect user preferences/i }));

    expect(screen.getByRole('status', { name: /connection result/i })).toBeVisible();

    await user.click(screen.getByRole('button', { name: /reset lab/i }));

    expect(screen.getByText(/connection not checked yet/i)).toBeVisible();
    expect(screen.getByText(/preferences not detected yet/i)).toBeVisible();
  });
});
