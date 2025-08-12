import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const build = async () => {
  try {
    await esbuild.build({
      entryPoints: [path.resolve(__dirname, 'src/main.tsx')],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      target: 'es2020',
      outfile: path.resolve(__dirname, 'dist/mfe-event-publisher.js'),
      external: ['react', 'react-dom'],
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      minify: true,
      sourcemap: true,
    });
    
    console.log('✅ mfe-event-publisher built successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
};

build();