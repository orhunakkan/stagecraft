import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { InitScripts } from '../../src/pages/practice/InitScripts';
import { ServerSentEvents } from '../../src/pages/practice/ServerSentEvents';
import { ShadowDom } from '../../src/pages/practice/ShadowDom';
import { SoftAssertions } from '../../src/pages/practice/SoftAssertions';
import { TouchGestures } from '../../src/pages/practice/TouchGestures';

// ---------------------------------------------------------------------------
// EventSource mock
// ---------------------------------------------------------------------------
class MockEventSource extends EventTarget {
  static instances: MockEventSource[] = [];
  url: string;
  readyState = 0;
  private handlers: Record<string, Array<(e: Event) => void>> = {};
  onerror: ((e: Event) => void) | null = null;

  constructor(url: string) {
    super();
    this.url = url;
    MockEventSource.instances.push(this);
  }

  override addEventListener(type: string, handler: (e: Event) => void) {
    (this.handlers[type] ??= []).push(handler);
  }

  emit(type: string, data?: unknown) {
    const e = Object.assign(new MessageEvent(type, { data: JSON.stringify(data) }));
    (this.handlers[type] ?? []).forEach((h) => h(e));
  }

  emitDone() {
    (this.handlers['done'] ?? []).forEach((h) => h(new Event('done')));
  }

  simulateError() {
    this.onerror?.(new Event('error'));
  }

  close() {
    this.readyState = 2;
  }
}

beforeEach(() => {
  localStorage.clear();
  MockEventSource.instances = [];
  vi.stubGlobal('EventSource', MockEventSource);

  // Suppress custom-element errors in jsdom — real shadow-DOM behaviour is
  // covered by the E2E suite; here we only test component logic.
  vi.spyOn(window.customElements, 'get').mockReturnValue(
    // Return a truthy value so defineRatingWidget / defineLabelledInput
    // take the early-return branch and never call customElements.define.
    class extends HTMLElement {} as CustomElementConstructor,
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete (window as Window & { __FLAGS__?: Record<string, boolean> }).__FLAGS__;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ===========================================================================
// ServerSentEvents
// ===========================================================================
describe('ServerSentEvents', () => {
  test('renders the empty log placeholder before streaming', () => {
    render(<ServerSentEvents />);
    expect(screen.getByLabelText('Empty log message')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Start Stream' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Stop Stream' })).toBeDisabled();
  });

  test('startStream creates an EventSource and appends a connecting entry', async () => {
    render(<ServerSentEvents />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start Stream' }));
    });
    expect(MockEventSource.instances).toHaveLength(1);
    expect(screen.getByRole('list', { name: 'SSE event log' })).toBeVisible();
    expect(screen.getByText('Connecting to stream…')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Stop Stream' })).toBeEnabled();
  });

  test('clicking Start Stream a second time is a no-op (guard branch)', async () => {
    render(<ServerSentEvents />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start Stream' }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start Stream' }));
    });
    // Only one EventSource should have been created
    expect(MockEventSource.instances).toHaveLength(1);
  });

  test('receiving a log event appends an entry to the list', async () => {
    render(<ServerSentEvents />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start Stream' }));
    });
    const es = MockEventSource.instances[0]!;
    await act(async () => {
      es.emit('log', { type: 'info', message: 'Build started' });
    });
    expect(screen.getByText('Build started')).toBeVisible();
    expect(screen.getByLabelText('info badge')).toBeVisible();
  });

  test('receiving a warn log event shows the warn badge', async () => {
    render(<ServerSentEvents />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start Stream' }));
    });
    const es = MockEventSource.instances[0]!;
    await act(async () => {
      es.emit('log', { type: 'warn', message: 'Deprecated API' });
    });
    expect(screen.getByLabelText('warn badge')).toBeVisible();
  });

  test('receiving an error log event shows the error badge', async () => {
    render(<ServerSentEvents />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start Stream' }));
    });
    const es = MockEventSource.instances[0]!;
    await act(async () => {
      es.emit('log', { type: 'error', message: 'Health check failed' });
    });
    expect(screen.getByLabelText('error badge')).toBeVisible();
  });

  test('malformed JSON in log event is silently ignored', async () => {
    render(<ServerSentEvents />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start Stream' }));
    });
    const es = MockEventSource.instances[0]!;
    const entryCountBefore = screen.getAllByRole('listitem').length;
    // Bypass JSON.stringify by directly dispatching a MessageEvent with bad data
    await act(async () => {
      (es as unknown as { handlers: Record<string, Array<(e: Event) => void>> }).handlers[
        'log'
      ]?.forEach((h) => h(new MessageEvent('log', { data: 'not-json{{{' })));
    });
    expect(screen.getAllByRole('listitem')).toHaveLength(entryCountBefore);
  });

  test('done event shows the stream-complete status and disables Stop', async () => {
    render(<ServerSentEvents />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start Stream' }));
    });
    const es = MockEventSource.instances[0]!;
    await act(async () => {
      es.emitDone();
    });
    expect(screen.getByLabelText('Stream done')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Stop Stream' })).toBeDisabled();
  });

  test('onerror shows an error system entry and stops streaming', async () => {
    render(<ServerSentEvents />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start Stream' }));
    });
    const es = MockEventSource.instances[0]!;
    await act(async () => {
      es.simulateError();
    });
    expect(screen.getByText(/Connection error/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Stop Stream' })).toBeDisabled();
  });

  test('stopStream appends a stopped entry and disables the Stop button', async () => {
    render(<ServerSentEvents />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start Stream' }));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Stop Stream' }));
    });
    expect(screen.getByText('Stream stopped by user.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Stop Stream' })).toBeDisabled();
  });

  test('stopStream when not streaming is a no-op (guard branch)', async () => {
    render(<ServerSentEvents />);
    // Stop without ever starting — should not throw
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Stop Stream' }));
    });
    expect(screen.getByLabelText('Empty log message')).toBeVisible();
  });

  test('unmount closes an active EventSource connection', async () => {
    const { unmount } = render(<ServerSentEvents />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Start Stream' }));
    });

    const es = MockEventSource.instances[0]!;
    expect(es.readyState).toBe(0);

    unmount();

    expect(es.readyState).toBe(2);
  });
});

