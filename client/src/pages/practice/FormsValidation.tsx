import { useState } from 'react';
import { LabHeader } from '../../components/LabHeader';
import { labs } from '../../labs';

const lab = labs.find((l) => l.slug === 'forms-validation')!;

interface FormState {
  name: string;
  email: string;
  category: string;
  frequency: string;
  file: File | null;
  agreed: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  category?: string;
  frequency?: string;
  agreed?: string;
}

function validate(f: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!f.name.trim() || f.name.trim().length < 2)
    errors.name = 'Full name must be at least 2 characters.';
  if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
    errors.email = 'Enter a valid email address.';
  if (!f.category) errors.category = 'Please select a category.';
  if (!f.frequency) errors.frequency = 'Please choose a frequency.';
  if (!f.agreed) errors.agreed = 'You must agree to the terms.';
  return errors;
}

const INITIAL: FormState = {
  name: '',
  email: '',
  category: '',
  frequency: '',
  file: null,
  agreed: false,
};

export function FormsValidation() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [touched, setTouched] = useState<Set<keyof FormState>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;

  const touch = (field: keyof FormState) => setTouched((prev) => new Set([...prev, field]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(new Set(['name', 'email', 'category', 'frequency', 'agreed']));
    if (isValid) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div>
        <LabHeader lab={lab} />
        <div
          role="alert"
          className="max-w-md rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center"
        >
          <p className="text-3xl">✓</p>
          <h2 className="mt-2 text-lg font-semibold text-emerald-800">Subscribed!</h2>
          <p className="mt-1 text-sm text-emerald-600">Welcome, {form.name}.</p>
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL);
              setTouched(new Set());
              setSubmitted(false);
            }}
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Reset form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <LabHeader lab={lab} />

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label="Newsletter signup form"
        className="max-w-md space-y-5"
      >
        {/* Full name */}
        <div className="flex flex-col gap-1">
          <label htmlFor="full-name" className="text-sm font-medium text-zinc-700">
            Full name{' '}
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
          </label>
          <input
            id="full-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onBlur={() => touch('name')}
            aria-required="true"
            aria-invalid={touched.has('name') && !!errors.name}
            aria-describedby={touched.has('name') && errors.name ? 'name-error' : undefined}
            className={[
              'rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1',
              touched.has('name') && errors.name
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500',
            ].join(' ')}
          />
          {touched.has('name') && errors.name && (
            <p id="name-error" role="alert" className="text-xs text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label htmlFor="email-address" className="text-sm font-medium text-zinc-700">
            Email address{' '}
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
          </label>
          <input
            id="email-address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onBlur={() => touch('email')}
            aria-required="true"
            aria-invalid={touched.has('email') && !!errors.email}
            aria-describedby={touched.has('email') && errors.email ? 'email-error' : undefined}
            className={[
              'rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1',
              touched.has('email') && errors.email
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500',
            ].join(' ')}
          />
          {touched.has('email') && errors.email && (
            <p id="email-error" role="alert" className="text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label htmlFor="topic-category" className="text-sm font-medium text-zinc-700">
            Topic category{' '}
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
          </label>
          <select
            id="topic-category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            onBlur={() => touch('category')}
            aria-required="true"
            aria-invalid={touched.has('category') && !!errors.category}
            className={[
              'rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1',
              touched.has('category') && errors.category
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500',
            ].join(' ')}
          >
            <option value="">Select a category…</option>
            <option value="technology">Technology</option>
            <option value="design">Design</option>
            <option value="business">Business</option>
            <option value="science">Science</option>
          </select>
          {touched.has('category') && errors.category && (
            <p id="category-error" role="alert" className="text-xs text-red-600">
              {errors.category}
            </p>
          )}
        </div>

        {/* Frequency */}
        <fieldset>
          <legend className="text-sm font-medium text-zinc-700">
            Email frequency{' '}
            <span aria-hidden="true" className="text-red-500">
              *
            </span>
          </legend>
          <div className="mt-2 flex flex-col gap-2">
            {(['Daily', 'Weekly', 'Monthly'] as const).map((freq) => (
              <label key={freq} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="frequency"
                  value={freq.toLowerCase()}
                  checked={form.frequency === freq.toLowerCase()}
                  onChange={(e) => {
                    setForm({ ...form, frequency: e.target.value });
                    touch('frequency');
                  }}
                  className="accent-indigo-600"
                />
                <span className="text-sm text-zinc-700">{freq}</span>
              </label>
            ))}
          </div>
          {touched.has('frequency') && errors.frequency && (
            <p id="frequency-error" role="alert" className="mt-1 text-xs text-red-600">
              {errors.frequency}
            </p>
          )}
        </fieldset>

        {/* File upload */}
        <div className="flex flex-col gap-1">
          <label htmlFor="profile-picture" className="text-sm font-medium text-zinc-700">
            Profile picture <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <input
            id="profile-picture"
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })}
            className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {form.file && <p className="text-xs text-zinc-400">Selected: {form.file.name}</p>}
        </div>

        {/* Terms */}
        <div className="flex flex-col gap-1">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={(e) => {
                setForm({ ...form, agreed: e.target.checked });
                touch('agreed');
              }}
              aria-required="true"
              aria-invalid={touched.has('agreed') && !!errors.agreed}
              className="mt-0.5 accent-indigo-600"
            />
            <span className="text-sm text-zinc-700">
              I agree to the{' '}
              <a href="#terms" className="text-indigo-600 underline">
                terms and conditions
              </a>
            </span>
          </label>
          {touched.has('agreed') && errors.agreed && (
            <p id="agreed-error" role="alert" className="text-xs text-red-600">
              {errors.agreed}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Subscribe
        </button>

        <p className="text-xs text-zinc-400">
          <span aria-hidden="true" className="text-red-500">
            *
          </span>{' '}
          Required fields
        </p>
      </form>
    </div>
  );
}
