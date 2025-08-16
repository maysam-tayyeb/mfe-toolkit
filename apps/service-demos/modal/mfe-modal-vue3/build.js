import { buildMFE } from '@mfe-toolkit/build';
import vue from 'esbuild-plugin-vue3';

await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe-modal-vue3.js',
  manifestPath: './manifest.json',
  plugins: [vue()]
});