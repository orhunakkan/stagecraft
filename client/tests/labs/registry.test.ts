import { describe, test, expect } from 'vitest';
import { labs } from '../../src/labs';

describe('lab registry', () => {
  test('all 20 labs are registered', () => {
    expect(labs).toHaveLength(20);
  });

  test('every lab has a unique slug', () => {
    const slugs = labs.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test('all slugs are kebab-case', () => {
    for (const lab of labs) {
      expect(lab.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  test('all statuses are valid', () => {
    const valid = new Set(['ready', 'coming-soon']);
    for (const lab of labs) {
      expect(valid.has(lab.status)).toBe(true);
    }
  });

  test('all labs are ready', () => {
    const ready = labs.filter((l) => l.status === 'ready');
    expect(ready).toHaveLength(labs.length);
  });

  test('every lab has at least one api listed', () => {
    for (const lab of labs) {
      expect(lab.apis.length).toBeGreaterThan(0);
    }
  });
});
