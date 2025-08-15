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
  target: 'node16',
  platform: 'node',
  // Don't bundle esbuild, it's a peer dependency
  external: ['esbuild']
});