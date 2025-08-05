import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MFEToolkitStateMiddlewarePerformance',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'index.es' : 'index.js',
    },
    rollupOptions: {
      external: ['@mfe-toolkit/state'],
      output: {
        globals: {
          '@mfe-toolkit/state': 'MFEToolkitState',
        },
      },
    },
  },
});