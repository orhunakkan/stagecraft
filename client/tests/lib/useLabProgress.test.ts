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

test('other slugs are not affected by a toggle', () => {
  const { result } = renderHook(() => useLabProgress());
  act(() => result.current.toggle('network-api'));
  expect(result.current.isCompleted('async-ui')).toBe(false);
  expect(result.current.isCompleted('network-api')).toBe(true);
});
