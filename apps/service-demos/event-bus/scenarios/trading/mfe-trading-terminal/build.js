import { buildMFE } from '@mfe-toolkit/core';
import vuePlugin from 'esbuild-plugin-vue3';

// Build configuration for Vue 3 MFE (Trading Terminal)
// Automatically detects Vue version from manifest.json
await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe-trading-terminal.js',
  manifestPath: './manifest.json',
  esbuildOptions: {
    plugins: [vuePlugin()]
  }
});