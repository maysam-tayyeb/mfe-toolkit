import esbuild from 'esbuild';
import { resolve } from 'path';

const buildOptions = {
  entryPoints: [resolve(process.cwd(), 'src/main.tsx')],
  bundle: true,
  format: 'esm',
  outfile: 'dist/mfe-react19-eventbus-demo.js',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  jsx: 'automatic'
};

esbuild.build(buildOptions).catch(() => process.exit(1));