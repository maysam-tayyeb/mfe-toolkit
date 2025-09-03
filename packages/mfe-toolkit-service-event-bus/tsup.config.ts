import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disable while we fix type conflicts
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['@mfe-toolkit/core']
});