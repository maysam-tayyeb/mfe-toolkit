import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'MfeEventPublisher',
      fileName: 'mfe-event-publisher',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom']
    }
  }
});