import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from './page';

describe('HomePage', () => {
  it('introduces Stagecraft as a Playwright practice app', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: 'Stagecraft' })).toBeVisible();
    expect(screen.getByText(/practice modern playwright test automation skills/i)).toBeVisible();
  });
});
