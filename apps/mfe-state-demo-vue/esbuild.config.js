import { build } from 'esbuild';
import vue from 'esbuild-plugin-vue3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

const config = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  format: 'esm',
  outfile: path.join(rootDir, 'dist', 'mfe-state-demo-vue', 'mfe-state-demo-vue.js'),
  platform: 'browser',
  target: 'es2020',
  external: ['vue'],
  plugins: [vue()],
  loader: {
    '.ts': 'ts',
    '.css': 'css',
    '.svg': 'file',
    '.png': 'file',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
  },
  sourcemap: true,
  minify: true,
  treeShaking: true,
  keepNames: true,
  alias: {
    '@': path.join(__dirname, 'src'),
    '@mfe/universal-state': path.join(rootDir, 'packages/universal-state/src'),
  },
};

async function buildMfe() {
  try {
    console.log('🔨 Building State Demo Vue MFE...');
    await build(config);
    console.log('✅ State Demo Vue MFE built successfully to', config.outfile);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildMfe();