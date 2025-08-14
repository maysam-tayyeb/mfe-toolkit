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
  target: 'node18', // CLI tools run in Node
  external: ['@mfe-toolkit/core'], // Don't bundle peer dependencies
  shims: true, // Node.js shims for CLI
});