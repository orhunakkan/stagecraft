'use client';

import { useEffect, useState } from 'react';

import { useLabReset } from '../lab-reset';
import { PracticeLabLayout } from '../PracticeLabLayout';

const CHALLENGE_ID = 'visual-comparison';
const OBJECTIVE =
  'Use screenshot testing to catch visual regressions and prevent unintended UI changes.';

export function VisualComparisonLab() {
  const { resetKey, triggerReset } = useLabReset();

  return (
    <PracticeLabLayout
      labTitle="Visual Comparison Lab"
      challengeId={CHALLENGE_ID}
      objective={OBJECTIVE}
      onReset={triggerReset}
    >
      <div key={resetKey} className="space-y-8">
        <ProductShowcaseCard />
        <FooterWithTimestamp />
      </div>
    </PracticeLabLayout>
  );
}

function ProductShowcaseCard() {
  return (
    <section aria-labelledby="showcase-heading">
      <h2 id="showcase-heading" className="sr-only">
        Product Showcase
      </h2>
      <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card shadow-md">
        <div className="p-6">
          <div className="relative overflow-hidden rounded-xl">
            {/* Using a static, deterministic image from a service like Pexels or Unsplash */}
            {/* We could also host this locally if external calls are not desired */}
            <img
              src="https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="A person using a modern smartphone with a vibrant app interface on screen."
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="inline-block rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                New
              </span>
              <span className="inline-block rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                On Sale
              </span>
            </div>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-card-foreground">
              Next-Gen Task Manager
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              An award-winning interface designed for focus and productivity. Built with the latest
              web technologies for a seamless cross-device experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterWithTimestamp() {
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    // This timestamp will change on every render, making it a perfect
    // candidate for masking in a screenshot test.
    setTimestamp(new Date().toISOString());
  }, []);

  return (
    <footer className="text-center">
      <p className="text-xs text-muted-foreground">
        Page generated at: <time dateTime={timestamp}>{timestamp}</time>
      </p>
    </footer>
  );
}
