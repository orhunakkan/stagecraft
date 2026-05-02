import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AccessibleLocatorsLab } from './AccessibleLocatorsLab';

describe('AccessibleLocatorsLab', () => {
  it('renders the lab heading through the shared layout', () => {
    render(<AccessibleLocatorsLab />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Accessible Locators Lab' }),
    ).toBeVisible();
  });

  it('renders the practice page heading inside the lab content', () => {
    render(<AccessibleLocatorsLab />);
    // The inner practice page has its own h1-equivalent inside a landmark
    expect(
      screen.getByRole('heading', { name: /build resilient test automation/i }),
    ).toBeVisible();
  });

  it('renders the notification alert with a dismiss button', () => {
    render(<AccessibleLocatorsLab />);

    const alert = screen.getByRole('alert', { name: /practice tip/i });
    expect(alert).toBeVisible();
    expect(within(alert).getByRole('button', { name: /dismiss notification/i })).toBeVisible();
  });

  it('hides the notification alert after the dismiss button is clicked', async () => {
    const user = userEvent.setup();
    render(<AccessibleLocatorsLab />);

    await user.click(screen.getByRole('button', { name: /dismiss notification/i }));

    expect(screen.queryByRole('alert', { name: /practice tip/i })).not.toBeInTheDocument();
  });

  it('renders the site navigation with multiple links', () => {
    render(<AccessibleLocatorsLab />);

    const nav = screen.getByRole('navigation', { name: /site navigation/i });
    expect(within(nav).getByRole('link', { name: 'Features' })).toBeVisible();
    expect(within(nav).getByRole('link', { name: 'About' })).toBeVisible();
    expect(within(nav).getByRole('link', { name: 'Contact' })).toBeVisible();
  });

  it('renders an image with descriptive alt text', () => {
    render(<AccessibleLocatorsLab />);

    // Verifiable by getByAltText
    expect(screen.getByAltText(/diagram showing/i)).toBeVisible();
  });

  it('renders the Start demo button', () => {
    render(<AccessibleLocatorsLab />);
    expect(screen.getByRole('button', { name: 'Start demo' })).toBeVisible();
  });

  it('shows a status message in the status region when Start demo is clicked', async () => {
    const user = userEvent.setup();
    render(<AccessibleLocatorsLab />);

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', { name: 'Start demo' }));

    expect(statusRegion).not.toBeEmptyDOMElement();
    expect(statusRegion).toHaveTextContent(/demo activated/i);
  });

  it('renders secondary navigation links', () => {
    render(<AccessibleLocatorsLab />);
    // getByRole('link') practice
    expect(screen.getByRole('link', { name: /view features/i })).toBeVisible();
  });

  it('renders a features section with h2 heading and feature cards', () => {
    render(<AccessibleLocatorsLab />);

    expect(screen.getByRole('heading', { name: /why accessible locators/i })).toBeVisible();
    // Three feature headings (h3)
    const featureHeadings = screen.getAllByRole('heading', { level: 3 });
    expect(featureHeadings.length).toBeGreaterThanOrEqual(3);
  });

  it('renders the footer with a settings button that has a title attribute', () => {
    render(<AccessibleLocatorsLab />);

    const footer = screen.getByRole('contentinfo');
    const settingsButton = within(footer).getByRole('button', { name: /open settings/i });
    expect(settingsButton).toBeVisible();
    // Verifiable by getByTitle
    expect(settingsButton).toHaveAttribute('title');
  });

  it('restores the initial state when the reset key changes', async () => {
    const user = userEvent.setup();
    render(<AccessibleLocatorsLab />);

    // Activate the demo
    await user.click(screen.getByRole('button', { name: 'Start demo' }));
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement();

    // Dismiss the notification
    await user.click(screen.getByRole('button', { name: /dismiss notification/i }));
    expect(screen.queryByRole('alert', { name: /practice tip/i })).not.toBeInTheDocument();

    // Clicking Reset lab (from PracticeLabLayout) should remount and restore initial state
    await user.click(screen.getByRole('button', { name: /reset lab/i }));

    // After reset, status should be clear and notification should be visible again
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByRole('alert', { name: /practice tip/i })).toBeVisible();
  });
});
