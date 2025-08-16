import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe-modal-vanilla.js',
  manifestPath: './manifest.json'
});