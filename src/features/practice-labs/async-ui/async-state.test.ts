import { describe, expect, it } from 'vitest';

import {
  canRetry,
  initialScenarioState,
  isTerminalStep,
  nextStepForScenario,
  STEP_DELAYS,
  STEP_LABELS,
  type AsyncStep,
  type ScenarioId,
} from './async-state';

const ALL_STEPS: AsyncStep[] = ['idle', 'loading', 'partial', 'error', 'success'];
const ALL_SCENARIOS: ScenarioId[] = ['basic-success', 'retry-error', 'staged-updates'];

describe('initialScenarioState', () => {
  it('returns idle step with zero retry attempts', () => {
    expect(initialScenarioState()).toEqual({ step: 'idle', retryAttempts: 0 });
  });
});

describe('STEP_LABELS', () => {
  it('has a non-empty label for every step', () => {
    for (const step of ALL_STEPS) {
      expect(STEP_LABELS[step]).toBeTruthy();
    }
  });
});

describe('STEP_DELAYS', () => {
  it('has a positive loading delay for every scenario', () => {
    for (const scenario of ALL_SCENARIOS) {
      expect(STEP_DELAYS[scenario].loading).toBeGreaterThan(0);
    }
  });

  it('staged-updates has a positive partial delay', () => {
    expect(STEP_DELAYS['staged-updates'].partial).toBeGreaterThan(0);
  });
});

describe('isTerminalStep', () => {
  it('identifies success and error as terminal', () => {
    expect(isTerminalStep('success')).toBe(true);
    expect(isTerminalStep('error')).toBe(true);
  });

  it('identifies idle, loading, and partial as non-terminal', () => {
    expect(isTerminalStep('idle')).toBe(false);
    expect(isTerminalStep('loading')).toBe(false);
    expect(isTerminalStep('partial')).toBe(false);
  });
});

describe('canRetry', () => {
  it('returns true only when step is error', () => {
    expect(canRetry({ step: 'error', retryAttempts: 0 })).toBe(true);
    expect(canRetry({ step: 'error', retryAttempts: 2 })).toBe(true);
  });

  it('returns false for all non-error steps', () => {
    for (const step of ALL_STEPS.filter((s) => s !== 'error')) {
      expect(canRetry({ step, retryAttempts: 0 })).toBe(false);
    }
  });
});

describe('nextStepForScenario', () => {
  describe('basic-success', () => {
    it('advances loading → success', () => {
      expect(nextStepForScenario('basic-success', 'loading', 0)).toBe('success');
    });

    it('returns null for idle and success', () => {
      expect(nextStepForScenario('basic-success', 'idle', 0)).toBeNull();
      expect(nextStepForScenario('basic-success', 'success', 0)).toBeNull();
    });
  });

  describe('retry-error', () => {
    it('advances loading → error on the first attempt (retryAttempts === 0)', () => {
      expect(nextStepForScenario('retry-error', 'loading', 0)).toBe('error');
    });

    it('advances loading → success when retryAttempts > 0', () => {
      expect(nextStepForScenario('retry-error', 'loading', 1)).toBe('success');
      expect(nextStepForScenario('retry-error', 'loading', 3)).toBe('success');
    });

    it('returns null for error (manual retry required) and success', () => {
      expect(nextStepForScenario('retry-error', 'error', 0)).toBeNull();
      expect(nextStepForScenario('retry-error', 'success', 1)).toBeNull();
    });
  });

  describe('staged-updates', () => {
    it('advances loading → partial', () => {
      expect(nextStepForScenario('staged-updates', 'loading', 0)).toBe('partial');
    });

    it('advances partial → success', () => {
      expect(nextStepForScenario('staged-updates', 'partial', 0)).toBe('success');
    });

    it('returns null for success', () => {
      expect(nextStepForScenario('staged-updates', 'success', 0)).toBeNull();
    });
  });
});
