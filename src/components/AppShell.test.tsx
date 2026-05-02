import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders accessible navigation around page content', () => {
    render(
      <AppShell>
        <main>
          <h1>Page content</h1>
        </main>
      </AppShell>,
    );

    const navigation = screen.getByRole('navigation', { name: /primary/i });

    expect(within(navigation).getByRole('link', { name: /stagecraft home/i })).toHaveAttribute(
      'href',
      '/',
    );
    expect(within(navigation).getByRole('link', { name: /challenges/i })).toHaveAttribute(
      'href',
      '/challenges',
    );
    expect(within(navigation).getByRole('link', { name: /practice areas/i })).toHaveAttribute(
      'href',
      '/#practice-areas',
    );
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Page content' })).toBeVisible();
  });
});
