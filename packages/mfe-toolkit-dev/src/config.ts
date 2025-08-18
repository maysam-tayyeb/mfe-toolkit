import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

export interface MFEDevConfig {
  dev?: {
    /**
     * CSS files to load in the dev server
     * Can be absolute paths or relative to the MFE root
     */
    styles?: string[];
    
    /**
     * JavaScript files to load before the MFE
     * Can be absolute paths or relative to the MFE root
     */
    scripts?: string[];
    
    /**
     * Import map for ES modules
     * Maps module specifiers to URLs
     */
    importMap?: Record<string, string>;
    
    /**
     * Port to run the dev server on
     * @default 3100
     */
    port?: number;
    
    /**
     * Additional HTML to inject into the <head>
     */
    headHtml?: string;
    
    /**
     * Additional HTML to inject before the closing </body>
     */
    bodyHtml?: string;
  };
}

/**
 * Load MFE configuration from mfe.config.js or mfe.config.mjs
 */
export async function loadConfig(cwd: string): Promise<MFEDevConfig | null> {
  const configPaths = [
    join(cwd, 'mfe.config.mjs'),
    join(cwd, 'mfe.config.js'),
  ];
  
  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const fileUrl = pathToFileURL(resolve(configPath)).href;
        const module = await import(fileUrl);
        return module.default || module;
      } catch (error) {
        console.warn(`Failed to load config from ${configPath}:`, error);
      }
    }
  }
  
  return null;
}

/**
 * Resolve a path relative to the MFE root
 */
export function resolvePath(path: string, cwd: string): string {
  if (path.startsWith('/') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return join(cwd, path);
}