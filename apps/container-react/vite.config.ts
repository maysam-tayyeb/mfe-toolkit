import { createViteConfig } from '../../vite.config.base';
import { defineConfig } from 'vite';

const baseConfig = createViteConfig(__dirname, {
  server: {
    port: 3000,
  },
});

export default defineConfig({
  ...baseConfig,
  server: {
    ...baseConfig.server,
    fs: {
      allow: ['../../dist/design-system'],
    },
  },
  publicDir: '../../dist',
});
