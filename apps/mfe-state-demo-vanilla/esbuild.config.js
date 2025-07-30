const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: path.join(__dirname, '../../dist/mfe-state-demo-vanilla/main.js'),
  format: 'esm',
  sourcemap: true,
  target: 'es2020',
  external: ['lucide-react'],
  loader: {
    '.ts': 'ts',
    '.js': 'js',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
  },
  alias: {
    '@': path.join(__dirname, 'src'),
    '@mfe/dev-kit': path.join(__dirname, '../../packages/mfe-dev-kit/src'),
    '@mfe/universal-state': path.join(__dirname, '../../packages/universal-state/src'),
    '@mfe/shared': path.join(__dirname, '../../packages/shared/src'),
  },
  logLevel: 'info',
};

if (isWatch) {
  esbuild
    .context(config)
    .then((ctx) => {
      ctx.watch();
      console.log('[mfe-state-demo-vanilla] Watching for changes...');
    })
    .catch(() => process.exit(1));
} else {
  esbuild
    .build(config)
    .then(() => {
      console.log('[mfe-state-demo-vanilla] Build complete');
    })
    .catch(() => process.exit(1));
}
