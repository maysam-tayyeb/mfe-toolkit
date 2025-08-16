import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-modal-react19.js',
  manifestPath: './manifest.json'
});