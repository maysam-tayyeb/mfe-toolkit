import { buildMFE } from '@mfe-toolkit/build';
import { solidPlugin } from 'esbuild-plugin-solid';

// Build configuration for Solid.js MFE
// Automatically detects Solid.js version from manifest.json
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-event-playground.js',
  manifestPath: './manifest.json',
  esbuildOptions: {
    plugins: [solidPlugin()]
  }
});