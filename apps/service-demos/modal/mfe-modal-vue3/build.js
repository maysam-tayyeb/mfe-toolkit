import { buildMFE } from '@mfe-toolkit/build';
import vuePlugin from 'esbuild-plugin-vue3';


// Build configuration using the new versioning system
// Automatically detects library versions from manifest.json
await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe-modal-vue3.js',
  manifestPath: './manifest.json',
  esbuildOptions: {
    plugins: [vuePlugin()]
  }
});
