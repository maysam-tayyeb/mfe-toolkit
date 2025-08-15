/**
 * Import remapper for MFE builds
 * Allows MFEs to use standard imports that get remapped to versioned imports post-build
 */

import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

export type ImportMapConfig = {
  imports: Record<string, string>;
};

export type RemapOptions = {
  outputFile: string;
  importMap?: ImportMapConfig;
  manifestPath?: string;
};

/**
 * Detects the framework version from manifest and generates appropriate import map
 */
export async function detectImportMap(manifestPath: string): Promise<ImportMapConfig | null> {
  try {
    const manifestContent = await readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);
    
    const imports: Record<string, string> = {};
    
    // Check runtime dependencies for React version
    const runtimeDeps = manifest.dependencies?.runtime || {};
    
    // Detect React version
    if (runtimeDeps.react) {
      const reactVersion = runtimeDeps.react;
      if (reactVersion.includes('17')) {
        imports['react'] = 'react@17';
        imports['react-dom'] = 'react-dom@17';
      } else if (reactVersion.includes('18')) {
        imports['react'] = 'react@18';
        imports['react/jsx-runtime'] = 'react@18/jsx-runtime';
        imports['react/jsx-dev-runtime'] = 'react@18/jsx-dev-runtime';
        imports['react-dom'] = 'react-dom@18';
        imports['react-dom/client'] = 'react-dom@18/client';
      }
      // Default React 19 doesn't need remapping
    }
    
    // Detect Vue version (if needed in future)
    if (runtimeDeps.vue) {
      // Vue typically doesn't need version remapping in our setup
    }
    
    return Object.keys(imports).length > 0 ? { imports } : null;
  } catch (error) {
    console.error('Failed to read manifest:', error);
    return null;
  }
}

/**
 * Remaps imports in a built JavaScript file
 */
export async function remapImports(options: RemapOptions): Promise<void> {
  const { outputFile, importMap: providedMap, manifestPath } = options;
  
  // Determine import map - use provided or detect from manifest
  let importMap = providedMap;
  if (!importMap && manifestPath) {
    const detected = await detectImportMap(manifestPath);
    if (detected) {
      importMap = detected;
      console.log(`Detected import map from manifest:`, detected.imports);
    }
  }
  
  if (!importMap || Object.keys(importMap.imports).length === 0) {
    console.log('No import remapping needed');
    return;
  }
  
  try {
    // Read the built file
    let content = await readFile(outputFile, 'utf-8');
    
    // Apply import remappings
    for (const [original, replacement] of Object.entries(importMap.imports)) {
      // Handle various import patterns
      const patterns = [
        // ES module imports: import ... from "react"
        new RegExp(`(import[^"']*from\\s*["'])${escapeRegex(original)}(["'])`, 'g'),
        // Dynamic imports: import("react")
        new RegExp(`(import\\s*\\(\\s*["'])${escapeRegex(original)}(["']\\s*\\))`, 'g'),
        // Require calls (if any): require("react")
        new RegExp(`(require\\s*\\(\\s*["'])${escapeRegex(original)}(["']\\s*\\))`, 'g'),
      ];
      
      for (const pattern of patterns) {
        content = content.replace(pattern, `$1${replacement}$2`);
      }
    }
    
    // Write the modified content back
    await writeFile(outputFile, content, 'utf-8');
    console.log(`✅ Import remapping complete for ${outputFile}`);
    
  } catch (error) {
    console.error('Failed to remap imports:', error);
    throw error;
  }
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * CLI-friendly wrapper for import remapping
 */
export async function remapImportsFromCLI(
  outputFile: string,
  manifestPath?: string,
  importMapJson?: string
): Promise<void> {
  const options: RemapOptions = {
    outputFile: resolve(outputFile),
  };
  
  if (manifestPath) {
    options.manifestPath = resolve(manifestPath);
  }
  
  if (importMapJson) {
    try {
      options.importMap = JSON.parse(importMapJson);
    } catch (error) {
      console.error('Invalid import map JSON:', error);
      throw error;
    }
  }
  
  await remapImports(options);
}