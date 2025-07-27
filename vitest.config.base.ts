import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export function createVitestConfig(options: { root: string }) {
  return defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: [path.resolve(options.root, './src/__tests__/setup.ts')],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'dist/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/mockServiceWorker.js',
          '**/__tests__/**',
          '**/*.test.*',
          '**/ui/**', // ShadCN components
        ],
        thresholds: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'e2e'],
    },
    resolve: {
      alias: {
        '@': path.resolve(options.root, './src'),
        '@mfe/dev-kit': path.resolve(options.root, '../../packages/mfe-dev-kit/src'),
        '@mfe/shared': path.resolve(options.root, '../../packages/shared/src'),
      },
    },
  });
}

// Root level config for running all tests
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockServiceWorker.js',
        '**/__tests__/**',
        '**/*.test.*',
        '**/ui/**',
        'e2e/',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
