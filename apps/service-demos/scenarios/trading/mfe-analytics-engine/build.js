const esbuild = require('esbuild');

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/main.ts'],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: 'dist/mfe-analytics-engine.js',
      loader: {
        '.ts': 'ts'
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      minify: true,
      sourcemap: false,
      target: 'es2020'
    });
    
    console.log('✅ mfe-analytics-engine built successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();