import { createViteConfig } from '../../vite.config.base';

export default createViteConfig(__dirname, {
  server: {
    port: 3000,
  },
});
