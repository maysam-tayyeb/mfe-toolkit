import { buildMFE } from '@mfe-toolkit/core';

// Simple and clean - auto-detects React 18 from manifest.json
// and applies the correct aliasing (react -> react@18)
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-notification-react18.js',
  manifestPath: './manifest.json'
});