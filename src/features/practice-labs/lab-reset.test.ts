import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useLabReset } from './lab-reset';

describe('useLabReset', () => {
  it('returns a resetKey of 0 on first render', () => {
    const { result } = renderHook(() => useLabReset());
    expect(result.current.resetKey).toBe(0);
  });

  it('increments resetKey by 1 each time triggerReset is called', () => {
    const { result } = renderHook(() => useLabReset());

    act(() => {
      result.current.triggerReset();
    });
    expect(result.current.resetKey).toBe(1);

    act(() => {
      result.current.triggerReset();
    });
    expect(result.current.resetKey).toBe(2);
  });

  it('provides a stable triggerReset reference across renders', () => {
    const { result, rerender } = renderHook(() => useLabReset());

    const firstTrigger = result.current.triggerReset;
    rerender();
    expect(result.current.triggerReset).toBe(firstTrigger);
  });

  it('each hook instance has independent state', () => {
    const hookA = renderHook(() => useLabReset());
    const hookB = renderHook(() => useLabReset());

    act(() => {
      hookA.result.current.triggerReset();
      hookA.result.current.triggerReset();
    });

    expect(hookA.result.current.resetKey).toBe(2);
    expect(hookB.result.current.resetKey).toBe(0);
  });
});
