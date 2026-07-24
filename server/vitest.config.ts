import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      // db.ts only wraps a live Azure SQL connection — exercised by the
      // guarded, skip-by-default bookCatalogStore.azureSql.test.ts, not by the
      // default in-memory-store test run. See SPEC.md Resolved Decisions #5.
      exclude: ['src/index.ts', 'src/lib/db.ts'],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
