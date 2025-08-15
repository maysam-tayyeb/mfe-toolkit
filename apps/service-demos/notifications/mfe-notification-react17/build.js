import { buildMFE } from '@mfe-toolkit/build';

// Simple and clean - auto-detects React 17 from manifest.json
// and applies the correct aliasing (react -> react@17)
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-notification-react17.js',
  manifestPath: './manifest.json'
});
