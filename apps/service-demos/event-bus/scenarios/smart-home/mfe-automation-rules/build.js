const esbuild = require('esbuild');
const path = require('path');

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/main.ts'],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: 'dist/mfe-automation-rules.js',
      external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'vue'],
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
    
    console.log('✅ mfe-automation-rules built successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();