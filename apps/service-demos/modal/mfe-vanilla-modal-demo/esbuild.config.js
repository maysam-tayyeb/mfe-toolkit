import esbuild from 'esbuild';
import { resolve } from 'path';

const buildOptions = {
  entryPoints: [resolve(process.cwd(), 'src/main.ts')],
  bundle: true,
  format: 'esm',
  outfile: 'dist/mfe-vanilla-modal-demo.js',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  sourcemap: true,
  external: [],
  define: {
    'process.env.NODE_ENV': '"production"'
  }
};

esbuild.build(buildOptions).catch(() => process.exit(1));