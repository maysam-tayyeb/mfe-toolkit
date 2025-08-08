import { createViteConfig } from '../../vite.config.base';
import path from 'path';
import fs from 'fs';
import { Plugin } from 'vite';

// Plugin to serve design system CSS
const serveDesignSystem = (): Plugin => ({
  name: 'serve-design-system',
  configureServer(server) {
    server.middlewares.use('/design-system', (req, res, next) => {
      const filePath = path.join(__dirname, '../../dist/design-system', req.url);
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'text/css');
        res.end(fs.readFileSync(filePath));
      } else {
        next();
      }
    });
  },
});

export default createViteConfig(__dirname, {
  server: {
    port: 3000,
  },
  plugins: [serveDesignSystem()],
});
