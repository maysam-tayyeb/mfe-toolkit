import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

const config = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  outfile: path.join(__dirname, 'dist', 'mfe-state-demo-react.js'),
  platform: 'browser',
  target: 'es2020',
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'lucide-react'],
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.DEV': 'false',
    'import.meta.env.PROD': 'true',
    global: 'globalThis',
  },
  sourcemap: true,
  minify: true,
  treeShaking: true,
  keepNames: true,
  jsx: 'automatic',
  alias: {
    '@': path.join(__dirname, 'src'),
    '@mfe-toolkit/core': path.join(rootDir, 'packages/mfe-toolkit-core/src'),
    '@mfe/shared': path.join(rootDir, 'packages/shared/src'),
    '@mfe-toolkit/state': path.join(rootDir, 'packages/mfe-toolkit-state/src'),
  },
};

async function buildMfe() {
  try {
    console.log('🔨 Building State Demo React MFE...');
    await build(config);
    console.log('✅ State Demo React MFE built successfully to', config.outfile);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildMfe();
