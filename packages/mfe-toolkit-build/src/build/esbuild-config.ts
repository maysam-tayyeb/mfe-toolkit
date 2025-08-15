/**
 * esbuild configuration utilities for MFE builds
 * Provides smart defaults and React version handling
 */

import type { BuildOptions } from 'esbuild';
import { readFileSync } from 'fs';

export type MFEBuildConfig = {
  /**
   * Path to the MFE's manifest.json
   * Used to auto-detect React version and other settings
   */
  manifestPath?: string;
  
  /**
   * Override React version (17, 18, 19)
   * If not specified, will be detected from manifest
   */
  reactVersion?: '17' | '18' | '19';
  
  /**
   * Base esbuild configuration
   * These will be merged with the generated config
   */
  esbuildOptions?: Partial<BuildOptions>;
  
  /**
   * Entry point for the MFE
   */
  entryPoint?: string;
  
  /**
   * Output file path
   */
  outfile?: string;
};

/**
 * Detects React version from manifest.json
 */
function detectReactVersion(manifestPath: string): '17' | '18' | '19' | null {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const reactDep = manifest.dependencies?.runtime?.react || '';
    
    if (reactDep.includes('17')) return '17';
    if (reactDep.includes('18')) return '18';
    if (reactDep.includes('19')) return '19';
    
    // Default to latest if not specified
    return null;
  } catch {
    return null;
  }
}

/**
 * Creates esbuild configuration for an MFE
 * Handles React version aliasing automatically
 */
export function createMFEBuildConfig(config: MFEBuildConfig): BuildOptions {
  const {
    manifestPath = './manifest.json',
    reactVersion,
    esbuildOptions = {},
    entryPoint = 'src/main.tsx',
    outfile = 'dist/bundle.js'
  } = config;
  
  // Detect React version if not explicitly provided
  const detectedVersion = reactVersion || 
    (manifestPath ? detectReactVersion(manifestPath) : null);
  
  // Build the alias configuration based on React version
  const alias: Record<string, string> = {};
  const external: string[] = ['@mfe-toolkit/core'];
  
  switch (detectedVersion) {
    case '17':
      // React 17 uses classic runtime
      alias['react'] = 'react@17';
      alias['react-dom'] = 'react-dom@17';
      external.push('react@17', 'react-dom@17');
      break;
      
    case '18':
      // React 18 uses automatic runtime with aliased imports
      alias['react'] = 'react@18';
      alias['react-dom'] = 'react-dom@18';
      alias['react-dom/client'] = 'react-dom@18/client';
      alias['react/jsx-runtime'] = 'react@18/jsx-runtime';
      alias['react/jsx-dev-runtime'] = 'react@18/jsx-dev-runtime';
      external.push(
        'react@18', 
        'react-dom@18', 
        'react-dom@18/client',
        'react@18/jsx-runtime',
        'react@18/jsx-dev-runtime'
      );
      break;
      
    case '19':
    default:
      // React 19 uses the default imports (no aliasing needed)
      external.push(
        'react', 
        'react-dom', 
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime'
      );
      break;
  }
  
  // Determine JSX configuration based on React version
  const jsxConfig = detectedVersion === '17' 
    ? { jsx: 'transform' as const }
    : { 
        jsx: 'automatic' as const,
        jsxImportSource: detectedVersion === '18' ? 'react@18' : 'react'
      };
  
  // Merge all configurations
  const finalConfig: BuildOptions = {
    entryPoints: [entryPoint],
    bundle: true,
    outfile,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    ...jsxConfig,
    alias: {
      ...alias,
      ...esbuildOptions.alias
    },
    external: [
      ...external,
      ...(esbuildOptions.external || [])
    ],
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
    loader: {
      '.tsx': 'tsx',
      '.ts': 'ts',
      '.jsx': 'jsx',
      '.js': 'js',
      ...esbuildOptions.loader
    },
    ...esbuildOptions
  };
  
  // Remove alias if empty
  if (Object.keys(finalConfig.alias!).length === 0) {
    delete finalConfig.alias;
  }
  
  return finalConfig;
}

/**
 * Helper to create a standard MFE build script
 */
export async function buildMFE(config: MFEBuildConfig): Promise<void> {
  const esbuild = await import('esbuild');
  const buildConfig = createMFEBuildConfig(config);
  
  const watch = process.argv.includes('--watch');
  
  if (watch) {
    const ctx = await esbuild.context(buildConfig);
    await ctx.watch();
    console.log('👀 Watching for changes...');
  } else {
    await esbuild.build(buildConfig);
    console.log('✅ Build complete');
  }
}