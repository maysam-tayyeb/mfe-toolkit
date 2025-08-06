import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
  ],
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  build: {
    lib: {
      entry: 'src/main.tsx',
      formats: ['es'],
      fileName: 'mfe-react17-modal-demo',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'mfe-react17-modal-demo.js',
      },
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env': '{}',
    global: 'globalThis',
  },
});