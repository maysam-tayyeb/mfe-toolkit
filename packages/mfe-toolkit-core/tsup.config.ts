import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  outDir: 'dist',
  target: 'es2020',
  external: [],
  noExternal: ['ajv', 'ajv-formats'], // Bundle these dependencies
});