'use client';

import { useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';

const CHALLENGE_ID = 'data-driven-testing';
const OBJECTIVE =
  'Use test parameterization to run the same test logic against multiple data sets.';

type BadgeStyle = 'info' | 'success' | 'warning' | 'danger';

interface BadgeData {
  label: string;
  style: BadgeStyle;
}

export function DataDrivenLab() {
  const { resetKey, triggerReset } = useLabReset();
  const [badge, setBadge] = useState<BadgeData | null>(null);

  function handleGenerate(data: BadgeData) {
    setBadge(data);
  }

  return (
    <PracticeLabLayout
      labTitle="Test Parameterization Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={() => {
        triggerReset();
        setBadge(null);
      }}
    >
      <div className="space-y-6">
        <GeneratorForm onGenerate={handleGenerate} />
        <PreviewArea badge={badge} />
      </div>
    </PracticeLabLayout>
  );
}

function GeneratorForm({ onGenerate }: { onGenerate: (data: BadgeData) => void }) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: BadgeData = {
      label: formData.get('label') as string,
      style: formData.get('style') as BadgeStyle,
    };
    onGenerate(data);
  };

  return (
    <section aria-labelledby="generator-heading" className="stage-card p-6">
      <h2 id="generator-heading" className="text-xl font-black tracking-tight text-card-foreground">
        Badge Generator
      </h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Enter a label and select a style to generate a preview badge. Your test should verify all
        style variations using a single, data-driven test case.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-muted-foreground">
            Badge Label
          </label>
          <input
            type="text"
            id="label"
            name="label"
            defaultValue="Completed"
            required
            className="mt-1 block w-full rounded-md border-border bg-background px-3 py-2 text-sm text-card-foreground shadow-sm focus:border-ring focus:ring focus:ring-ring/50"
          />
        </div>
        <div>
          <label htmlFor="style" className="block text-sm font-medium text-muted-foreground">
            Badge Style
          </label>
          <select
            id="style"
            name="style"
            defaultValue="success"
            className="mt-1 block w-full rounded-md border-border bg-background px-3 py-2 text-sm text-card-foreground shadow-sm focus:border-ring focus:ring focus:ring-ring/50"
          >
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Generate
        </button>
      </form>
    </section>
  );
}

function PreviewArea({ badge }: { badge: BadgeData | null }) {
  const styleMap: Record<BadgeStyle, string> = {
    info: 'bg-info/10 text-info',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
  };

  return (
    <section aria-labelledby="preview-heading">
      <h2 id="preview-heading" className="text-lg font-semibold text-card-foreground">
        Preview
      </h2>
      <div className="mt-2 h-24 rounded-lg border border-dashed border-border bg-muted/30 p-4 flex items-center justify-center">
        {badge ? (
          <span
            data-style={badge.style}
            className={`inline-block rounded-full px-4 py-1.5 text-base font-bold ${styleMap[badge.style]}`}
          >
            {badge.label}
          </span>
        ) : (
          <p className="text-sm text-muted-foreground">No badge generated yet.</p>
        )}
      </div>
    </section>
  );
}
