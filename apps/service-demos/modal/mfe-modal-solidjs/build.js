import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-modal-solidjs.js',
  manifestPath: './manifest.json',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts'
  }
});