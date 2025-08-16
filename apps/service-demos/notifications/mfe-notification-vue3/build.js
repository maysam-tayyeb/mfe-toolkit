import { buildMFE } from '@mfe-toolkit/build';
import vuePlugin from 'esbuild-plugin-vue3';

// Build configuration for Vue 3 MFE
await buildMFE({
  entry: 'src/main.ts',
  outfile: 'dist/mfe-notification-vue3.js',
  manifestPath: './manifest.json',
  esbuildOptions: {
    plugins: [vuePlugin()]
  }
});