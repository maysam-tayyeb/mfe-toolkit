const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: path.join(__dirname, '../../dist/mfe-state-demo-vanilla/main.js'),
  format: 'esm',
  sourcemap: true,
  target: 'es2020',
  loader: {
    '.js': 'js',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
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