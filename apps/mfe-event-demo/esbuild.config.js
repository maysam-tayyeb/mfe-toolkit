import { build } from 'esbuild';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const outfile = path.join(rootDir, 'dist', 'mfe-event-demo', 'mfe-event-demo.js');

async function buildMFE() {
  console.log('🔨 Building Event Demo MFE...');

  try {
    const result = await build({
      entryPoints: ['src/main.tsx'],
      bundle: true,
      outfile,
      format: 'esm',
      platform: 'browser',
      target: ['es2020'],
      minify: true,
      sourcemap: true,
      metafile: true,
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        '@reduxjs/toolkit',
        'react-redux',
        'lucide-react',
      ],
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
    });

    // Analyze bundle
    const metaText = JSON.stringify(result.metafile, null, 2);
    const metaPath = path.join(rootDir, 'dist', 'mfe-event-demo', 'meta.json');
    await fs.writeFile(metaPath, metaText);

    // Log bundle size
    const stats = await fs.stat(outfile);
    const sizeInKB = (stats.size / 1024).toFixed(2);
    
    console.log('✅ Event Demo MFE built successfully!');
    console.log(`📦 Bundle created: ${outfile}`);
    console.log(`📏 Bundle size: ${sizeInKB} KB (minified)`);
    console.log('🔗 Uses externalized dependencies via import map');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildMFE();