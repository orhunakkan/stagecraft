/** Every possible step in an async scenario. */
export type AsyncStep = 'idle' | 'loading' | 'partial' | 'error' | 'success';

/** The three practice scenarios in the Async UI Lab. */
export type ScenarioId = 'basic-success' | 'retry-error' | 'staged-updates';

export interface ScenarioState {
  step: AsyncStep;
  retryAttempts: number;
}

/** Human-readable label for each step, used in accessible status regions. */
export const STEP_LABELS: Record<AsyncStep, string> = {
  idle: 'Idle',
  loading: 'Loading',
  partial: 'Partial data loaded',
  error: 'Error',
  success: 'Success',
};

/**
 * Deterministic step delays (ms) per scenario.
 * Only steps that auto-advance have an entry; error and success do not.
 * No random values — Playwright auto-waiting handles the transitions.
 */
export const STEP_DELAYS: Record<ScenarioId, Partial<Record<AsyncStep, number>>> = {
  'basic-success': { loading: 500 },
  'retry-error': { loading: 500 },
  'staged-updates': { loading: 350, partial: 600 },
};

/** Returns the initial state for a scenario — always idle with no retry attempts. */
export function initialScenarioState(): ScenarioState {
  return { step: 'idle', retryAttempts: 0 };
}

/**
 * True for steps that do not automatically advance.
 * Success is permanently terminal; error requires a manual retry.
 */
export function isTerminalStep(step: AsyncStep): boolean {
  return step === 'success' || step === 'error';
}

/** True when the current state exposes a manual retry action. */
export function canRetry(state: ScenarioState): boolean {
  return state.step === 'error';
}

/**
 * Returns the next step to automatically transition to once `currentStep` has
 * been displayed for its full delay, or null if no automatic advance applies.
 *
 * For retry-error, the first loading attempt always ends in error;
 * subsequent attempts (retryAttempts > 0) end in success.
 */
export function nextStepForScenario(
  scenarioId: ScenarioId,
  currentStep: AsyncStep,
  retryAttempts: number,
): AsyncStep | null {
  switch (scenarioId) {
    case 'basic-success':
      return currentStep === 'loading' ? 'success' : null;

    case 'retry-error':
      if (currentStep === 'loading') {
        return retryAttempts === 0 ? 'error' : 'success';
      }
      return null;

    case 'staged-updates':
      if (currentStep === 'loading') return 'partial';
      if (currentStep === 'partial') return 'success';
      return null;
  }
}
