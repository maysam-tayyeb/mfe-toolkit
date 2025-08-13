const esbuild = require('esbuild');
const path = require('path');

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/main.tsx'],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: 'dist/mfe-market-watch.js',
      external: ['react', 'react-dom'],
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts'
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      minify: true,
      sourcemap: false,
      target: 'es2020'
    });
    
    console.log('✅ mfe-market-watch built successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();