import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mfe/dev-kit': path.resolve(__dirname, '../../packages/mfe-dev-kit/src'),
      '@mfe/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 3002,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      name: 'React17MFE',
      formats: ['umd'],
      fileName: 'react17-mfe',
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@reduxjs/toolkit': 'RTK',
          'react-redux': 'ReactRedux',
        },
      },
    },
  },
});