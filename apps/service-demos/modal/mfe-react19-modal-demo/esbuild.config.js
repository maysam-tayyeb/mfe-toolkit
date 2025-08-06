import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  outfile: path.join(__dirname, 'dist', 'mfe-react19-modal-demo.js'),
  platform: 'browser',
  target: 'es2020',
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
  },
  sourcemap: true,
  minify: true,
  treeShaking: true,
  keepNames: true,
  jsx: 'automatic',
};

try {
  console.log('🔨 Building React 19 Modal Demo MFE...');
  const result = await build(config);
  console.log('✅ React 19 Modal Demo MFE built successfully!');
  console.log('📦 Bundle created: dist/mfe-react19-modal-demo.js');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}