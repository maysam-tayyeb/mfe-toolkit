import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3004,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env': {},
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      name: 'StateDemoReact',
      fileName: 'state-demo-react',
      formats: ['es'],
    },
    rollupOptions: {
      external: [],
    },
  },
  // In dev mode, serve the built file
  ...(mode === 'development' && {
    server: {
      port: 3004,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  }),
}));