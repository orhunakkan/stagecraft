import { useCallback, useState } from 'react';

export interface LabResetState {
  /** Increments each time `triggerReset` is called. Use as a React `key` on
   *  lab content to force a full remount and restore deterministic initial state. */
  resetKey: number;
  /** Call this from the lab's reset control to increment `resetKey`. */
  triggerReset: () => void;
}

/**
 * Provides a stable reset mechanism for practice lab pages.
 *
 * Usage:
 * ```tsx
 * const { resetKey, triggerReset } = useLabReset();
 * <PracticeLabLayout onReset={triggerReset} ...>
 *   <LabContent key={resetKey} />
 * </PracticeLabLayout>
 * ```
 */
export function useLabReset(): LabResetState {
  const [resetKey, setResetKey] = useState(0);

  const triggerReset = useCallback(() => {
    setResetKey((k) => k + 1);
  }, []);

  return { resetKey, triggerReset };
}