// ===========================================================================
// TouchGestures
// ===========================================================================
describe('TouchGestures', () => {
  test('renders the tap counter at 0', () => {
    render(<TouchGestures />);
    expect(screen.getByTestId('tap-count')).toHaveTextContent('0');
  });

  test('touchstart on tap target increments the counter', async () => {
    render(<TouchGestures />);
    const btn = screen.getByLabelText('Tap target');
    await act(async () => {
      fireEvent.touchStart(btn, { touches: [{ clientX: 0, clientY: 0 }] });
    });
    expect(screen.getByTestId('tap-count')).toHaveTextContent('1');
    await act(async () => {
      fireEvent.touchStart(btn, { touches: [{ clientX: 0, clientY: 0 }] });
    });
    expect(screen.getByTestId('tap-count')).toHaveTextContent('2');
  });

  test('click on tap target does NOT increment the counter', async () => {
    render(<TouchGestures />);
    fireEvent.click(screen.getByLabelText('Tap target'));
    expect(screen.getByTestId('tap-count')).toHaveTextContent('0');
  });

  test('Next/Prev buttons navigate the carousel', async () => {
    render(<TouchGestures />);
    expect(screen.getByLabelText('Slide 1 — Tap', { exact: true })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByLabelText('Slide 2 — Swipe', { exact: true })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByLabelText('Slide 3 — Pinch', { exact: true })).toBeVisible();

    // Next is now disabled (last slide)
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(screen.getByLabelText('Slide 2 — Swipe', { exact: true })).toBeVisible();
  });

  test('Prev button is disabled on first slide', () => {
    render(<TouchGestures />);
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled();
  });

  test('keyboard ArrowRight / ArrowLeft navigates the carousel', async () => {
    render(<TouchGestures />);
    const carousel = screen.getByRole('region', { name: /^Carousel$/ });

    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(screen.getByLabelText('Slide 2 — Swipe', { exact: true })).toBeVisible();

    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
    expect(screen.getByLabelText('Slide 1 — Tap', { exact: true })).toBeVisible();
  });

  test('ArrowLeft on first slide stays on slide 1', () => {
    render(<TouchGestures />);
    const carousel = screen.getByRole('region', { name: /^Carousel$/ });
    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
    expect(screen.getByLabelText('Slide 1 — Tap', { exact: true })).toBeVisible();
  });

  test('swipe left (negative deltaX) advances to next slide', async () => {
    render(<TouchGestures />);
    const carousel = screen.getByRole('region', { name: /^Carousel$/ });
    await act(async () => {
      fireEvent.touchStart(carousel, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 100, clientY: 100 }] });
    });
    expect(screen.getByLabelText('Slide 2 — Swipe', { exact: true })).toBeVisible();
  });

  test('swipe right (positive deltaX) goes to previous slide', async () => {
    render(<TouchGestures />);
    const carousel = screen.getByRole('region', { name: /^Carousel$/ });
    // First go to slide 2
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));

    await act(async () => {
      fireEvent.touchStart(carousel, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 200, clientY: 100 }] });
    });
    expect(screen.getByLabelText('Slide 1 — Tap', { exact: true })).toBeVisible();
  });

  test('small swipe (deltaX <= 30) does not change slide', async () => {
    render(<TouchGestures />);
    const carousel = screen.getByRole('region', { name: /^Carousel$/ });
    await act(async () => {
      fireEvent.touchStart(carousel, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 115, clientY: 100 }] });
    });
    // Slide should still be 1
    expect(screen.getByLabelText('Slide 1 — Tap', { exact: true })).toBeVisible();
  });

  test('touchEnd without prior touchStart is a no-op (guard branch)', async () => {
    render(<TouchGestures />);
    const carousel = screen.getByRole('region', { name: /^Carousel$/ });
    // touchEnd without touchStart — startXRef.current is null, should not crash or change slide
    await act(async () => {
      fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 50, clientY: 100 }] });
    });
    expect(screen.getByLabelText('Slide 1 — Tap', { exact: true })).toBeVisible();
  });

  test('dot indicator buttons navigate to a specific slide', () => {
    render(<TouchGestures />);
    fireEvent.click(screen.getByRole('button', { name: 'Go to Slide 3 — Pinch' }));
    expect(screen.getByLabelText('Slide 3 — Pinch', { exact: true })).toBeVisible();
  });

  test('Inspect Touch Points button shows maxTouchPoints result', async () => {
    render(<TouchGestures />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Inspect Touch Points' }));
    });
    expect(screen.getByLabelText('Touch info result')).toBeVisible();
    expect(screen.getByLabelText('Touch info result')).toHaveTextContent('maxTouchPoints');
  });
});

