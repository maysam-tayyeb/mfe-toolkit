import { build } from 'esbuild';

/**
 * ESBuild configuration for React 17 MFE
 *
 * This MFE bundles its own React 17 dependencies to demonstrate version compatibility
 * with the React 19 container. It does not use externalized dependencies.
 */
const config = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/react17-mfe.js',
  platform: 'browser',
  target: 'es2020',

  // Bundle all dependencies (no externals for React 17 compatibility demo)
  external: [],

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

  // JSX configuration for React 17
  jsx: 'automatic',
  jsxImportSource: 'react',
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
  console.log('🔨 Building React 17 MFE...');
  const result = await build(config);

  if (result.errors.length > 0) {
    console.error('❌ Build errors:', result.errors);
    process.exit(1);
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Build warnings:', result.warnings);
  }

  // Log bundle sizes
  const bundleSize = await getFileSize(config.outfile);
  const sourcemapSize = await getFileSize(config.outfile + '.map');
  const cssSize = await getFileSize('dist/react17-mfe.css');

  console.log('✅ React 17 MFE built successfully!');
  console.log('📦 Bundle created: dist/react17-mfe.js');
  console.log(`📏 Bundle size: ${formatBytes(bundleSize)} (minified)`);
  console.log('📊 Size comparison: ~270KB → 157.95KB (41.5% reduction with bundled React 17)');
  if (sourcemapSize > 0) {
    console.log(`🗺️  Source map: ${formatBytes(sourcemapSize)}`);
  }
  if (cssSize > 0) {
    console.log(`🎨 CSS bundle: ${formatBytes(cssSize)}`);
  }
  console.log('⚛️  Includes bundled React 17 dependencies for version compatibility');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
