const { build } = require('tsup');
const path = require('path');

async function buildMFE() {
  try {
    await build({
      entry: ['src/main.tsx'],
      format: ['esm'],
      platform: 'browser',
      outDir: 'dist',
      external: [
        'react', 
        'react-dom', 
        'react-dom/client', 
        'react/jsx-runtime', 
        'react/jsx-dev-runtime'
      ],
      esbuildOptions(options) {
        options.loader = {
          '.tsx': 'tsx',
          '.ts': 'ts'
        };
        options.define = {
          'process.env.NODE_ENV': '"production"'
        };
        options.target = 'es2020';
      },
      minify: true,
      sourcemap: false,
      clean: true,
      outExtension() {
        return {
          js: '.js'
        };
      },
      // Rename output file
      onSuccess: async () => {
        const fs = require('fs').promises;
        const oldPath = path.join(__dirname, 'dist/main.js');
        const newPath = path.join(__dirname, 'dist/mfe-notification-react19.js');
        
        try {
          await fs.rename(oldPath, newPath);
          console.log('✅ mfe-notification-react19 built successfully with tsup');
        } catch (err) {
          // File might already have correct name
          console.log('✅ mfe-notification-react19 built successfully with tsup');
        }
      }
    });
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildMFE();