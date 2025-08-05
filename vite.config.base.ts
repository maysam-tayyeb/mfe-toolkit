import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export function createViteConfig(dirname: string, options: any = {}) {
  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
        '@mfe-toolkit/core': path.resolve(dirname, '../../packages/mfe-toolkit-core/src'),
        '@mfe/shared': path.resolve(dirname, '../../packages/shared/src'),
        '@mfe-toolkit/state': path.resolve(dirname, '../../packages/mfe-toolkit-state/src'),
      },
    },
    ...options,
  });
}
