import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe-modal-vue.js',
  manifestPath: './manifest.json',
  loader: {
    '.vue': 'text'
  }
});