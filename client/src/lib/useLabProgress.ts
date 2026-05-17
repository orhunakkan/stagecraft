import { useState, useCallback } from 'react';

const STORAGE_KEY = 'stagecraft:completed';

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function save(slugs: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugs]));
}

export function useLabProgress() {
  const [completed, setCompleted] = useState<Set<string>>(load);

  const toggle = useCallback((slug: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      save(next);
      return next;
    });
  }, []);

  const isCompleted = useCallback((slug: string) => completed.has(slug), [completed]);

  return { completed, toggle, isCompleted };
}
