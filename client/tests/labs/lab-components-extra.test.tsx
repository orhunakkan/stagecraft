import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AccessibilityScanning } from '../../src/pages/practice/AccessibilityScanning';
import { AccessibleLocators } from '../../src/pages/practice/AccessibleLocators';
import { AriaSnapshots } from '../../src/pages/practice/AriaSnapshots';
import { BrowserEvents } from '../../src/pages/practice/BrowserEvents';
import { EmulationInput } from '../../src/pages/practice/EmulationInput';
import { GeolocationPermissions } from '../../src/pages/practice/GeolocationPermissions';
import { MediaLocale } from '../../src/pages/practice/MediaLocale';
import { VisualRegression } from '../../src/pages/practice/VisualRegression';
import { WebSocketInterception } from '../../src/pages/practice/WebSocketInterception';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined });
});

describe('AccessibilityScanning', () => {
  test('toggles between the intentionally broken and accessible form states', () => {
    render(<AccessibilityScanning />);

    expect(screen.getByText('Has violations')).toBeVisible();
    expect(screen.getByPlaceholderText('Your name')).toBeVisible();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Show accessible controls'));

    expect(screen.getByText('Accessible')).toBeVisible();
    expect(screen.getByLabelText('Your Name')).toBeVisible();
    expect(screen.getByAltText('Indigo decorative bar')).toBeVisible();
  });
});

