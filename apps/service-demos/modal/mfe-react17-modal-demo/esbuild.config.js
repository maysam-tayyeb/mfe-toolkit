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
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.jsx': 'jsx',
    '.js': 'js',
  },
  resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
};

try {
  console.log('🔨 Building React 17 Modal Demo MFE with esbuild...');
  const result = await build(config);
  console.log('✅ React 17 Modal Demo MFE built successfully!');
  console.log('📦 Bundle created: dist/mfe-react17-modal-demo.js');

  // Get bundle size
  const fs = await import('fs');
  const stats = fs.statSync(path.join(__dirname, 'dist', 'mfe-react17-modal-demo.js'));
  const fileSizeInKB = (stats.size / 1024).toFixed(2);
  console.log(`📊 Bundle size: ${fileSizeInKB} KB`);
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
