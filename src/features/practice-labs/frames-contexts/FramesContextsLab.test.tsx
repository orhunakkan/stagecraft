import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { FramesContextsLab } from './FramesContextsLab';

afterEach(() => {
  localStorage.clear();
});

describe('FramesContextsLab', () => {
  it('renders the lab heading and scenario sections', () => {
    render(<FramesContextsLab />);

    expect(screen.getByRole('heading', { level: 1, name: /frames and contexts lab/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /embedded task frame/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /context state sandbox/i })).toBeVisible();
  });

  it('exposes a titled iframe for frame locator practice', () => {
    render(<FramesContextsLab />);

    const frame = screen.getByTitle(/task board frame/i);
    expect(frame).toBeVisible();
    expect(frame).toHaveAttribute('sandbox', expect.stringContaining('allow-scripts'));
  });

  it('shows an empty context label state initially', () => {
    render(<FramesContextsLab />);

    expect(screen.getByRole('status', { name: /context label status/i })).toHaveTextContent(
      /no label saved/i,
    );
  });

  it('saves and clears a context label through user-facing controls', async () => {
    const user = userEvent.setup();
    render(<FramesContextsLab />);

    await user.type(screen.getByRole('textbox', { name: /context label/i }), 'Context A');
    await user.click(screen.getByRole('button', { name: /save context label/i }));

    expect(screen.getByRole('status', { name: /context label status/i })).toHaveTextContent(
      /saved label: context a/i,
    );
    expect(localStorage.getItem('stagecraft_frames_context_label')).toBe('Context A');

    await user.click(screen.getByRole('button', { name: /clear context label/i }));

    expect(screen.getByRole('status', { name: /context label status/i })).toHaveTextContent(
      /no label saved/i,
    );
    expect(localStorage.getItem('stagecraft_frames_context_label')).toBeNull();
  });

  it('loads an existing context label from localStorage', async () => {
    localStorage.setItem('stagecraft_frames_context_label', 'Persisted Context');

    render(<FramesContextsLab />);

    expect(await screen.findByText(/saved label: persisted context/i)).toBeVisible();
  });

  it('reset clears local context state', async () => {
    const user = userEvent.setup();
    localStorage.setItem('stagecraft_frames_context_label', 'Needs Reset');

    render(<FramesContextsLab />);
    expect(await screen.findByText(/saved label: needs reset/i)).toBeVisible();

    await user.click(screen.getByRole('button', { name: /reset lab/i }));

    expect(screen.getByRole('status', { name: /context label status/i })).toHaveTextContent(
      /no label saved/i,
    );
    expect(localStorage.getItem('stagecraft_frames_context_label')).toBeNull();
  });
});
