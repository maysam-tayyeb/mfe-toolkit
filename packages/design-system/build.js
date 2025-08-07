#!/usr/bin/env node

/**
 * Design System Build Script
 * Builds CSS and ES modules, outputs to /dist/design-system/
 * No global pollution - pure modules only
 */

import esbuild from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  console.log('🎨 Building Design System...');
  
  const distPath = path.join(__dirname, '../../dist/design-system');
  
  // Ensure output directory exists
  await fs.ensureDir(distPath);
  
  // 1. Build ES Module (pure, no side effects)
  console.log('📦 Building ES module...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/index.ts')],
    bundle: true,
    format: 'esm',  // ES modules only - no IIFE, no globals
    outfile: path.join(distPath, 'design-system.esm.js'),
    platform: 'browser',
    target: 'es2020',
    minify: true,
    sourcemap: true,
    external: [], // Bundle everything for standalone use
  });
  
  // 2. Build TypeScript Declarations
  console.log('📝 Generating TypeScript declarations...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/index.ts')],
    bundle: true,
    format: 'esm',
    outfile: path.join(distPath, 'design-system.d.ts'),
    platform: 'browser',
    target: 'es2020',
    plugins: [{
      name: 'dts',
      setup(build) {
        build.onEnd(() => {
          // For now, copy the source .ts file as .d.ts
          // In production, use proper dts generation
          const source = fs.readFileSync(path.join(__dirname, 'src/index.ts'), 'utf-8');
          const dts = source
            .replace(/export const/g, 'export declare const')
            .replace(/as const;/g, ';');
          fs.writeFileSync(path.join(distPath, 'design-system.d.ts'), dts);
        });
      }
    }]
  });
  
  // 3. Build CSS
  console.log('🎨 Building CSS with Tailwind...');
  const cssInput = await fs.readFile(path.join(__dirname, 'src/styles/index.css'), 'utf-8');
  
  const result = await postcss([
    tailwindcss({
      content: [
        path.join(__dirname, 'src/**/*.{ts,tsx,css}'),
      ],
      theme: {
        extend: {
          colors: {
            // These would normally come from the container's theme
            // For now, using defaults that will be available
          },
        },
      },
    }),
    autoprefixer(),
  ]).process(cssInput, { 
    from: path.join(__dirname, 'src/styles/index.css'),
    to: path.join(distPath, 'design-system.css'),
  });
  
  await fs.writeFile(path.join(distPath, 'design-system.css'), result.css);
  
  if (result.map) {
    await fs.writeFile(path.join(distPath, 'design-system.css.map'), result.map.toString());
  }
  
  // 4. Create manifest for version tracking
  console.log('📋 Creating manifest...');
  const manifest = {
    version: '1.0.0',
    created: new Date().toISOString(),
    files: {
      css: 'design-system.css',
      esm: 'design-system.esm.js',
      types: 'design-system.d.ts',
    },
    exports: {
      tokens: true,
      patterns: true,
      classNames: true,
    },
  };
  
  await fs.writeJson(path.join(distPath, 'manifest.json'), manifest, { spaces: 2 });
  
  // 5. Report file sizes
  const cssSize = (await fs.stat(path.join(distPath, 'design-system.css'))).size;
  const esmSize = (await fs.stat(path.join(distPath, 'design-system.esm.js'))).size;
  
  console.log('\n✅ Design System built successfully!');
  console.log(`📁 Output: ${distPath}`);
  console.log(`📊 Sizes:`);
  console.log(`   - CSS: ${(cssSize / 1024).toFixed(2)} KB`);
  console.log(`   - ESM: ${(esmSize / 1024).toFixed(2)} KB`);
  console.log('\n🚀 Files ready to be served from /design-system/');
}

// Run build
build().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});