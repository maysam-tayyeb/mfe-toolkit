import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      name: 'EventDemo',
      fileName: 'event-demo',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client'],
    },
  },
});