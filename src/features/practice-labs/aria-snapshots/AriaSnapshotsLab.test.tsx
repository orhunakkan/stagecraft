import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AriaSnapshotsLab } from './AriaSnapshotsLab';

function setup() {
  const user = userEvent.setup();
  render(<AriaSnapshotsLab />);
  return { user };
}

describe('AriaSnapshotsLab', () => {
  it('renders the lab heading', () => {
    setup();
    expect(
      screen.getByRole('heading', { level: 1, name: /aria snapshots lab/i }),
    ).toBeVisible();
  });

  it('shows all three scenario sections', () => {
    setup();
    expect(screen.getByRole('region', { name: /navigation section/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /feature registry section/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /faq accordion section/i })).toBeVisible();
  });

  // ── Scenario 1: Navigation ────────────────────────────────────────────────

  it('renders all four navigation links', () => {
    setup();
    const nav = screen.getByRole('navigation', { name: /site navigation/i });
    expect(nav).toBeVisible();

    expect(screen.getByRole('link', { name: 'Overview' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Documentation' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'API Reference' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Examples' })).toBeVisible();
  });

  it('marks the Overview link as the current page', () => {
    setup();
    const currentLink = screen.getByRole('link', { name: 'Overview' });
    expect(currentLink).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark other links as current', () => {
    setup();
    expect(screen.getByRole('link', { name: 'Documentation' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'API Reference' })).not.toHaveAttribute('aria-current');
  });

  // ── Scenario 2: Feature registry ─────────────────────────────────────────

  it('renders the platform features list', () => {
    setup();
    expect(screen.getByRole('list', { name: /platform features/i })).toBeVisible();
  });

  it('shows all four feature names', () => {
    setup();
    expect(screen.getByText('Authentication')).toBeVisible();
    expect(screen.getByText('Webhooks')).toBeVisible();
    expect(screen.getByText('GraphQL API')).toBeVisible();
    expect(screen.getByText('XML Export')).toBeVisible();
  });

  it('shows the correct status badges for features', () => {
    setup();
    // Two features have Active status — use getAllByLabelText and check there are two
    const activeBadges = screen.getAllByLabelText('Status: Active');
    expect(activeBadges).toHaveLength(2);
    expect(screen.getByLabelText('Status: Beta')).toBeVisible();
    expect(screen.getByLabelText('Status: Deprecated')).toBeVisible();
  });

  // ── Scenario 3: FAQ accordion ─────────────────────────────────────────────

  it('renders four FAQ disclosure buttons', () => {
    setup();
    const faqRegion = screen.getByLabelText(/frequently asked questions/i);
    const buttons = faqRegion.querySelectorAll('button');
    expect(buttons).toHaveLength(4);
  });

  it('starts with all FAQ items collapsed', () => {
    setup();
    const buttons = screen.getAllByRole('button', { name: /how are api rate limits/i });
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
  });

  it('expands a FAQ item when clicked', async () => {
    const { user } = setup();
    const button = screen.getByRole('button', { name: /how are api rate limits/i });

    await user.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: /how are api rate limits/i })).toBeVisible();
  });

  it('collapses an open FAQ item when clicked again', async () => {
    const { user } = setup();
    const button = screen.getByRole('button', { name: /how are api rate limits/i });

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('region', { name: /how are api rate limits/i }),
    ).not.toBeInTheDocument();
  });

  it('can expand multiple FAQ items independently', async () => {
    const { user } = setup();
    const first = screen.getByRole('button', { name: /how are api rate limits/i });
    const second = screen.getByRole('button', { name: /which authentication methods/i });

    await user.click(first);
    await user.click(second);

    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(second).toHaveAttribute('aria-expanded', 'true');
  });

  // ── Reset ─────────────────────────────────────────────────────────────────

  it('collapses all FAQ items when the lab is reset', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: /how are api rate limits/i }));
    expect(
      screen.getByRole('button', { name: /how are api rate limits/i }),
    ).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('button', { name: /reset lab/i }));

    expect(
      screen.getByRole('button', { name: /how are api rate limits/i }),
    ).toHaveAttribute('aria-expanded', 'false');
  });
});
