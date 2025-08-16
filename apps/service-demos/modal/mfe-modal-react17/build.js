import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-modal-react17.js',
  manifestPath: './manifest.json'
});