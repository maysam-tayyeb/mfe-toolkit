import { buildMFE } from '@mfe-toolkit/build';
import { solidPlugin } from 'esbuild-plugin-solid';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/mfe-modal-solidjs.js',
  manifestPath: './manifest.json',
  esbuildOptions: {
    plugins: [solidPlugin()]
  }
});