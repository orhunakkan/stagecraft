import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { EmulationInputLab } from './EmulationInputLab';

describe('EmulationInputLab', () => {
  it('renders the lab heading and scenario sections', () => {
    render(<EmulationInputLab />);

    expect(screen.getByRole('heading', { level: 1, name: /emulation and input lab/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /viewport-aware dashboard/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /keyboard command center/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /pointer practice pad/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /touch-friendly controls/i })).toBeVisible();
  });

  it('submits keyboard command text with Enter', async () => {
    const user = userEvent.setup();
    render(<EmulationInputLab />);

    await user.type(screen.getByRole('textbox', { name: /command input/i }), 'deploy preview{Enter}');

    expect(screen.getByRole('status', { name: /keyboard result/i })).toHaveTextContent(
      /command submitted: deploy preview/i,
    );
  });

  it('clears keyboard command text with Escape', async () => {
    const user = userEvent.setup();
    render(<EmulationInputLab />);

    const input = screen.getByRole('textbox', { name: /command input/i });
    await user.type(input, 'draft command{Escape}');

    expect(input).toHaveValue('');
    expect(screen.getByRole('status', { name: /keyboard result/i })).toHaveTextContent(
      /command input cleared/i,
    );
  });

  it('updates pointer status on hover and click', async () => {
    const user = userEvent.setup();
    render(<EmulationInputLab />);

    await user.hover(screen.getByRole('button', { name: /hover pointer target/i }));
    expect(screen.getByRole('status', { name: /pointer status/i })).toHaveTextContent(
      /pointer is hovering/i,
    );

    await user.click(screen.getByRole('button', { name: /click pointer target/i }));
    expect(screen.getByRole('status', { name: /pointer status/i })).toHaveTextContent(
      /pointer click recorded/i,
    );
  });

  it('toggles the touch-friendly panel with large controls', async () => {
    const user = userEvent.setup();
    render(<EmulationInputLab />);

    await user.click(screen.getByRole('button', { name: /toggle mobile checklist/i }));

    expect(screen.getByRole('status', { name: /touch control status/i })).toHaveTextContent(
      /mobile checklist expanded/i,
    );
    expect(screen.getByText(/tap targets are at least comfortable to press/i)).toBeVisible();
  });

  it('reset restores interactive state', async () => {
    const user = userEvent.setup();
    render(<EmulationInputLab />);

    await user.type(screen.getByRole('textbox', { name: /command input/i }), 'deploy{Enter}');
    await user.click(screen.getByRole('button', { name: /toggle mobile checklist/i }));

    await user.click(screen.getByRole('button', { name: /reset lab/i }));

    expect(screen.getByRole('textbox', { name: /command input/i })).toHaveValue('');
    expect(screen.getByRole('status', { name: /keyboard result/i })).toHaveTextContent(
      /no command submitted yet/i,
    );
    expect(screen.getByRole('status', { name: /touch control status/i })).toHaveTextContent(
      /mobile checklist collapsed/i,
    );
  });
});
