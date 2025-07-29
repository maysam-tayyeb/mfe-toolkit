import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UniversalState',
      fileName: (format) => `index.${format === 'es' ? 'es' : 'js'}`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['react', 'vue', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          vue: 'Vue',
        },
      },
    },
  },
});