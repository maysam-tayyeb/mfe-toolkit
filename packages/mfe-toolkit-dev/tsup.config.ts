import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts'
  },
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'node18',
  external: ['vite', 'express'],
  esbuildOptions(options) {
    options.platform = 'node';
  }
});