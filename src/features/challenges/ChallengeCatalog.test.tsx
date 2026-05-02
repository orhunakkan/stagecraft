import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ChallengeCatalog } from './ChallengeCatalog';
import { challenges } from './challenge-data';

describe('ChallengeCatalog', () => {
  it('renders colorful challenge cards with key metadata', () => {
    render(<ChallengeCatalog challenges={challenges} />);

    expect(screen.getByRole('heading', { name: 'Challenge catalog' })).toBeVisible();
    expect(screen.getByText('10 challenges')).toBeVisible();

    const firstCard = screen.getByRole('article', { name: /accessible locators lab/i });
    expect(within(firstCard).getByText('beginner')).toBeVisible();
    expect(within(firstCard).getByText('20 min')).toBeVisible();
    expect(within(firstCard).getByText('Accessible locators')).toBeVisible();
    expect(within(firstCard).getByText('locators')).toBeVisible();
    expect(
      within(firstCard).getByRole('link', { name: /open accessible locators lab/i }),
    ).toHaveAttribute('href', '/challenges/accessible-locators');
  });

  it('filters by search, difficulty, and concept', async () => {
    const user = userEvent.setup();
    render(<ChallengeCatalog challenges={challenges} />);

    await user.type(screen.getByRole('searchbox', { name: /search challenges/i }), 'network');
    await user.selectOptions(screen.getByLabelText(/difficulty/i), 'intermediate');
    await user.selectOptions(
      screen.getByLabelText(/primary concept/i),
      'Network observation and API mocking',
    );

    expect(screen.getByText('1 challenge')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Network API Lab' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: 'Accessible Locators Lab' }),
    ).not.toBeInTheDocument();
  });

  it('shows an empty state and can reset filters', async () => {
    const user = userEvent.setup();
    render(<ChallengeCatalog challenges={challenges} />);

    await user.type(
      screen.getByRole('searchbox', { name: /search challenges/i }),
      'visual snapshots',
    );

    expect(screen.getByRole('status')).toHaveTextContent(/no challenges match/i);

    await user.click(screen.getByRole('button', { name: /reset filters/i }));

    expect(screen.getByText('10 challenges')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Accessible Locators Lab' })).toBeVisible();
  });
});
