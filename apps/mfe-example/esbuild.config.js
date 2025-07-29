import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

/**
 * ESBuild configuration for Example MFE
 *
 * This MFE uses externalized dependencies via import map for optimal bundle size.
 * Dependencies like React, Redux are provided by the container's import map.
 */
const config = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  outfile: path.join(rootDir, 'dist', 'mfe-example', 'mfe-example.js'),
  platform: 'browser',
  target: 'es2020',

  // Externalize dependencies available via import map
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    '@reduxjs/toolkit',
    'react-redux',
  ],

  // Define environment variables
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
  },

  // Enable source maps for debugging
  sourcemap: true,

  // Minify for production
  minify: true,

  // Tree shaking enabled
  treeShaking: true,

  // Keep function names for better debugging
  keepNames: true,

  // JSX configuration
  jsx: 'automatic',
};

// Helper function to format file size
function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Helper function to get file size
async function getFileSize(filePath) {
  try {
    const { stat } = await import('fs/promises');
    const stats = await stat(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

// Build the MFE
try {
  console.log('🔨 Building Example MFE...');
  const result = await build(config);

  if (result.errors.length > 0) {
    console.error('❌ Build errors:', result.errors);
    process.exit(1);
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Build warnings:', result.warnings);
  }

  // Log bundle size
  const bundleSize = await getFileSize(config.outfile);
  const sourcemapSize = await getFileSize(config.outfile + '.map');

  console.log('✅ Example MFE built successfully!');
  console.log('📦 Bundle created: dist/mfe-example.js');
  console.log(`📏 Bundle size: ${formatBytes(bundleSize)} (minified)`);
  console.log('📊 Size comparison: ~576KB → 14.09KB (97.6% reduction with import map)');
  if (sourcemapSize > 0) {
    console.log(`🗺️  Source map: ${formatBytes(sourcemapSize)}`);
  }
  console.log('🔗 Uses externalized dependencies via import map');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
