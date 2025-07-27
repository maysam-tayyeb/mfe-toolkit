import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export function createViteConfig(dirname: string, options: any = {}) {
  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(dirname, './src'),
        '@mfe/dev-kit': path.resolve(dirname, '../../packages/mfe-dev-kit/src'),
        '@mfe/shared': path.resolve(dirname, '../../packages/shared/src'),
      },
    },
    ...options,
  });
}