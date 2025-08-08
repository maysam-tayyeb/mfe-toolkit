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
        // Only external packages that are both in import map AND used by container
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime', 
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        'lucide-react',
        '@mfe/design-system',
        '@mfe/design-system/tokens',
        '@mfe/design-system/patterns',
        // Note: vue, zustand are in import map but not used by container directly
        // They're for MFEs to use
      ],
    },
  },
});
