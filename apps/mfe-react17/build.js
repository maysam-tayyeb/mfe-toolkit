import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build as ES module for modern browsers
build({
  entryPoints: [path.resolve(__dirname, 'src/main.tsx')],
  bundle: true,
  format: 'esm',
  outfile: path.resolve(__dirname, 'dist/react17-mfe.js'),
  external: ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux'],
  define: {
    'process.env.NODE_ENV': '"production"',
    'global': 'globalThis',
  },
  minify: true,
  sourcemap: true,
  target: 'es2020',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.css': 'css',
  },
}).then(() => {
  console.log('✅ React 17 MFE built successfully as ES module');
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});