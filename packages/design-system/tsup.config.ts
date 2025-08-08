import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'design-system': 'src/index.ts',
  },
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: '../../dist/design-system',
  external: ['react', 'react-dom'],
  esbuildOptions: (options) => {
    options.banner = {
      js: '/* Design System - Zero Pollution CSS + ES Modules */',
    };
  },
});
