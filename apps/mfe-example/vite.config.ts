import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command }) => {
  if (command === 'build') {
    // Production build configuration for ES modules
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/main.tsx'),
          fileName: 'mfe-example',
          formats: ['es'],
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react-dom/client',
            '@reduxjs/toolkit',
            'react-redux'
          ],
          output: {
            entryFileNames: 'mfe-example.js',
          },
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@mfe/dev-kit': path.resolve(__dirname, '../../packages/mfe-dev-kit/src'),
          '@mfe/shared': path.resolve(__dirname, '../../packages/shared/src'),
        },
      },
    };
  }

  // Development server configuration
  return {
    plugins: [react()],
    server: {
      port: 3001,
      cors: true,
      fs: {
        allow: ['..', '../..'],
      },
    },
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@mfe/dev-kit': path.resolve(__dirname, '../../packages/mfe-dev-kit/src'),
        '@mfe/shared': path.resolve(__dirname, '../../packages/shared/src'),
      },
    },
  };
});
