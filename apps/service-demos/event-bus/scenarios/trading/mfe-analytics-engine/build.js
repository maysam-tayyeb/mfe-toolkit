import { buildMFE } from '@mfe-toolkit/core';

// Build configuration for Vanilla TypeScript MFE
// No framework dependencies - pure TypeScript
await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe-analytics-engine.js',
  manifestPath: './manifest.json'
});