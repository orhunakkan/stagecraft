import { describe, expect, it } from 'vitest';

import {
  INITIAL_VALUES,
  isFormValid,
  isValidEmail,
  type FormValues,
  validateForm,
} from './form-rules';

const VALID_VALUES: FormValues = {
  fullName: 'Jane Smith',
  email: 'jane@example.com',
  session: 'morning',
  experienceLevel: 'intermediate',
  topics: ['locators'],
  agreeToConduct: true,
};

describe('validateForm', () => {
  it('returns no errors for a fully valid submission', () => {
    expect(validateForm(VALID_VALUES)).toEqual({});
    expect(isFormValid(VALID_VALUES)).toBe(true);
  });

  it('requires a non-empty full name', () => {
    expect(validateForm({ ...VALID_VALUES, fullName: '' }).fullName).toBeDefined();
    expect(validateForm({ ...VALID_VALUES, fullName: '   ' }).fullName).toBeDefined();
    expect(validateForm({ ...VALID_VALUES, fullName: 'Alice' }).fullName).toBeUndefined();
  });

  it('requires a valid email address', () => {
    expect(validateForm({ ...VALID_VALUES, email: '' }).email).toBeDefined();
    expect(validateForm({ ...VALID_VALUES, email: 'not-an-email' }).email).toBeDefined();
    expect(validateForm({ ...VALID_VALUES, email: 'a@b' }).email).toBeDefined();
    expect(validateForm({ ...VALID_VALUES, email: 'alice@example.com' }).email).toBeUndefined();
  });

  it('requires a session to be selected', () => {
    expect(validateForm({ ...VALID_VALUES, session: '' }).session).toBeDefined();
    expect(validateForm({ ...VALID_VALUES, session: 'afternoon' }).session).toBeUndefined();
  });

  it('requires an experience level to be selected', () => {
    expect(
      validateForm({ ...VALID_VALUES, experienceLevel: '' }).experienceLevel,
    ).toBeDefined();
    expect(
      validateForm({ ...VALID_VALUES, experienceLevel: 'advanced' }).experienceLevel,
    ).toBeUndefined();
  });

  it('requires at least one topic', () => {
    expect(validateForm({ ...VALID_VALUES, topics: [] }).topics).toBeDefined();
    expect(
      validateForm({ ...VALID_VALUES, topics: ['assertions', 'network'] }).topics,
    ).toBeUndefined();
  });

  it('requires agreement to the code of conduct', () => {
    expect(
      validateForm({ ...VALID_VALUES, agreeToConduct: false }).agreeToConduct,
    ).toBeDefined();
    expect(
      validateForm({ ...VALID_VALUES, agreeToConduct: true }).agreeToConduct,
    ).toBeUndefined();
  });

  it('reports all missing fields at once when INITIAL_VALUES are submitted', () => {
    const errors = validateForm(INITIAL_VALUES);
    expect(errors.fullName).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.session).toBeDefined();
    expect(errors.experienceLevel).toBeDefined();
    expect(errors.topics).toBeDefined();
    expect(errors.agreeToConduct).toBeDefined();
    expect(isFormValid(INITIAL_VALUES)).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts common valid email formats', () => {
    expect(isValidEmail('alice@example.com')).toBe(true);
    expect(isValidEmail('user+tag@mail.org')).toBe(true);
    expect(isValidEmail('first.last@sub.domain.io')).toBe(true);
  });

  it('rejects clearly invalid email formats', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
  });
});
