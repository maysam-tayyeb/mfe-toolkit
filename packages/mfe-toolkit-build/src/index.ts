/**
 * @mfe-toolkit/build - Build utilities for MFE development
 * 
 * This package contains Node.js-only build tools and should only be used
 * as a devDependency. Do not import this package in browser code.
 */

// Main build utility
export { buildMFE, type MFEBuildOptions } from './build/mfe-build';

// Legacy utilities (kept for backward compatibility)
export { 
  createMFEBuildConfig, 
  type MFEBuildConfig 
} from './build/esbuild-config';

export {
  createAliasedBuildConfig,
  createAliasStrategy,
  PRESETS,
  type ImportAliasConfig,
  type AliasStrategy
} from './build/import-alias-config';

export {
  remapImports,
  detectImportMap,
  remapImportsFromCLI,
  type ImportMapConfig,
  type RemapOptions
} from './build/import-remapper';