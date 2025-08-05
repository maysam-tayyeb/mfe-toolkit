import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export function createVitestConfig(options: { root: string }) {
  // Always include the setup file - vitest will handle missing files gracefully
  const setupFiles = [path.resolve(options.root, './src/__tests__/setup.ts')];

  return defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles,
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
        '@mfe-toolkit/core': path.resolve(options.root, '../../packages/mfe-toolkit-core/src'),
        '@mfe/shared': path.resolve(options.root, '../../packages/shared/src'),
        '@mfe-toolkit/state': path.resolve(options.root, '../../packages/mfe-toolkit-state/src'),
      },
    },
  });
}

// Root level config for running all tests
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mfe-toolkit/core': path.resolve(__dirname, './packages/mfe-toolkit-core/src'),
      '@mfe/shared': path.resolve(__dirname, './packages/shared/src'),
      '@mfe-toolkit/state': path.resolve(__dirname, './packages/mfe-toolkit-state/src'),
    },
  },
});