describe('AccessibleLocators', () => {
  test('filters books by case-insensitive title search', () => {
    render(<AccessibleLocators />);

    fireEvent.change(screen.getByLabelText('Search books'), {
      target: { value: 'clean' },
    });

    expect(screen.getByRole('status')).toHaveTextContent('Showing 1 of 6 books');
    expect(screen.getByRole('heading', { level: 3, name: 'Clean Code' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { level: 3, name: 'Refactoring' }),
    ).not.toBeInTheDocument();
  });

  test('filters books by genre selection', () => {
    render(<AccessibleLocators />);

    fireEvent.change(screen.getByLabelText('Filter by genre'), {
      target: { value: 'Architecture' },
    });

    expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 6 books');
    expect(screen.getByRole('heading', { name: 'Design Patterns' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Domain-Driven Design' })).toBeVisible();
  });

  test('shows an empty state when no books match', () => {
    render(<AccessibleLocators />);

    fireEvent.change(screen.getByLabelText('Search books'), {
      target: { value: 'nonexistent xyz' },
    });

    expect(screen.getByRole('status')).toHaveTextContent('No books found.');
    expect(screen.getByText('Try a different search or filter.')).toBeVisible();
  });

  test('toggles wishlist membership and updates the live alert count', () => {
    render(<AccessibleLocators />);

    const wishlistButtons = screen.getAllByRole('button', { name: 'Add to wishlist' });
    fireEvent.click(wishlistButtons[0]!);

    expect(screen.getByRole('alert')).toHaveTextContent('1 book in your wishlist');
    expect(wishlistButtons[0]).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(wishlistButtons[1]!);
    expect(screen.getByRole('alert')).toHaveTextContent('2 books in your wishlist');

    fireEvent.click(wishlistButtons[0]!);
    expect(screen.getByRole('alert')).toHaveTextContent('1 book in your wishlist');
  });
});

describe('BrowserEvents', () => {
  test('records accepted alert dialog result', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    render(<BrowserEvents />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger alert' }));

    expect(alertSpy).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('Last dialog: alert');
    expect(screen.getByRole('status')).toHaveTextContent('accepted');
  });

  test('records dismissed confirm dialog result', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<BrowserEvents />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger confirm' }));

    expect(screen.getByRole('status')).toHaveTextContent('Last dialog: confirm');
    expect(screen.getByRole('status')).toHaveTextContent('dismissed');
  });

  test('records accepted confirm dialog result', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<BrowserEvents />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger confirm' }));

    expect(screen.getByRole('status')).toHaveTextContent('Last dialog: confirm');
    expect(screen.getByRole('status')).toHaveTextContent('accepted');
  });

  test('records prompt result with the entered value', () => {
    vi.spyOn(window, 'prompt').mockReturnValue('Stagecraft');
    render(<BrowserEvents />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger prompt' }));

    expect(screen.getByRole('status')).toHaveTextContent('Last dialog: prompt');
    expect(screen.getByRole('status')).toHaveTextContent('"Stagecraft"');
  });

  test('shows the selected file name and size after upload', () => {
    render(<BrowserEvents />);

    const file = new File(['stagecraft'], 'sample.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('Upload a file') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(/Selected:/);
    expect(status).toHaveTextContent(/sample\.txt/);
  });

  test('shows the empty file state before any selection', () => {
    render(<BrowserEvents />);

    expect(screen.getByText('No file selected yet.')).toBeVisible();
  });

  test('records a dismissed prompt and clears the upload state when files are removed', () => {
    vi.spyOn(window, 'prompt').mockReturnValue(null);
    render(<BrowserEvents />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger prompt' }));
    expect(screen.getByRole('status')).toHaveTextContent('dismissed');

    const input = screen.getByLabelText('Upload a file') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.getByText('No file selected yet.')).toBeVisible();
  });
});

describe('GeolocationPermissions', () => {
  test('resolves geolocation and completes clipboard copy and paste flows', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) =>
          success({
            coords: { latitude: 41.8781, longitude: -87.6298 },
          } as GeolocationPosition),
        ),
      },
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue('https://stagecraft.test/share'),
      },
    });

    render(<GeolocationPermissions />);

    fireEvent.click(screen.getByRole('button', { name: 'Find Cafés Near Me' }));
    expect(screen.getByTestId('coords')).toHaveTextContent('41.8781');
    expect(screen.getByRole('list', { name: 'Nearby cafés' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Copy Share Link' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Link copied to clipboard!');

    fireEvent.click(screen.getByRole('button', { name: 'Paste' }));
    expect(await screen.findByLabelText('Pasted URL')).toHaveValue('https://stagecraft.test/share');
  });

  test('shows the loading state while geolocation is pending', async () => {
    let resolvePosition: PositionCallback | undefined;
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success: PositionCallback) => {
          resolvePosition = success;
        }),
      },
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn().mockResolvedValue(''),
      },
    });

    render(<GeolocationPermissions />);

    fireEvent.click(screen.getByRole('button', { name: 'Find Cafés Near Me' }));
    expect(screen.getByText('Requesting location…')).toBeVisible();

    act(() => {
      resolvePosition?.({
        coords: { latitude: 41.8781, longitude: -87.6298 },
      } as GeolocationPosition);
    });

    expect(screen.getByTestId('coords')).toHaveTextContent('41.8781');
  });

  test('renders permission denial and clipboard failure messages', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((_success: PositionCallback, error: PositionErrorCallback) =>
          error({ message: '' } as GeolocationPositionError),
        ),
      },
    });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('blocked')),
        readText: vi.fn().mockRejectedValue(new Error('blocked')),
      },
    });

    render(<GeolocationPermissions />);

    fireEvent.click(screen.getByRole('button', { name: 'Find Cafés Near Me' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Location access denied.');

    fireEvent.click(screen.getByRole('button', { name: 'Copy Share Link' }));
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('alert')
          .some((alert) => alert.textContent?.includes('Clipboard write blocked.')),
      ).toBe(true),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Paste' }));
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('alert')
          .some((alert) => alert.textContent?.includes('Clipboard read blocked.')),
      ).toBe(true),
    );
  });
});

describe('MediaLocale', () => {
  test('reacts to media query changes for colour scheme, motion, and print', () => {
    const listeners = new Map<string, (event: MediaQueryListEvent) => void>();
    window.matchMedia = vi.fn(
      (query: string) =>
        ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
            listeners.set(query, listener);
          },
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList,
    );

    render(<MediaLocale />);

    expect(screen.getByTestId('color-scheme-label')).toHaveTextContent('Dark');
    expect(screen.getByTestId('motion-label')).toHaveTextContent('Motion on');
    expect(screen.getByText('(Emulate print media to see the banner.)')).toBeVisible();

    act(() => {
      listeners.get('(prefers-color-scheme: dark)')?.({ matches: false } as MediaQueryListEvent);
      listeners.get('(prefers-reduced-motion: reduce)')?.({ matches: true } as MediaQueryListEvent);
      listeners.get('print')?.({ matches: true } as MediaQueryListEvent);
    });

    expect(screen.getByTestId('color-scheme-label')).toHaveTextContent('Light');
    expect(screen.getByTestId('motion-label')).toHaveTextContent('Reduced');
    expect(screen.getByTestId('print-banner')).toHaveTextContent('Print layout active');
  });

  test('supports the opposite initial media states and flips them back', () => {
    const listeners = new Map<string, (event: MediaQueryListEvent) => void>();
    window.matchMedia = vi.fn(
      (query: string) =>
        ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
            listeners.set(query, listener);
          },
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList,
    );

    render(<MediaLocale />);

    expect(screen.getByTestId('color-scheme-label')).toHaveTextContent('Light');
    expect(screen.getByTestId('motion-label')).toHaveTextContent('Reduced');

    act(() => {
      listeners.get('(prefers-color-scheme: dark)')?.({ matches: true } as MediaQueryListEvent);
      listeners.get('(prefers-reduced-motion: reduce)')?.({
        matches: false,
      } as MediaQueryListEvent);
    });

    expect(screen.getByTestId('color-scheme-label')).toHaveTextContent('Dark');
    expect(screen.getByTestId('motion-label')).toHaveTextContent('Motion on');
  });
});

