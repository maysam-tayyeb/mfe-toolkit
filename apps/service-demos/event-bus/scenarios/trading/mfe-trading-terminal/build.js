const esbuild = require('esbuild');
const vuePlugin = require('esbuild-plugin-vue3');

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/main.ts'],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: 'dist/mfe-trading-terminal.js',
      external: ['vue'],
      plugins: [vuePlugin()],
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
    
    console.log('✅ mfe-trading-terminal built successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();