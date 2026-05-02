'use client';

import { useSyncExternalStore, useState } from 'react';

import {
  challengeStatuses,
  statusActiveColors,
  statusColors,
  statusLabels,
  type ChallengeStatus,
} from './progress-types';
import { getChallengeProgress, resetAllProgress, setChallengeProgress } from './progress-storage';
import { notifyProgressStore, subscribeToProgressStore } from './progress-store';

interface ProgressControlsProps {
  challengeId: string;
}

export function ProgressControls({ challengeId }: ProgressControlsProps) {
  // useSyncExternalStore reads from localStorage on every render triggered by
  // notifyProgressStore (same-tab) or the 'storage' event (cross-tab).
  // The server snapshot returns the default so SSR HTML is stable.
  const status = useSyncExternalStore(
    subscribeToProgressStore,
    () => getChallengeProgress(localStorage, challengeId),
    () => 'notStarted' as ChallengeStatus,
  );

  const [confirmingReset, setConfirmingReset] = useState(false);

  function handleStatusChange(newStatus: ChallengeStatus): void {
    setChallengeProgress(localStorage, challengeId, newStatus);
    notifyProgressStore();
    setConfirmingReset(false);
  }

  function handleResetAll(): void {
    resetAllProgress(localStorage);
    notifyProgressStore();
    setConfirmingReset(false);
  }

  return (
    <section aria-labelledby="progress-heading" className="stage-card p-6">
      <h2
        id="progress-heading"
        className="text-xs font-black uppercase tracking-widest text-muted-foreground"
      >
        My progress
      </h2>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Self-marked only — not graded or verified.
      </p>

      {/* Status selector */}
      <div role="group" aria-label="Mark your progress" className="mt-4 grid grid-cols-2 gap-2">
        {challengeStatuses.map((option) => {
          const isActive = status === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleStatusChange(option)}
              className={`rounded-xl border px-3 py-2 text-xs font-bold transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                isActive ? statusActiveColors[option] : statusColors[option]
              }`}
            >
              {statusLabels[option]}
            </button>
          );
        })}
      </div>

      {/* Reset all progress */}
      <div className="mt-5 border-t border-border pt-4">
        {confirmingReset ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              This will clear progress for all challenges.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResetAll}
                className="flex-1 rounded-xl border border-danger/40 bg-danger/12 px-3 py-2 text-xs font-bold text-danger transition hover:bg-danger/20 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Confirm reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="flex-1 rounded-xl border border-border bg-muted px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-muted/80 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="w-full rounded-xl border border-border bg-background/55 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-danger/40 hover:text-danger focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Reset all progress
          </button>
        )}
      </div>
    </section>
  );
}
