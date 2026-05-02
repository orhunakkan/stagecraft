export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type SessionTime = 'morning' | 'afternoon' | 'evening';
export type Topic = 'locators' | 'assertions' | 'network' | 'auth';

export interface FormValues {
  fullName: string;
  email: string;
  session: SessionTime | '';
  experienceLevel: ExperienceLevel | '';
  topics: readonly Topic[];
  agreeToConduct: boolean;
}

export interface FieldErrors {
  fullName?: string;
  email?: string;
  session?: string;
  experienceLevel?: string;
  topics?: string;
  agreeToConduct?: string;
}

/** Initial form state — all fields empty, suitable as a reset target. */
export const INITIAL_VALUES: FormValues = {
  fullName: '',
  email: '',
  session: '',
  experienceLevel: '',
  topics: [],
  agreeToConduct: false,
};

export const SESSION_OPTIONS: Array<{ value: SessionTime; label: string }> = [
  { value: 'morning', label: 'Morning (9:00 – 12:00)' },
  { value: 'afternoon', label: 'Afternoon (13:00 – 17:00)' },
  { value: 'evening', label: 'Evening (18:00 – 20:00)' },
];

export const EXPERIENCE_LEVELS: Array<{ value: ExperienceLevel; label: string }> = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const TOPIC_OPTIONS: Array<{ value: Topic; label: string }> = [
  { value: 'locators', label: 'Locators' },
  { value: 'assertions', label: 'Assertions' },
  { value: 'network', label: 'Network' },
  { value: 'auth', label: 'Auth' },
];

/**
 * Validates all form fields and returns an object containing only the fields
 * that have errors. An empty object means the form is valid.
 */
export function validateForm(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'Please enter your full name.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.session) {
    errors.session = 'Please select a session.';
  }

  if (!values.experienceLevel) {
    errors.experienceLevel = 'Please select your experience level.';
  }

  if (values.topics.length === 0) {
    errors.topics = 'Please select at least one topic.';
  }

  if (!values.agreeToConduct) {
    errors.agreeToConduct = 'Please accept the code of conduct to continue.';
  }

  return errors;
}

/** Returns true when validateForm produces no errors. */
export function isFormValid(values: FormValues): boolean {
  return Object.keys(validateForm(values)).length === 0;
}

/** Returns true when the string looks like a valid email address. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