// ===========================================================================
// ShadowDom
// ===========================================================================
describe('ShadowDom', () => {
  test('renders all three sections', () => {
    render(<ShadowDom />);
    expect(screen.getByRole('region', { name: 'Star Rating Widget' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Labelled Input Widget' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Submit Review' })).toBeVisible();
  });

  test('submit with no values shows the validation message', async () => {
    render(<ShadowDom />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Please choose a rating and enter a name.',
    );
  });

  test('defineRatingWidget early-return when already registered (mocked)', () => {
    // customElements.get is already mocked to return a truthy value in beforeEach,
    // so rendering ShadowDom should NOT call customElements.define.
    const defineSpy = vi.spyOn(window.customElements, 'define');
    render(<ShadowDom />);
    expect(defineSpy).not.toHaveBeenCalled();
  });

  test('defineRatingWidget and defineLabelledInput call define when not yet registered', () => {
    // Override the beforeEach spy: both widgets are unregistered → define is called for each
    vi.mocked(window.customElements.get)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined);
    const defineSpy = vi.spyOn(window.customElements, 'define').mockImplementation(() => {});
    render(<ShadowDom />);
    expect(defineSpy).toHaveBeenCalledWith('rating-widget', expect.any(Function));
    expect(defineSpy).toHaveBeenCalledWith('labelled-input', expect.any(Function));
  });

  test('submit with rating=3 shows plural "stars" result', async () => {
    render(<ShadowDom />);
    // jsdom renders unknown elements as plain HTMLElement — set the custom properties directly
    const ratingEl = document.querySelector('rating-widget') as HTMLElement;
    const inputEl = document.querySelector('labelled-input') as HTMLElement;
    Object.assign(ratingEl, { value: 3 });
    Object.assign(inputEl, { inputValue: 'Alice' });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    });
    expect(screen.getByRole('status')).toHaveTextContent('You rated "Alice" 3 stars.');
  });

  test('submit with rating=1 shows singular "star" result', async () => {
    render(<ShadowDom />);
    const ratingEl = document.querySelector('rating-widget') as HTMLElement;
    const inputEl = document.querySelector('labelled-input') as HTMLElement;
    Object.assign(ratingEl, { value: 1 });
    Object.assign(inputEl, { inputValue: 'Bob' });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    });
    expect(screen.getByRole('status')).toHaveTextContent('You rated "Bob" 1 star.');
  });
});

