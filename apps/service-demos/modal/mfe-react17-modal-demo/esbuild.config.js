import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  outfile: path.join(__dirname, 'dist', 'mfe-react17-modal-demo.js'),
  platform: 'browser',
  target: 'es2020',
  // React 17 is bundled, not external
  external: [],
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env': '{}',
    global: 'globalThis',
  },
  sourcemap: true,
  minify: true,
  treeShaking: true,
  keepNames: true,
  // React 17 uses classic JSX runtime
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  inject: ['./react-shim.js'],
};

try {
  console.log('🔨 Building React 17 Modal Demo MFE...');
  const result = await build(config);
  console.log('✅ React 17 Modal Demo MFE built successfully!');
  console.log('📦 Bundle created: dist/mfe-react17-modal-demo.js');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}