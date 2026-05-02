import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

function ExampleButton() {
  return <button type="button">Start practice</button>;
}

describe('React Testing Library setup', () => {
  it('supports DOM assertions through jest-dom matchers', () => {
    render(<ExampleButton />);

    expect(screen.getByRole('button', { name: 'Start practice' })).toBeEnabled();
  });
});
