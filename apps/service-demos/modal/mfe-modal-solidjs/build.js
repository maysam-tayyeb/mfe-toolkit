import { buildMFE } from '@mfe-toolkit/build';

import { solidPlugin } from 'esbuild-plugin-solid';

// Build configuration using the new versioning system
// Automatically detects library versions from manifest.json
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-notification-solidjs.js',
  manifestPath: './manifest.json',
  esbuildOptions: {
    plugins: [solidPlugin()]
  }
});
