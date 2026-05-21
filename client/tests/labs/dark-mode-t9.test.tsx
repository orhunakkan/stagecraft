import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { VisualRegression } from '../../src/pages/practice/VisualRegression';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

function wrap(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

afterEach(() => {
  cleanup();
});

function Bomb(): never {
  throw new Error('test error');
}

describe('VisualRegression tokens', () => {
  test('section headings use text-content instead of text-zinc-900', () => {
    wrap(<VisualRegression />);
    const heading = screen.getByRole('heading', { name: /Button variants/i });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('intro paragraph uses text-muted instead of text-zinc-500', () => {
    const { container } = wrap(<VisualRegression />);
    const intro = container.querySelector('p.mb-8');
    expect(intro?.className).toContain('text-muted');
    expect(intro?.className).not.toContain('text-zinc-500');
  });

  test('intro code spans use bg-surface-raised instead of bg-zinc-100', () => {
    const { container } = wrap(<VisualRegression />);
    const codeSpan = container.querySelector('.mb-8 code');
    expect(codeSpan?.className).toContain('bg-surface-raised');
    expect(codeSpan?.className).not.toContain('bg-zinc-100');
  });

  test('indigo note panel has dark-mode classes', () => {
    const { container } = wrap(<VisualRegression />);
    const notePanel = container.querySelector('div.bg-indigo-50');
    expect(notePanel?.className).toContain('dark:bg-indigo-950');
    expect(notePanel?.className).toContain('dark:text-indigo-300');
  });
});

describe('ErrorBoundary tokens', () => {
  test('error alert panel has dark-mode variant classes', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    const alert = container.querySelector('[role="alert"]');
    expect(alert?.className).toContain('dark:bg-red-950');
    expect(alert?.className).toContain('dark:text-red-400');
    consoleError.mockRestore();
  });
});
