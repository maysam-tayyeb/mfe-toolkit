import { buildMFE } from '@mfe-toolkit/build';



// Build configuration using the new versioning system
// Automatically detects library versions from manifest.json
await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe-modal-vanilla.js',
  manifestPath: './manifest.json'
});
