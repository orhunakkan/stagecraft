import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { FormsValidationLab } from './FormsValidationLab';

describe('FormsValidationLab', () => {
  it('renders the form with all required controls', () => {
    render(<FormsValidationLab />);

    expect(screen.getByRole('heading', { level: 1, name: /forms and validation lab/i })).toBeVisible();
    expect(screen.getByLabelText(/full name/i)).toBeVisible();
    expect(screen.getByLabelText(/email address/i)).toBeVisible();
    expect(screen.getByLabelText(/session/i)).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Beginner' })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Intermediate' })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Advanced' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Locators' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Assertions' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Network' })).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Auth' })).toBeVisible();
    expect(
      screen.getByRole('checkbox', { name: /i agree.*code of conduct/i }),
    ).toBeVisible();
  });

  it('submit button is disabled when the form is empty', () => {
    render(<FormsValidationLab />);

    expect(screen.getByRole('button', { name: /register for workshop/i })).toBeDisabled();
  });

  it('submit button becomes enabled when all required fields are filled', async () => {
    const user = userEvent.setup();
    render(<FormsValidationLab />);

    await user.type(screen.getByLabelText(/full name/i), 'Alice Tester');
    await user.type(screen.getByLabelText(/email address/i), 'alice@example.com');
    await user.selectOptions(screen.getByLabelText(/session/i), 'morning');
    await user.click(screen.getByRole('radio', { name: 'Beginner' }));
    await user.click(screen.getByRole('checkbox', { name: 'Locators' }));
    await user.click(screen.getByRole('checkbox', { name: /i agree.*code of conduct/i }));

    expect(screen.getByRole('button', { name: /register for workshop/i })).toBeEnabled();
  });

  it('shows inline validation errors after a field is touched and left empty', async () => {
    const user = userEvent.setup();
    render(<FormsValidationLab />);

    // Focus and blur the full name field without typing
    await user.click(screen.getByLabelText(/full name/i));
    await user.tab();

    expect(screen.getByText(/please enter your full name/i)).toBeVisible();
  });

  it('shows an email validation error for an invalid format', async () => {
    const user = userEvent.setup();
    render(<FormsValidationLab />);

    await user.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await user.tab();

    expect(screen.getByText(/valid email address/i)).toBeVisible();
  });

  it('clears a validation error once the field is corrected', async () => {
    const user = userEvent.setup();
    render(<FormsValidationLab />);

    await user.click(screen.getByLabelText(/full name/i));
    await user.tab();
    expect(screen.getByText(/please enter your full name/i)).toBeVisible();

    await user.type(screen.getByLabelText(/full name/i), 'Bob');
    expect(screen.queryByText(/please enter your full name/i)).not.toBeInTheDocument();
  });

  it('marks inputs as aria-invalid when they have visible errors', async () => {
    const user = userEvent.setup();
    render(<FormsValidationLab />);

    await user.click(screen.getByLabelText(/full name/i));
    await user.tab();

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows a confirmation after a valid form is submitted', async () => {
    const user = userEvent.setup();
    render(<FormsValidationLab />);

    await user.type(screen.getByLabelText(/full name/i), 'Carol Dev');
    await user.type(screen.getByLabelText(/email address/i), 'carol@example.com');
    await user.selectOptions(screen.getByLabelText(/session/i), 'afternoon');
    await user.click(screen.getByRole('radio', { name: 'Intermediate' }));
    await user.click(screen.getByRole('checkbox', { name: 'Network' }));
    await user.click(screen.getByRole('checkbox', { name: /i agree.*code of conduct/i }));
    await user.click(screen.getByRole('button', { name: /register for workshop/i }));

    expect(screen.getByRole('heading', { name: /registration confirmed/i })).toBeVisible();
    expect(screen.getByText(/carol dev/i)).toBeVisible();
  });

  it('resets to the initial empty state when the lab is reset', async () => {
    const user = userEvent.setup();
    render(<FormsValidationLab />);

    await user.type(screen.getByLabelText(/full name/i), 'Dave');
    await user.click(screen.getByRole('button', { name: /reset lab/i }));

    expect(screen.getByLabelText(/full name/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /register for workshop/i })).toBeDisabled();
  });
});
