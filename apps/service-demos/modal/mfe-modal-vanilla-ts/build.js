import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe-modal-vanilla-ts.js',
  manifestPath: './manifest.json'
});