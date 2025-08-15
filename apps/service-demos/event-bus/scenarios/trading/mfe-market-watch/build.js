import { buildMFE } from '@mfe-toolkit/core';

// Build configuration for React MFE (Market Watch)
// Automatically detects React version from manifest.json
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-market-watch.js',
  manifestPath: './manifest.json'
});