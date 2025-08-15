/**
 * Generic import aliasing configuration for MFE builds
 * Supports versioning for any library, not just React
 */

import type { BuildOptions } from 'esbuild';
import { readFileSync } from 'fs';

/**
 * Alias strategy for handling library versioning
 */
export type AliasStrategy = {
  /**
   * Name of the library (e.g., 'react', 'vue', 'lodash')
   */
  library: string;
  
  /**
   * Pattern to match in dependencies (e.g., '^17', '~4.17', '>=3.0.0')
   */
  versionPattern: RegExp | string;
  
  /**
   * Alias suffix to use (e.g., '@17', '@4', '@legacy')
   */
  aliasSuffix: string;
  
  /**
   * Additional imports to alias for this library
   * e.g., for React: ['react-dom', 'react-dom/client', 'react/jsx-runtime']
   */
  additionalImports?: string[];
  
  /**
   * Custom JSX configuration for this library version
   */
  jsxConfig?: {
    jsx: 'transform' | 'automatic' | 'preserve';
    jsxImportSource?: string;
  };
};

/**
 * Configuration for import aliasing
 */
export type ImportAliasConfig = {
  /**
   * Path to manifest.json or package.json
   */
  manifestPath?: string;
  
  /**
   * Explicit aliases to apply (overrides auto-detection)
   * e.g., { 'react': 'react@18', 'lodash': 'lodash@4' }
   */
  aliases?: Record<string, string>;
  
  /**
   * Alias strategies for auto-detection
   */
  strategies?: AliasStrategy[];
  
  /**
   * Whether to use default strategies for common libraries
   */
  useDefaultStrategies?: boolean;
};

/**
 * Default strategies for common libraries
 */
const DEFAULT_STRATEGIES: AliasStrategy[] = [
  // React 17
  {
    library: 'react',
    versionPattern: /^17\./,
    aliasSuffix: '@17',
    additionalImports: ['react-dom'],
    jsxConfig: {
      jsx: 'transform'
    }
  },
  // React 18
  {
    library: 'react',
    versionPattern: /^18\./,
    aliasSuffix: '@18',
    additionalImports: [
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime'
    ],
    jsxConfig: {
      jsx: 'automatic',
      jsxImportSource: 'react@18'
    }
  },
  // React 19 (future-proof - always use versioned imports)
  {
    library: 'react',
    versionPattern: /^19\./,
    aliasSuffix: '@19',
    additionalImports: [
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime'
    ],
    jsxConfig: {
      jsx: 'automatic',
      jsxImportSource: 'react@19'
    }
  },
  // Vue 2
  {
    library: 'vue',
    versionPattern: /^2\./,
    aliasSuffix: '@2',
    additionalImports: ['vue-router', 'vuex']
  },
  // Vue 3
  {
    library: 'vue',
    versionPattern: /^3\./,
    aliasSuffix: '@3',
    additionalImports: ['vue-router', 'pinia', '@vue/runtime-dom']
  },
  // Lodash 4
  {
    library: 'lodash',
    versionPattern: /^4\./,
    aliasSuffix: '@4',
    additionalImports: ['lodash-es']
  },
  // RxJS 6
  {
    library: 'rxjs',
    versionPattern: /^6\./,
    aliasSuffix: '@6',
    additionalImports: ['rxjs/operators']
  },
  // RxJS 7
  {
    library: 'rxjs',
    versionPattern: /^7\./,
    aliasSuffix: '@7',
    additionalImports: ['rxjs/operators']
  },
  // Angular versions (for future support)
  {
    library: '@angular/core',
    versionPattern: /^15\./,
    aliasSuffix: '@15',
    additionalImports: [
      '@angular/common',
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      '@angular/router',
      '@angular/forms'
    ]
  },
  // Zustand
  {
    library: 'zustand',
    versionPattern: /^4\./,
    aliasSuffix: '@4',
    additionalImports: ['zustand/middleware']
  },
  {
    library: 'zustand',
    versionPattern: /^5\./,
    aliasSuffix: '@5',
    additionalImports: ['zustand/middleware']
  }
];

/**
 * Detects library versions from manifest/package.json
 */
