/**
 * Verify that shared components and Home use semantic token classes so that
 * dark mode CSS variables take effect. Tests intentionally inspect className
 * strings because jsdom cannot evaluate CSS — token class presence is the
 * only testable proxy for "this element will be readable in dark mode".
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { MemoryRouter } from 'react-router';
import { LabCard } from '../../src/components/LabCard';
import { LabHeader } from '../../src/components/LabHeader';
import { Home } from '../../src/pages/Home';
import type { Lab } from '../../src/labs';

const readyLab: Lab = {
  slug: 'test-lab',
  title: 'Test Lab',
  topic: 'Topic text',
  apis: ['page.goto', 'locator.click'],
  status: 'ready',
  requiresBackend: false,
};

const comingSoonLab: Lab = {
  slug: 'test-soon',
  title: 'Test Soon',
  topic: 'Soon topic',
  apis: ['page.evaluate'],
  status: 'coming-soon',
  requiresBackend: false,
};

function wrap(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('LabCard token classes', () => {
  test('ready card article uses bg-surface instead of bg-white', () => {
    const { container } = wrap(<LabCard lab={readyLab} />);
    const article = container.querySelector('article');
    expect(article?.className).toContain('bg-surface');
    expect(article?.className).not.toContain('bg-white');
  });

  test('coming-soon card article uses bg-canvas instead of bg-zinc-50', () => {
    const { container } = wrap(<LabCard lab={comingSoonLab} />);
    const article = container.querySelector('article');
    expect(article?.className).toContain('bg-canvas');
    expect(article?.className).not.toContain('bg-zinc-50');
  });

  test('ready card article uses border-edge instead of border-zinc-200', () => {
    const { container } = wrap(<LabCard lab={readyLab} />);
    const article = container.querySelector('article');
    expect(article?.className).toContain('border-edge');
    expect(article?.className).not.toContain('border-zinc-200');
  });

  test('lab title uses text-content instead of text-zinc-900', () => {
    wrap(<LabCard lab={readyLab} />);
    const heading = screen.getByRole('heading', { name: 'Test Lab' });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('api chip uses bg-surface-raised instead of bg-zinc-100', () => {
    const { container } = wrap(<LabCard lab={readyLab} />);
    const chip = container.querySelector('[class*="font-mono"]');
    expect(chip?.className).toContain('bg-surface-raised');
    expect(chip?.className).not.toContain('bg-zinc-100');
  });

  test('Done badge has dark-mode variant classes', () => {
    wrap(<LabCard lab={readyLab} completed />);
    const badge = screen.getByText('✓ Done');
    expect(badge.className).toContain('dark:');
  });
});

describe('LabHeader token classes', () => {
  test('container uses border-edge instead of border-zinc-200', () => {
    const { container } = wrap(<LabHeader lab={readyLab} />);
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain('border-edge');
    expect(wrapper?.className).not.toContain('border-zinc-200');
  });

  test('heading uses text-content instead of text-zinc-900', () => {
    wrap(<LabHeader lab={readyLab} />);
    const heading = screen.getByRole('heading', { name: 'Test Lab' });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('topic paragraph uses text-muted instead of text-zinc-500', () => {
    const { container } = wrap(<LabHeader lab={readyLab} />);
    const topic = container.querySelector('p');
    expect(topic?.className).toContain('text-muted');
    expect(topic?.className).not.toContain('text-zinc-500');
  });

  test('Mark complete button uses bg-surface instead of bg-white', () => {
    wrap(<LabHeader lab={readyLab} />);
    const btn = screen.getByRole('button', { name: 'Mark complete' });
    expect(btn.className).toContain('bg-surface');
    expect(btn.className).not.toContain('bg-white');
  });

  test('Mark complete toggles the completed state label', () => {
    wrap(<LabHeader lab={readyLab} />);

    fireEvent.click(screen.getByRole('button', { name: 'Mark complete' }));

    expect(screen.getByRole('button', { name: '✓ Completed' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('Home token classes', () => {
  test('page heading uses text-content instead of text-zinc-900', () => {
    wrap(<Home />);
    const heading = screen.getByRole('heading', { name: 'Practice Labs' });
    expect(heading.className).toContain('text-content');
    expect(heading.className).not.toContain('text-zinc-900');
  });

  test('description paragraph uses text-muted instead of text-zinc-500', () => {
    const { container } = wrap(<Home />);
    const desc = container.querySelector('p');
    expect(desc?.className).toContain('text-muted');
    expect(desc?.className).not.toContain('text-zinc-500');
  });
});
