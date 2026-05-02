// @vitest-environment node
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

const skipDirs = new Set(['node_modules', '.next', 'coverage', 'playwright-report', 'test-results']);

function collectByExtension(dir: string, ext: string): string[] {
  const found: string[] = [];

  function walk(current: string) {
    for (const entry of readdirSync(current)) {
      if (skipDirs.has(entry)) continue;
      const full = join(current, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (entry.endsWith(ext)) {
        found.push(full.slice(projectRoot.length));
      }
    }
  }

  walk(dir);
  return found;
}

describe('repository hygiene', () => {
  it('has no project-authored .js files in src, e2e, or tests', () => {
    const jsFiles = [
      ...collectByExtension(join(projectRoot, 'src'), '.js'),
      ...collectByExtension(join(projectRoot, 'e2e'), '.js'),
      ...collectByExtension(join(projectRoot, 'tests'), '.js'),
    ];

    expect(jsFiles).toEqual([]);
  });

  it('has no project-authored .jsx files in src, e2e, or tests', () => {
    const jsxFiles = [
      ...collectByExtension(join(projectRoot, 'src'), '.jsx'),
      ...collectByExtension(join(projectRoot, 'e2e'), '.jsx'),
      ...collectByExtension(join(projectRoot, 'tests'), '.jsx'),
    ];

    expect(jsxFiles).toEqual([]);
  });

  it('has no .js config files at the project root', () => {
    const rootEntries = readdirSync(projectRoot).filter(
      (f) => !statSync(join(projectRoot, f)).isDirectory() && f.endsWith('.js'),
    );

    expect(rootEntries).toEqual([]);
  });
});
