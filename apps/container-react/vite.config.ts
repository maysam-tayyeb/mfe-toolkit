import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      external: [
        // Mark design-system as external so it uses import map
        '@mfe/design-system',
        '@mfe/design-system/tokens',
        '@mfe/design-system/patterns',
      ],
    },
  },
});
