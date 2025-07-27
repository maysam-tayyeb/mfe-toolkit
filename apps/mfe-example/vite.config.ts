import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      name: 'ExampleMFE',
      fileName: 'mfe-example',
      formats: ['umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  server: {
    port: 3001,
    cors: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@mfe/dev-kit': path.resolve(__dirname, '../../packages/mfe-dev-kit/src'),
      '@mfe/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});