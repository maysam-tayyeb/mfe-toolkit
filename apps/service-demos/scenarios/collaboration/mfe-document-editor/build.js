const esbuild = require('esbuild');
const vuePlugin = require('esbuild-plugin-vue3');
const path = require('path');

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/main.ts'],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: 'dist/mfe-document-editor.js',
      plugins: [vuePlugin()],
      external: [],
      loader: {
        '.ts': 'ts',
        '.vue': 'ts'
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      minify: true,
      sourcemap: false,
      target: 'es2020'
    });
    
    console.log('✅ mfe-document-editor built successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();