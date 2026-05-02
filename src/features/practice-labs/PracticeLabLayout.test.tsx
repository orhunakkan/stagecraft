import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PracticeLabLayout } from './PracticeLabLayout';

const defaultProps = {
  labTitle: 'Accessible Locators Lab',
  challengeId: 'accessible-locators',
  objective: 'Recognize how roles, labels, and visible text make automation resilient.',
  onReset: vi.fn(),
};

describe('PracticeLabLayout', () => {
  it('renders the lab title as the main heading', () => {
    render(<PracticeLabLayout {...defaultProps}>Lab content</PracticeLabLayout>);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Accessible Locators Lab' }),
    ).toBeVisible();
  });

  it('renders the learning objective', () => {
    render(<PracticeLabLayout {...defaultProps}>Lab content</PracticeLabLayout>);

    expect(screen.getByText(defaultProps.objective)).toBeVisible();
  });

  it('renders the lab children', () => {
    render(
      <PracticeLabLayout {...defaultProps}>
        <p>Interactive lab area</p>
      </PracticeLabLayout>,
    );

    expect(screen.getByText('Interactive lab area')).toBeVisible();
  });

  it('renders a breadcrumb link back to the challenge catalog', () => {
    render(<PracticeLabLayout {...defaultProps}>Lab content</PracticeLabLayout>);

    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(within(breadcrumb).getByRole('link', { name: 'Challenge catalog' })).toHaveAttribute(
      'href',
      '/challenges',
    );
  });

  it('renders a link back to the associated challenge detail page', () => {
    render(<PracticeLabLayout {...defaultProps}>Lab content</PracticeLabLayout>);

    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(
      within(breadcrumb).getByRole('link', { name: 'Accessible Locators Lab' }),
    ).toHaveAttribute('href', '/challenges/accessible-locators');
  });

  it('renders a reset button with a clear accessible name', () => {
    render(<PracticeLabLayout {...defaultProps}>Lab content</PracticeLabLayout>);

    expect(screen.getByRole('button', { name: /reset lab/i })).toBeVisible();
  });

  it('calls onReset when the reset button is clicked', async () => {
    const onReset = vi.fn();
    const user = userEvent.setup();
    render(
      <PracticeLabLayout {...defaultProps} onReset={onReset}>
        Lab content
      </PracticeLabLayout>,
    );

    await user.click(screen.getByRole('button', { name: /reset lab/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('includes a practice note explaining the environment is deterministic', () => {
    render(<PracticeLabLayout {...defaultProps}>Lab content</PracticeLabLayout>);

    // The layout should communicate that this is a practice surface
    expect(screen.getByText(/practice area/i)).toBeVisible();
  });

  it('marks the current page in the breadcrumb', () => {
    render(<PracticeLabLayout {...defaultProps}>Lab content</PracticeLabLayout>);

    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
    const currentItem = within(breadcrumb).getByText('Practice');
    expect(currentItem).toBeVisible();
  });
});
