const esbuild = require('esbuild');
const { solidPlugin } = require('esbuild-plugin-solid');

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/main.tsx'],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: 'dist/mfe-event-playground.js',
      external: ['solid-js', 'solid-js/web', 'solid-js/store'],
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts'
      },
      plugins: [solidPlugin()],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      minify: true,
      sourcemap: false,
      target: 'es2020'
    });
    
    console.log('✅ mfe-event-playground built successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();