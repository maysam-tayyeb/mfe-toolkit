/**
 * Generic MFE build utility with automatic dependency externalization
 */

import type { BuildOptions } from 'esbuild';
import { readFileSync } from 'fs';

export type MFEBuildOptions = {
  /**
   * Entry point(s) for the build
   */
  entry: string | string[];
  
  /**
   * Output file or directory
   */
  outfile?: string;
  outdir?: string;
  
  /**
   * Path to manifest.json for auto-detection (default: './manifest.json')
   */
  manifestPath?: string;
  
  /**
   * Additional dependencies to externalize (beyond what's in manifest)
   */
  additionalExternal?: string[];
  
  /**
   * Whether to use versioned imports (default: true)
   * When true: react → react@18
   * When false: react → react
   */
  useVersionedImports?: boolean;
  
  /**
   * Additional esbuild options
   */
  esbuildOptions?: Partial<BuildOptions>;
  
  /**
   * Build mode
   */
  mode?: 'development' | 'production';
};

/**
 * Extract major version from a semver string
 */
function extractMajorVersion(versionString: string): string {
  // Handle various semver patterns: ^1.2.3, ~1.2.3, >=1.2.3, 1.2.3, 1.x, etc.
  const match = versionString.match(/\d+/);
  return match ? match[0] : '';
}

/**
 * Detect all dependencies from manifest and create aliases/externals
 */
function detectDependencies(manifestPath: string, useVersionedImports: boolean): {
  aliases: Record<string, string>;
  external: string[];
} {
  const aliases: Record<string, string> = {};
  const external = new Set<string>();
  
  try {
    const content = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    
    // Collect all dependencies from various sources
    const allDeps: Record<string, string> = {
      ...manifest.dependencies?.runtime,
      ...manifest.dependencies?.peer,
      ...manifest.dependencies,
      ...manifest.peerDependencies,
      ...manifest.devDependencies, // Sometimes needed for build tools
    };
    
    // Process each dependency
    for (const [library, versionSpec] of Object.entries(allDeps)) {
      if (!versionSpec) continue;
      
      if (useVersionedImports) {
        const majorVersion = extractMajorVersion(versionSpec);
        if (majorVersion) {
          // Create versioned alias: library → library@version
          const versionedImport = `${library}@${majorVersion}`;
          aliases[library] = versionedImport;
          external.add(versionedImport);
          
          // Also handle common subpaths for known libraries
          // This is the minimal set needed for proper externalization
          const commonSubpaths = getCommonSubpaths(library);
          for (const subpath of commonSubpaths) {
            const fullPath = `${library}/${subpath}`;
            const versionedPath = `${library}@${majorVersion}/${subpath}`;
            aliases[fullPath] = versionedPath;
            external.add(versionedPath);
          }
        } else {
          // No version detected, just mark as external
          external.add(library);
        }
      } else {
        // Simple externalization without versioning
        external.add(library);
      }
    }
  } catch (error) {
    console.warn(`Could not read manifest at ${manifestPath}, proceeding without auto-detection`);
  }
  
  return { 
    aliases, 
    external: Array.from(external) 
  };
}

/**
 * Get common subpaths that should also be aliased for a library
 * This is a minimal set - only the most common cases
 */
function getCommonSubpaths(library: string): string[] {
  // Only handle the absolute minimum needed subpaths
  const subpathMap: Record<string, string[]> = {
    'react': ['jsx-runtime', 'jsx-dev-runtime'],
    'react-dom': ['client', 'server'],
    'solid-js': ['web', 'store', 'html', 'h'],
    '@vue': ['runtime-dom', 'runtime-core'],
    'rxjs': ['operators'],
    'lodash': ['fp'],
    'zustand': ['middleware'],
  };
  
  return subpathMap[library] || [];
}

/**
 * Build an MFE with automatic import aliasing
 */
export async function buildMFE(options: MFEBuildOptions): Promise<void> {
  const {
    entry,
    outfile,
    outdir,
    manifestPath = './manifest.json',
    additionalExternal = [],
    useVersionedImports = true,
    esbuildOptions = {},
    mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
  } = options;
  
  // Detect dependencies and create aliases
  const { aliases, external } = detectDependencies(manifestPath, useVersionedImports);
  
  // Determine JSX settings from manifest if available
  let jsxOptions: Partial<BuildOptions> = {};
  try {
    const content = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    
    // Auto-detect React version for JSX configuration
    const reactVersion = manifest.dependencies?.runtime?.react || 
                        manifest.dependencies?.react ||
                        manifest.peerDependencies?.react;
    
    if (reactVersion) {
      const majorVersion = extractMajorVersion(reactVersion);
      if (majorVersion && parseInt(majorVersion) >= 17) {
        // React 17+ uses automatic JSX transform
        jsxOptions.jsx = 'automatic';
        if (useVersionedImports) {
          jsxOptions.jsxImportSource = `react@${majorVersion}`;
        }
      } else {
        // React 16 and below use classic transform
        jsxOptions.jsx = 'transform';
      }
    }
  } catch {
    // Ignore - will use default JSX settings
  }
  
  // Base esbuild configuration
  const baseConfig: BuildOptions = {
    entryPoints: Array.isArray(entry) ? entry : [entry],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    sourcemap: true,
    minify: mode === 'production',
    loader: {
      '.tsx': 'tsx',
      '.ts': 'ts',
      '.jsx': 'jsx',
      '.js': 'js',
      '.vue': 'js', // Vue files handled by plugin
      '.json': 'json',
    },
    alias: useVersionedImports && Object.keys(aliases).length > 0 ? aliases : undefined,
    external: [...external, ...additionalExternal],
    ...jsxOptions,
    ...esbuildOptions,
    // Merge plugins properly
    plugins: [
      ...(esbuildOptions.plugins || [])
    ]
  };
  
  // Add output configuration
  if (outfile) {
    baseConfig.outfile = outfile;
  } else if (outdir) {
    baseConfig.outdir = outdir;
    baseConfig.splitting = true; // Enable code splitting for outdir
  }
  
  // Import esbuild dynamically
  const esbuild = await import('esbuild');
  
  // Handle watch mode
  const watch = process.argv.includes('--watch');
  
  if (watch) {
    const ctx = await esbuild.context(baseConfig);
    await ctx.watch();
    console.log('👀 Watching for changes...');
  } else {
    const result = await esbuild.build(baseConfig);
    
    if (result.errors.length > 0) {
      console.error('Build failed with errors:', result.errors);
      process.exit(1);
    }
    
    console.log('✅ Build complete');
    
    // Log externalized dependencies for debugging
    if (baseConfig.external && baseConfig.external.length > 0) {
      console.log('Externalized:', baseConfig.external);
    }
    
    // Log applied aliases for debugging
    if (baseConfig.alias && Object.keys(baseConfig.alias).length > 0) {
      console.log('Aliases applied:', Object.keys(baseConfig.alias).length, 'entries');
    }
  }
}

