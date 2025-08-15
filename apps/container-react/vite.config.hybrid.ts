import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Custom plugin to serve the hybrid HTML
const hybridHtmlPlugin = () => ({
  name: 'hybrid-html',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url === '/' || req.url === '/index.html') {
        const html = fs.readFileSync(path.resolve(__dirname, 'index-hybrid.html'), 'utf-8');
        const transformedHtml = await server.transformIndexHtml(req.url, html);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(transformedHtml);
        return;
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), hybridHtmlPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      external: [
        // Only external packages that are both in import map AND used by container
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime', 
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        'lucide-react',
        '@mfe/design-system',
        '@mfe/design-system/tokens',
        '@mfe/design-system/patterns',
        // Note: vue, zustand are in import map but not used by container directly
        // They're for MFEs to use
      ],
    },
  },
});