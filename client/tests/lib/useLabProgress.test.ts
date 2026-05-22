import { beforeEach, test, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLabProgress } from '../../src/lib/useLabProgress';

beforeEach(() => {
  localStorage.clear();
});

test('starts with no completed labs', () => {
  const { result } = renderHook(() => useLabProgress());
  expect(result.current.completed.size).toBe(0);
});

test('toggle marks a slug as completed', () => {
  const { result } = renderHook(() => useLabProgress());
  act(() => result.current.toggle('async-ui'));
  expect(result.current.isCompleted('async-ui')).toBe(true);
});

test('toggle twice un-marks the slug', () => {
  const { result } = renderHook(() => useLabProgress());
  act(() => result.current.toggle('async-ui'));
  act(() => result.current.toggle('async-ui'));
  expect(result.current.isCompleted('async-ui')).toBe(false);
});

test('persists completed slugs to localStorage', () => {
  const { result } = renderHook(() => useLabProgress());
  act(() => result.current.toggle('fake-auth'));
  const stored = JSON.parse(localStorage.getItem('stagecraft:completed')!);
  expect(stored).toContain('fake-auth');
});

test('loads existing data from localStorage on mount', () => {
  localStorage.setItem('stagecraft:completed', JSON.stringify(['forms-validation']));
  const { result } = renderHook(() => useLabProgress());
  expect(result.current.isCompleted('forms-validation')).toBe(true);
});

test('falls back to an empty set when localStorage contains corrupted JSON', () => {
  localStorage.setItem('stagecraft:completed', '{not-valid-json');

  const { result } = renderHook(() => useLabProgress());

  expect(result.current.completed.size).toBe(0);
});

test('other slugs are not affected by a toggle', () => {
  const { result } = renderHook(() => useLabProgress());
  act(() => result.current.toggle('network-api'));
  expect(result.current.isCompleted('async-ui')).toBe(false);
  expect(result.current.isCompleted('network-api')).toBe(true);
});

test('syncs state when another tab writes to localStorage (storage event)', () => {
  const { result } = renderHook(() => useLabProgress());
  expect(result.current.isCompleted('clock-timers')).toBe(false);

  // Simulate another tab writing to localStorage and firing a storage event
  act(() => {
    localStorage.setItem('stagecraft:completed', JSON.stringify(['clock-timers']));
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'stagecraft:completed',
        newValue: JSON.stringify(['clock-timers']),
        storageArea: localStorage,
      }),
    );
  });

  expect(result.current.isCompleted('clock-timers')).toBe(true);
});

test('ignores storage events for unrelated keys', () => {
  localStorage.setItem('stagecraft:completed', JSON.stringify(['forms-validation']));
  const { result } = renderHook(() => useLabProgress());

  act(() => {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'other-key',
        newValue: JSON.stringify(['clock-timers']),
        storageArea: localStorage,
      }),
    );
  });

  expect(result.current.isCompleted('forms-validation')).toBe(true);
  expect(result.current.isCompleted('clock-timers')).toBe(false);
});
