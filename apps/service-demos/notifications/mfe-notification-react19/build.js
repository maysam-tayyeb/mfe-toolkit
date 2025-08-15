import { buildMFE } from '@mfe-toolkit/build';

// Simple and clean - auto-detects React 19 from manifest.json
// and applies the correct aliasing (react -> react@19)
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-notification-react19.js',
  manifestPath: './manifest.json'
});