// ===========================================================================
// InitScripts
// ===========================================================================
describe('InitScripts', () => {
  test('shows onboarding modal when localStorage key is absent', () => {
    render(<InitScripts />);
    expect(screen.getByRole('dialog', { name: /welcome/i })).toBeVisible();
  });

  test('does not show onboarding modal when localStorage key is set', () => {
    localStorage.setItem('onboarded', 'true');
    render(<InitScripts />);
    expect(screen.queryByRole('dialog', { name: /welcome/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Onboarding state')).toHaveTextContent('Complete');
  });

  test('dismissing the modal sets localStorage and hides the dialog', async () => {
    render(<InitScripts />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /got it/i }));
    });
    expect(screen.queryByRole('dialog', { name: /welcome/i })).not.toBeInTheDocument();
    expect(localStorage.getItem('onboarded')).toBe('true');
  });

  test('beta feature banner is visible when window.__FLAGS__.betaFeature is true', () => {
    (window as Window & { __FLAGS__?: Record<string, boolean> }).__FLAGS__ = {
      betaFeature: true,
    };
    render(<InitScripts />);
    expect(screen.getByRole('banner', { name: 'Beta feature banner' })).toBeVisible();
    delete (window as Window & { __FLAGS__?: Record<string, boolean> }).__FLAGS__;
  });

  test('no banner when __FLAGS__ is not set', () => {
    render(<InitScripts />);
    expect(screen.queryByRole('banner', { name: 'Beta feature banner' })).not.toBeInTheDocument();
  });

  test('lucky number is rendered on mount', () => {
    render(<InitScripts />);
    expect(screen.getByTestId('lucky-number')).toBeVisible();
  });

  test('lucky number reflects stubbed Math.random', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.42);
    render(<InitScripts />);
    expect(screen.getByTestId('lucky-number')).toHaveTextContent('42');
  });
});

// ===========================================================================
// SoftAssertions
// ===========================================================================
describe('SoftAssertions', () => {
  test('renders the profile dashboard with all four widgets', () => {
    render(<SoftAssertions />);
    expect(screen.getByRole('list', { name: 'Profile completeness' })).toBeVisible();
    expect(screen.getByTestId('notification-count')).toHaveTextContent('3');
    expect(screen.getByTestId('activity-score')).toHaveTextContent('0');
    expect(screen.getByLabelText('Status badge')).toHaveTextContent('loading');
  });

  test('activity score updates to 87 after 2 s timer', async () => {
    vi.useFakeTimers();
    render(<SoftAssertions />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100);
    });
    expect(screen.getByTestId('activity-score')).toHaveTextContent('87');
  });

  test('status badge transitions from loading to active after 1.5 s', async () => {
    vi.useFakeTimers();
    render(<SoftAssertions />);
    expect(screen.getByLabelText('Status badge')).toHaveTextContent('loading');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });
    expect(screen.getByLabelText('Status badge')).toHaveTextContent('active');
  });

  test('profile widget shows correct user details', () => {
    render(<SoftAssertions />);
    expect(screen.getByRole('listitem', { name: 'Name field' })).toHaveTextContent('Jane Doe');
    expect(screen.getByRole('listitem', { name: 'Email field' })).toHaveTextContent(
      'jane@example.com',
    );
    expect(screen.getByRole('listitem', { name: 'Role field' })).toHaveTextContent('Engineer');
  });
});
