import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import compression from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compression({ algorithms: ['brotliCompress'], exclude: [/\.(br|gz)$/] }),
    compression({ algorithms: ['gzip'], exclude: [/\.(br|gz)$/] }),
    ...(process.env['ANALYZE'] ? [visualizer({ open: true, filename: 'dist/stats.html' })] : []),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 500,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 75,
        lines: 80,
      },
    },
  },
});
