import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3109
  },
  define: {
    'process.env': {}
  },
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'MfeReact19EventBusDemo',
      fileName: 'mfe-react19-eventbus-demo',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM'
        }
      }
    }
  }
});