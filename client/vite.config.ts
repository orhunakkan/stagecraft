import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import compression from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compression({ algorithms: ['brotliCompress'], exclude: [/\.(br|gz)$/] }),
    compression({ algorithms: ['gzip'], exclude: [/\.(br|gz)$/] }),
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
        statements: 5,
        branches: 25,
        functions: 12,
        lines: 5,
      },
    },
  },
});
