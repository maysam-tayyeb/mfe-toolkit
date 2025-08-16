import { buildMFE } from '@mfe-toolkit/build';



// Build configuration using the new versioning system
// Automatically detects library versions from manifest.json
await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-modal-react17.js',
  manifestPath: './manifest.json'
});