function detectLibraryVersions(
  manifestPath: string
): Map<string, string> {
  const versions = new Map<string, string>();
  
  try {
    const content = readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    
    // Check both runtime and regular dependencies
    const deps = {
      ...manifest.dependencies?.runtime,
      ...manifest.dependencies,
      ...manifest.peerDependencies
    };
    
    for (const [lib, version] of Object.entries(deps || {})) {
      if (typeof version === 'string') {
        // Extract actual version from semver range
        // e.g., "^17.0.2" -> "17.0.2", "~4.17.0" -> "4.17.0"
        const match = version.match(/[\d.]+/);
        if (match) {
          versions.set(lib, match[0]);
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to read manifest at ${manifestPath}:`, error);
  }
  
  return versions;
}

/**
 * Applies alias strategies based on detected versions
 */
function applyStrategies(
  versions: Map<string, string>,
  strategies: AliasStrategy[]
): {
  aliases: Record<string, string>;
  external: string[];
  jsxConfig?: any;
} {
  const aliases: Record<string, string> = {};
  const external: Set<string> = new Set();
  let jsxConfig: any;
  
  for (const [lib, version] of versions) {
    for (const strategy of strategies) {
      if (strategy.library !== lib) continue;
      
      const pattern = typeof strategy.versionPattern === 'string'
        ? new RegExp(strategy.versionPattern)
        : strategy.versionPattern;
      
      if (pattern.test(version)) {
        // Apply main library alias
        const aliasedName = `${lib}${strategy.aliasSuffix}`;
        aliases[lib] = aliasedName;
        external.add(aliasedName);
        
        // Apply additional imports
        if (strategy.additionalImports) {
          for (const additionalImport of strategy.additionalImports) {
            const baseImport = additionalImport.split('/')[0];
            const suffix = additionalImport.substring(baseImport.length);
            const aliasedImport = `${baseImport}${strategy.aliasSuffix}${suffix}`;
            
            aliases[additionalImport] = aliasedImport;
            external.add(aliasedImport);
          }
        }
        
        // Apply JSX config if specified
        if (strategy.jsxConfig && !jsxConfig) {
          jsxConfig = strategy.jsxConfig;
        }
        
        break; // Use first matching strategy
      }
    }
  }
  
  return { aliases, external: Array.from(external), jsxConfig };
}

/**
 * Creates esbuild configuration with import aliasing
 */
export function createAliasedBuildConfig(
  baseConfig: BuildOptions,
  aliasConfig: ImportAliasConfig = {}
): BuildOptions {
  const {
    manifestPath,
    aliases: explicitAliases,
    strategies = [],
    useDefaultStrategies = true
  } = aliasConfig;
  
  let finalAliases: Record<string, string> = {};
  let additionalExternal: string[] = [];
  let jsxConfig: any;
  
  // If explicit aliases provided, use them
  if (explicitAliases) {
    finalAliases = explicitAliases;
    additionalExternal = Object.values(explicitAliases);
  }
  // Otherwise, auto-detect from manifest
  else if (manifestPath) {
    const versions = detectLibraryVersions(manifestPath);
    const allStrategies = useDefaultStrategies 
      ? [...DEFAULT_STRATEGIES, ...strategies]
      : strategies;
    
    const result = applyStrategies(versions, allStrategies);
    finalAliases = result.aliases;
    additionalExternal = result.external;
    jsxConfig = result.jsxConfig;
  }
  
  // Merge with base config
  const config: BuildOptions = {
    ...baseConfig,
    ...jsxConfig,
    alias: {
      ...finalAliases,
      ...baseConfig.alias
    },
    external: [
      ...(baseConfig.external || []),
      ...additionalExternal
    ]
  };
  
  // Clean up empty alias object
  if (Object.keys(config.alias!).length === 0) {
    delete config.alias;
  }
  
  return config;
}

/**
 * Helper to add custom alias strategies
 */
export function createAliasStrategy(
  library: string,
  versionPattern: string | RegExp,
  suffix: string,
  options: {
    additionalImports?: string[];
    jsxConfig?: AliasStrategy['jsxConfig'];
  } = {}
): AliasStrategy {
  return {
    library,
    versionPattern,
    aliasSuffix: suffix,
    ...options
  };
}

/**
 * Common preset strategies
 */
export const PRESETS = {
  react17: createAliasStrategy('react', /^17\./, '@17', {
    additionalImports: ['react-dom'],
    jsxConfig: { jsx: 'transform' }
  }),
  
  react18: createAliasStrategy('react', /^18\./, '@18', {
    additionalImports: [
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime'
    ],
    jsxConfig: { jsx: 'automatic', jsxImportSource: 'react@18' }
  }),
  
  react19: createAliasStrategy('react', /^19\./, '@19', {
    additionalImports: [
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime'
    ],
    jsxConfig: { jsx: 'automatic', jsxImportSource: 'react@19' }
  }),
  
  vue2: createAliasStrategy('vue', /^2\./, '@2', {
    additionalImports: ['vue-router', 'vuex']
  }),
  
  vue3: createAliasStrategy('vue', /^3\./, '@3', {
    additionalImports: ['vue-router', 'pinia']
  }),
  
  lodash4: createAliasStrategy('lodash', /^4\./, '@4', {
    additionalImports: ['lodash-es']
  })
};