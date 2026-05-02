'use client';

import { useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';
import {
  EXPERIENCE_LEVELS,
  INITIAL_VALUES,
  SESSION_OPTIONS,
  TOPIC_OPTIONS,
  isFormValid,
  validateForm,
  type ExperienceLevel,
  type FieldErrors,
  type FormValues,
  type Topic,
} from './form-rules';

const CHALLENGE_ID = 'forms-validation';
const OBJECTIVE =
  'Use labels and observable form states to drive inputs, choose options, verify validation, and confirm successful submission behavior.';

export function FormsValidationLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Forms and Validation Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <FormsValidationContent key={resetKey} />
    </PracticeLabLayout>
  );
}

function FormsValidationContent() {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validateForm(values);
  const valid = isFormValid(values);

  function touchField(name: keyof FormValues): void {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function getFieldError(name: keyof FieldErrors): string | undefined {
    return touched[name] ? errors[name] : undefined;
  }

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    if (valid) setSubmitted(true);
  }

  // --- Handlers ---

  function handleTextChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    name: keyof FormValues,
  ): void {
    setValues((prev) => ({ ...prev, [name]: event.target.value }));
  }

  function handleTopicChange(topic: Topic, checked: boolean): void {
    touchField('topics');
    setValues((prev) => ({
      ...prev,
      topics: checked
        ? [...prev.topics, topic]
        : prev.topics.filter((t) => t !== topic),
    }));
  }

  if (submitted) {
    return <ConfirmationView name={values.fullName} />;
  }

  return (
    <div className="stage-card p-6 sm:p-8">
      <div className="mb-8">
        <p className="stage-badge mb-4">Workshop registration</p>
        <h2 className="text-2xl font-black tracking-tight text-card-foreground">
          Register for the Playwright Workshop
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Fields marked <span aria-hidden="true">*</span>
          <span className="sr-only">with an asterisk</span> are required.
        </p>
      </div>

      <form
        aria-label="Workshop registration"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-8"
      >
        {/* ── Contact information ─────────────────────────────────────── */}
        <fieldset className="space-y-5">
          <legend className="text-sm font-black uppercase tracking-widest text-secondary">
            Contact information
          </legend>

          {/* Full name */}
          <FormField
            id="full-name"
            label="Full name"
            required
            error={getFieldError('fullName')}
          >
            <input
              id="full-name"
              type="text"
              value={values.fullName}
              onChange={(e) => handleTextChange(e, 'fullName')}
              onBlur={() => touchField('fullName')}
              aria-required="true"
              aria-invalid={touched.fullName && !!errors.fullName ? true : undefined}
              aria-describedby={getFieldError('fullName') ? 'full-name-error' : undefined}
              placeholder="Your full name"
              className={fieldInputClass(touched.fullName && !!errors.fullName)}
            />
          </FormField>

          {/* Email address */}
          <FormField
            id="email-address"
            label="Email address"
            required
            error={getFieldError('email')}
          >
            <input
              id="email-address"
              type="email"
              value={values.email}
              onChange={(e) => handleTextChange(e, 'email')}
              onBlur={() => touchField('email')}
              aria-required="true"
              aria-invalid={touched.email && !!errors.email ? true : undefined}
              aria-describedby={getFieldError('email') ? 'email-address-error' : undefined}
              placeholder="you@example.com"
              className={fieldInputClass(touched.email && !!errors.email)}
            />
          </FormField>
        </fieldset>

        {/* ── Session preferences ─────────────────────────────────────── */}
        <fieldset className="space-y-5">
          <legend className="text-sm font-black uppercase tracking-widest text-secondary">
            Session preferences
          </legend>

          {/* Session select */}
          <FormField
            id="session"
            label="Session"
            required
            error={getFieldError('session')}
          >
            <select
              id="session"
              value={values.session}
              onChange={(e) => {
                handleTextChange(e, 'session');
                touchField('session');
              }}
              onBlur={() => touchField('session')}
              aria-required="true"
              aria-invalid={touched.session && !!errors.session ? true : undefined}
              aria-describedby={getFieldError('session') ? 'session-error' : undefined}
              className={fieldInputClass(touched.session && !!errors.session)}
            >
              <option value="">Choose a session</option>
              {SESSION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>

          {/* Experience level radio group */}
          <fieldset>
            <legend className="mb-3 text-sm font-bold text-card-foreground">
              Experience level <span aria-hidden="true">*</span>
            </legend>
            <div className="flex flex-wrap gap-4">
              {EXPERIENCE_LEVELS.map((level) => (
                <label key={level.value} className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={level.value}
                    checked={values.experienceLevel === level.value}
                    onChange={(e) => {
                      setValues((prev) => ({
                        ...prev,
                        experienceLevel: e.target.value as ExperienceLevel,
                      }));
                      touchField('experienceLevel');
                    }}
                    className="accent-primary"
                  />
                  <span className="text-sm font-semibold text-card-foreground">{level.label}</span>
                </label>
              ))}
            </div>
            {getFieldError('experienceLevel') && (
              <p
                id="experience-level-error"
                role="alert"
                className="mt-2 text-xs font-semibold text-danger"
              >
                {getFieldError('experienceLevel')}
              </p>
            )}
          </fieldset>
        </fieldset>

        {/* ── Topics of interest ──────────────────────────────────────── */}
        <fieldset>
          <legend className="mb-3 text-sm font-black uppercase tracking-widest text-secondary">
            Topics of interest <span aria-hidden="true">*</span>
          </legend>
          <div className="flex flex-wrap gap-4">
            {TOPIC_OPTIONS.map((topic) => (
              <label key={topic.value} className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  value={topic.value}
                  checked={values.topics.includes(topic.value)}
                  onChange={(e) => handleTopicChange(topic.value, e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-sm font-semibold text-card-foreground">{topic.label}</span>
              </label>
            ))}
          </div>
          {getFieldError('topics') && (
            <p role="alert" className="mt-2 text-xs font-semibold text-danger">
              {getFieldError('topics')}
            </p>
          )}
        </fieldset>

        {/* ── Code of conduct ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <label className="inline-flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={values.agreeToConduct}
              onChange={(e) => {
                setValues((prev) => ({ ...prev, agreeToConduct: e.target.checked }));
                touchField('agreeToConduct');
              }}
              className="mt-0.5 accent-primary"
            />
            <span className="text-sm leading-6 text-card-foreground">
              I agree to the workshop code of conduct and understand that this is a practice
              environment only.
            </span>
          </label>
          {getFieldError('agreeToConduct') && (
            <p role="alert" className="mt-2 text-xs font-semibold text-danger">
              {getFieldError('agreeToConduct')}
            </p>
          )}
        </div>

        {/* ── Submit ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            {valid ? (
              <span className="font-semibold text-success">✓ Form is ready to submit</span>
            ) : (
              'Complete all required fields to register.'
            )}
          </p>
          <button
            type="submit"
            disabled={!valid}
            className="rounded-full bg-primary px-6 py-3 text-sm font-black text-primary-foreground transition enabled:hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Register for workshop
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({ id, label, required, error, children }: FormFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-bold text-card-foreground">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-danger">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function fieldInputClass(hasError: boolean | undefined): string {
  return [
    'w-full rounded-2xl border bg-background px-4 py-3 text-sm text-foreground outline-none transition',
    'placeholder:text-muted-foreground',
    'focus:ring-3 focus:ring-ring/20',
    hasError
      ? 'border-danger focus:border-danger'
      : 'border-border focus:border-ring',
  ].join(' ');
}

function ConfirmationView({ name }: { name: string }) {
  return (
    <div className="stage-card px-6 py-16 text-center">
      <span aria-hidden="true" className="text-4xl">
        🎉
      </span>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-card-foreground">
        Registration confirmed!
      </h2>
      <p className="mt-3 text-base text-muted-foreground">
        Welcome, <span className="font-bold text-card-foreground">{name}</span>! Your workshop spot
        is reserved. This confirmation is your automation&apos;s proof of successful submission.
      </p>
    </div>
  );
}
