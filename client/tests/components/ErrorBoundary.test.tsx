import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

// Suppress React's error boundary console output during tests
const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
afterEach(() => consoleError.mockClear());

function Bomb(): never {
  throw new Error('Test explosion');
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeVisible();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeVisible();
    expect(screen.getByText(/something went wrong/i)).toBeVisible();
  });

  it('displays the error message in the fallback', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/test explosion/i)).toBeVisible();
  });
});