describe('EmulationInput', () => {
  test('opens the command palette via the button', () => {
    render(<EmulationInput />);

    fireEvent.click(screen.getByRole('button', { name: 'Open command palette' }));

    expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeVisible();
    expect(screen.getByRole('option', { name: /New file/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('opens the palette with Ctrl+K and closes with Escape', () => {
    render(<EmulationInput />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeVisible();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument();
  });

  test('navigates options with arrow keys and selects with Enter', () => {
    render(<EmulationInput />);

    fireEvent.click(screen.getByRole('button', { name: 'Open command palette' }));
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Executed: Save');
  });

  test('selects a command directly from the list', () => {
    render(<EmulationInput />);

    fireEvent.click(screen.getByRole('button', { name: 'Open command palette' }));
    fireEvent.click(screen.getByRole('option', { name: /Open terminal/ }));

    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Executed: Open terminal');
  });

  test('arrow up does not go below the first item', () => {
    render(<EmulationInput />);

    fireEvent.click(screen.getByRole('button', { name: 'Open command palette' }));
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(screen.getByRole('status')).toHaveTextContent('Executed: New file');
  });

  test('shows and hides hover tooltip on mouse enter and leave', () => {
    render(<EmulationInput />);

    const button = screen.getByRole('button', { name: 'Hover over me' });
    fireEvent.mouseEnter(button);

    expect(screen.getByRole('tooltip')).toHaveTextContent('You found the tooltip!');

    fireEvent.mouseLeave(button);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('updates the scroll state when the scroll container moves', () => {
    render(<EmulationInput />);

    const container = screen.getByTestId('scroll-container');
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      value: 80,
    });

    fireEvent.scroll(container);

    expect(screen.getByRole('button', { name: '↑ Scroll to top' })).toBeVisible();
  });

  test('toggles the palette closed when Ctrl+K is pressed again', () => {
    render(<EmulationInput />);

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog', { name: 'Command palette' })).toBeVisible();

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument();
  });
});

describe('AriaSnapshots', () => {
  test('expands and collapses an accordion section and announces the change', () => {
    render(<AriaSnapshots />);

    const trigger = screen.getByRole('button', { name: 'What is an ARIA snapshot?' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'What is an ARIA snapshot?' })).toBeVisible();
    expect(screen.getByLabelText('Live announcements')).toHaveTextContent(
      'What is an ARIA snapshot? expanded',
    );

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByLabelText('Live announcements')).toHaveTextContent(
      'What is an ARIA snapshot? collapsed',
    );
  });

  test('only one accordion section is open at a time', () => {
    render(<AriaSnapshots />);

    fireEvent.click(screen.getByRole('button', { name: 'What is an ARIA snapshot?' }));
    fireEvent.click(screen.getByRole('button', { name: 'When should I use toMatchAriaSnapshot?' }));

    expect(screen.getByRole('button', { name: 'What is an ARIA snapshot?' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(
      screen.getByRole('button', { name: 'When should I use toMatchAriaSnapshot?' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  test('wizard advances aria-current=step when clicking Next', () => {
    render(<AriaSnapshots />);

    expect(screen.getByRole('button', { name: '1. Account' })).toHaveAttribute(
      'aria-current',
      'step',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByRole('button', { name: '2. Profile' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('button', { name: '1. Account' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('form', { name: 'Profile step' })).toBeVisible();
  });

  test('jumps directly to a wizard step when clicking the step button', () => {
    render(<AriaSnapshots />);

    fireEvent.click(screen.getByRole('button', { name: '3. Preferences' }));

    expect(screen.getByRole('button', { name: '3. Preferences' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('form', { name: 'Preferences step' })).toBeVisible();
  });

  test('Back button is disabled on the first step and Next is disabled on the last step', () => {
    render(<AriaSnapshots />);

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    }

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Back' })).toBeEnabled();
  });

  test('moves back from the last wizard step', () => {
    render(<AriaSnapshots />);

    fireEvent.click(screen.getByRole('button', { name: '4. Review' }));
    expect(screen.getByRole('form', { name: 'Review step' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByRole('button', { name: '3. Preferences' })).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByRole('form', { name: 'Preferences step' })).toBeVisible();
  });
});

describe('VisualRegression', () => {
  test('renders all five button variants with the Disabled one disabled', () => {
    render(<VisualRegression />);

    const showcase = screen.getByTestId('button-showcase');
    for (const label of ['Primary', 'Secondary', 'Danger', 'Ghost', 'Disabled']) {
      expect(within(showcase).getByRole('button', { name: label })).toBeVisible();
    }
    expect(within(showcase).getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  test('renders the six color swatches with hex codes', () => {
    render(<VisualRegression />);

    const palette = screen.getByTestId('color-palette');
    const names = ['Indigo 600', 'Violet 600', 'Sky 500', 'Emerald 500', 'Amber 400', 'Rose 500'];
    for (const name of names) {
      expect(within(palette).getByLabelText(`${name} color swatch`)).toBeVisible();
      expect(within(palette).getByText(name)).toBeVisible();
    }
    expect(within(palette).getByText('#4f46e5')).toBeVisible();
  });

  test('renders three metric cards each with a dynamic timestamp region for masking', () => {
    render(<VisualRegression />);

    const cards = screen.getByTestId('metric-cards');
    expect(within(cards).getAllByTestId('dynamic-timestamp')).toHaveLength(3);
    expect(within(cards).getByText('Page views')).toBeVisible();
    expect(within(cards).getByText('Unique users')).toBeVisible();
    expect(within(cards).getByText('Bounce rate')).toBeVisible();
  });

  test('renders the bar chart with one bar per weekday', () => {
    render(<VisualRegression />);

    const chart = screen.getByRole('img', { name: 'Weekly sessions bar chart' });
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (const day of days) {
      expect(within(chart).getByText(day)).toBeVisible();
    }
  });
});

describe('WebSocketInterception', () => {
  class FakeWebSocket {
    static OPEN = 1;
    static CLOSED = 3;
    static CONNECTING = 0;
    static instances: FakeWebSocket[] = [];

    url: string;
    readyState = FakeWebSocket.CONNECTING;
    onopen: (() => void) | null = null;
    onmessage: ((e: { data: string }) => void) | null = null;
    onerror: (() => void) | null = null;
    onclose: (() => void) | null = null;
    sent: string[] = [];

    constructor(url: string) {
      this.url = url;
      FakeWebSocket.instances.push(this);
    }

    triggerOpen() {
      this.readyState = FakeWebSocket.OPEN;
      this.onopen?.();
    }

    triggerMessage(data: string) {
      this.onmessage?.({ data });
    }

    triggerBinaryMessage() {
      this.onmessage?.({ data: new Uint8Array([1, 2, 3]) as unknown as string });
    }

    triggerError() {
      this.onerror?.();
    }

    send(data: string) {
      this.sent.push(data);
    }

    close() {
      this.readyState = FakeWebSocket.CLOSED;
      this.onclose?.();
    }
  }

  let originalWebSocket: typeof WebSocket;

  beforeEach(() => {
    FakeWebSocket.instances = [];
    originalWebSocket = globalThis.WebSocket;
    // @ts-expect-error -- assigning a minimal fake for tests
    globalThis.WebSocket = FakeWebSocket;
  });

  afterEach(() => {
    globalThis.WebSocket = originalWebSocket;
  });

  test('starts in the disconnected state with send controls disabled', () => {
    render(<WebSocketInterception />);

    expect(screen.getByTestId('ws-status')).toHaveTextContent('disconnected');
    expect(screen.getByLabelText('Message to send')).toBeDisabled();
    expect(screen.getByTestId('ws-send')).toBeDisabled();
    expect(screen.getByTestId('ws-disconnect')).toBeDisabled();
    expect(screen.getByTestId('ws-connect')).toBeEnabled();
  });

  test('connects and logs the welcome message, then sends and logs a user message', () => {
    render(<WebSocketInterception />);

    fireEvent.click(screen.getByTestId('ws-connect'));
    expect(FakeWebSocket.instances).toHaveLength(1);

    const fake = FakeWebSocket.instances[0]!;
    act(() => fake.triggerOpen());

    expect(screen.getByTestId('ws-status')).toHaveTextContent('connected');
    expect(screen.getByLabelText('WebSocket message log')).toHaveTextContent('Connected to server');

    const input = screen.getByLabelText('Message to send');
    fireEvent.change(input, { target: { value: 'hello socket' } });
    fireEvent.click(screen.getByTestId('ws-send'));

    expect(fake.sent).toEqual(['hello socket']);
    expect(screen.getByLabelText('WebSocket message log')).toHaveTextContent('hello socket');
    expect(input).toHaveValue('');
  });

  test('renders incoming server messages in the log', () => {
    render(<WebSocketInterception />);

    fireEvent.click(screen.getByTestId('ws-connect'));
    const fake = FakeWebSocket.instances[0]!;
    act(() => fake.triggerOpen());
    act(() => fake.triggerMessage('echo: hello'));

    expect(screen.getByLabelText('WebSocket message log')).toHaveTextContent('echo: hello');
  });

  test('renders binary frames and socket errors', () => {
    render(<WebSocketInterception />);

    fireEvent.click(screen.getByTestId('ws-connect'));
    const fake = FakeWebSocket.instances[0]!;
    act(() => fake.triggerOpen());
    act(() => fake.triggerBinaryMessage());

    expect(screen.getByLabelText('WebSocket message log')).toHaveTextContent('[binary]');

    act(() => fake.triggerError());
    expect(screen.getByTestId('ws-status')).toHaveTextContent('error');
  });

  test('does not create a second socket while the current one is open', () => {
    render(<WebSocketInterception />);

    fireEvent.click(screen.getByTestId('ws-connect'));
    const fake = FakeWebSocket.instances[0]!;
    act(() => fake.triggerOpen());

    const connectButton = screen.getByTestId('ws-connect') as HTMLButtonElement;
    connectButton.disabled = false;
    connectButton.removeAttribute('disabled');
    fireEvent.click(connectButton);

    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  test('disconnects and returns to the disconnected state', () => {
    render(<WebSocketInterception />);

    fireEvent.click(screen.getByTestId('ws-connect'));
    const fake = FakeWebSocket.instances[0]!;
    act(() => fake.triggerOpen());

    act(() => {
      fireEvent.click(screen.getByTestId('ws-disconnect'));
    });

    expect(screen.getByTestId('ws-status')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('ws-disconnect')).toBeDisabled();
    expect(screen.getByTestId('ws-connect')).toBeEnabled();
  });

  test('does not send blank messages while connected', () => {
    render(<WebSocketInterception />);

    fireEvent.click(screen.getByTestId('ws-connect'));
    const fake = FakeWebSocket.instances[0]!;
    act(() => fake.triggerOpen());

    fireEvent.change(screen.getByLabelText('Message to send'), { target: { value: '   ' } });

    expect(screen.getByTestId('ws-send')).toBeDisabled();
    expect(fake.sent).toEqual([]);
  });

  test('does not send messages when the socket is no longer open', () => {
    render(<WebSocketInterception />);

    fireEvent.click(screen.getByTestId('ws-connect'));
    const fake = FakeWebSocket.instances[0]!;
    act(() => fake.triggerOpen());

    const input = screen.getByLabelText('Message to send');

    fireEvent.change(input, { target: { value: 'queued message' } });

    fake.readyState = FakeWebSocket.CLOSED;
    fireEvent.click(screen.getByTestId('ws-send'));

    expect(fake.sent).toEqual([]);
    expect(screen.getByLabelText('WebSocket message log')).not.toHaveTextContent('queued message');
  });

  test('closes the active socket on unmount', () => {
    const { unmount } = render(<WebSocketInterception />);

    fireEvent.click(screen.getByTestId('ws-connect'));
    const fake = FakeWebSocket.instances[0]!;
    act(() => fake.triggerOpen());

    unmount();

    expect(fake.readyState).toBe(FakeWebSocket.CLOSED);
  });
});
