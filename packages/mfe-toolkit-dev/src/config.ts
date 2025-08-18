import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

// ============================================================================
// Base Types
// ============================================================================

/**
 * CSS length units for viewport dimensions
 */
export type CSSLengthUnit = 'px' | '%' | 'vw' | 'vh' | 'em' | 'rem';

/**
 * CSS length value (number with unit or percentage string)
 */
export type CSSLength = number | `${number}${CSSLengthUnit}` | `${number}%` | 'auto';

/**
 * File path that can be absolute, relative, or a URL
 */
export type FilePath = string;

/**
 * Module specifier for import maps
 */
export type ModuleSpecifier = string;

/**
 * URL string
 */
export type URLString = string;

/**
 * Port number (1-65535)
 */
export type PortNumber = number;

/**
 * HTML string to be injected
 */
export type HTMLString = string;

// ============================================================================
// Viewport Types
// ============================================================================

/**
 * Predefined viewport preset names
 */
export type ViewportPresetName = 
  | 'mobile' 
  | 'tablet' 
  | 'desktop' 
  | 'wide' 
  | 'fullscreen' 
  | 'sidebar' 
  | 'widget' 
  | 'modal' 
  | 'custom';

/**
 * Viewport dimensions
 */
export interface ViewportDimensions {
  /** Width of the viewport */
  width: CSSLength;
  /** Height of the viewport */
  height: CSSLength;
}

/**
 * Custom viewport preset definition
 */
export interface ViewportPreset extends ViewportDimensions {
  /** Unique name for the preset */
  name: string;
  /** Optional icon to display in UI (emoji or icon class) */
  icon?: string;
  /** Optional description for the preset */
  description?: string;
}

/**
 * Custom viewport configuration when using 'custom' preset
 */
export interface CustomViewport extends ViewportDimensions {
  /** Optional display name for the custom viewport */
  name?: string;
}

/**
 * Viewport configuration for simulating different container sizes
 */
export interface ViewportConfig {
  /**
   * Default viewport preset to use on load
   * @default 'fullscreen'
   */
  default?: ViewportPresetName;
  
  /**
   * Custom viewport dimensions when default is 'custom'
   * Required when default is set to 'custom'
   */
  custom?: CustomViewport;
  
  /**
   * Additional project-specific viewport presets
   * These will be added to the default presets in the UI
   */
  presets?: ViewportPreset[];
}

// ============================================================================
// Theme Types
// ============================================================================

/**
 * Theme name identifier
 */
export type ThemeName = string;

/**
 * CSS class name
 */
export type CSSClassName = string;

/**
 * CSS custom property (CSS variable)
 */
export type CSSCustomProperty = `--${string}`;

/**
 * CSS color value
 */
export type CSSColor = string;

/**
 * Theme definition
 */
export interface Theme {
  /** Unique identifier for the theme */
  name: ThemeName;
  
  /** Display name shown in the UI */
  displayName?: string;
  
  /** Description of the theme */
  description?: string;
  
  /** 
   * CSS files to load for this theme
   * Can be a single file or array of files
   */
  styles?: FilePath | FilePath[];
  
  /** CSS class to add to the document root when theme is active */
  class?: CSSClassName;
  
  /** 
   * CSS custom properties (variables) to set when theme is active
   * Keys should be CSS custom property names (e.g., '--primary-color')
   */
  variables?: Record<CSSCustomProperty, CSSColor>;
  
  /** Whether this theme extends another theme */
  extends?: ThemeName;
}

/**
 * Theme configuration for testing different visual styles
 */
export interface ThemeConfig {
  /**
   * Default theme to use on load
   * Must match one of the theme names in the themes array
   * @default 'light'
   */
  default?: ThemeName;
  
  /**
   * Available themes for the MFE
   * If not provided, default light/dark themes will be used
   */
  themes?: Theme[];
  
  /**
   * Whether to allow custom CSS input in the dev tools
   * @default true
   */
  allowCustomCSS?: boolean;
}

// ============================================================================
// Import Map Types
// ============================================================================

/**
 * Import map for ES module resolution
 */
export interface ImportMap {
  /** 
   * Module specifier to URL mappings
   * @example { "react": "https://esm.sh/react@18" }
   */
  [specifier: ModuleSpecifier]: URLString;
}

// ============================================================================
// Dev Server Configuration
// ============================================================================

/**
 * Development server configuration options
 */
export interface DevServerConfig {
  /**
   * CSS files to load in the dev server
   * Can be absolute paths, relative to the MFE root, or URLs
   * @example ["./styles/main.css", "https://cdn.example.com/theme.css"]
   */
  styles?: FilePath[];
  
  /**
   * JavaScript files to load before the MFE
   * Can be absolute paths, relative to the MFE root, or URLs
   * Useful for polyfills, global utilities, or configuration
   * @example ["./polyfills.js", "./config.js"]
   */
  scripts?: FilePath[];
  
  /**
   * Import map for ES module resolution
   * Maps module specifiers to URLs for dynamic imports
   * @example { "@company/ui": "./node_modules/@company/ui/dist/index.js" }
   */
  importMap?: ImportMap;
  
  /**
   * Port to run the dev server on
   * @default 3100
   * @minimum 1
   * @maximum 65535
   */
  port?: PortNumber;
  
  /**
   * Additional HTML to inject into the <head> element
   * Useful for meta tags, fonts, or analytics scripts
   * @example "<link rel='icon' href='/favicon.ico'>"
   */
  headHtml?: HTMLString;
  
  /**
   * Additional HTML to inject before the closing </body> tag
   * Useful for scripts that need to run after the DOM is loaded
   * @example "<script>console.log('MFE loaded')</script>"
   */
  bodyHtml?: HTMLString;
  
  /**
   * Viewport configuration for simulating different container sizes
   */
  viewport?: ViewportConfig;
  
  /**
   * Theme configuration for testing different visual styles
   */
  themes?: ThemeConfig;
  
  /**
   * Whether to show the dev tools panel on startup
   * @default true
   */
  showDevTools?: boolean;
  
  /**
   * Initial dev tools panel position
   */
  devToolsPosition?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
}

// ============================================================================
// Main Configuration
// ============================================================================

/**
 * Complete MFE development configuration
 */
export interface MFEDevConfig {
  /**
   * Development server configuration
   * All dev-specific settings are nested under this key
   */
  dev?: DevServerConfig;
  
  /**
   * MFE metadata (optional, for future use)
   */
  meta?: {
    /** Name of the MFE */
    name?: string;
    /** Version of the MFE */
    version?: string;
    /** Description of the MFE */
    description?: string;
    /** Framework used by the MFE */
    framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'solid' | 'vanilla';
  };
}

// ============================================================================
// Configuration Loading
// ============================================================================

/**
 * Configuration file names to search for
 */
const CONFIG_FILE_NAMES = ['mfe.config.mjs', 'mfe.config.js'] as const;

/**
 * Load MFE configuration from mfe.config.js or mfe.config.mjs
 * @param cwd - Current working directory to search for config
 * @returns Loaded configuration or null if not found
 */
export async function loadConfig(cwd: string): Promise<MFEDevConfig | null> {
  const configPaths = CONFIG_FILE_NAMES.map(name => join(cwd, name));
  
  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        const fileUrl = pathToFileURL(resolve(configPath)).href;
        const module = await import(fileUrl);
        const config = module.default || module;
        
        // Validate configuration
        if (config && typeof config === 'object') {
          return config as MFEDevConfig;
        }
        
        console.warn(`Invalid configuration in ${configPath}: Expected an object`);
      } catch (error) {
        console.warn(`Failed to load config from ${configPath}:`, error);
      }
    }
  }
  
  return null;
}

// ============================================================================
// Path Resolution
// ============================================================================

/**
 * Resolve a path relative to the MFE root
 * @param path - Path to resolve (can be absolute, relative, or URL)
 * @param cwd - Current working directory for relative paths
 * @returns Resolved path
 */
export function resolvePath(path: FilePath, cwd: string): string {
  // Return absolute paths and URLs as-is
  if (path.startsWith('/') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Resolve relative paths
  return join(cwd, path);
}

/**
 * Check if a path is a URL
 * @param path - Path to check
 * @returns True if the path is a URL
 */
export function isURL(path: FilePath): boolean {
  return path.startsWith('http://') || path.startsWith('https://');
}

/**
 * Check if a path is absolute
 * @param path - Path to check
 * @returns True if the path is absolute
 */
export function isAbsolutePath(path: FilePath): boolean {
  return path.startsWith('/');
}

// ============================================================================
// Default Configurations
// ============================================================================

/**
 * Default viewport presets
 */
export const DEFAULT_VIEWPORT_PRESETS: ViewportPreset[] = [
  { name: 'Mobile', width: 375, height: 667, icon: '📱', description: 'iPhone SE' },
  { name: 'Tablet', width: 768, height: 1024, icon: '📱', description: 'iPad' },
  { name: 'Desktop', width: 1280, height: 720, icon: '🖥️', description: 'HD Desktop' },
  { name: 'Wide', width: 1920, height: 1080, icon: '🖥️', description: 'Full HD' },
  { name: 'Fullscreen', width: '100%', height: '100vh', icon: '⛶', description: 'Full viewport' },
  { name: 'Sidebar', width: 350, height: '100vh', icon: '📑', description: 'Sidebar panel' },
  { name: 'Widget', width: 400, height: 300, icon: '◻', description: 'Dashboard widget' },
  { name: 'Widget Auto', width: 400, height: 'auto', icon: '◫', description: 'Auto-height widget' },
  { name: 'Modal', width: 600, height: 400, icon: '🗗', description: 'Modal dialog' },
];

/**
 * Default themes
 */
export const DEFAULT_THEMES: Theme[] = [
  {
    name: 'light',
    displayName: 'Light',
    description: 'Default light theme',
    class: 'light',
    variables: {}
  },
  {
    name: 'dark',
    displayName: 'Dark',
    description: 'Dark mode theme',
    class: 'dark',
    variables: {}
  }
];

/**
 * Default dev server configuration
 */
export const DEFAULT_DEV_CONFIG: Required<DevServerConfig> = {
  styles: [],
  scripts: [],
  importMap: {},
  port: 3100,
  headHtml: '',
  bodyHtml: '',
  viewport: {
    default: 'fullscreen',
    presets: []
  },
  themes: {
    default: 'light',
    themes: DEFAULT_THEMES,
    allowCustomCSS: true
  },
  showDevTools: true,
  devToolsPosition: {
    x: 20,
    y: 20,
    width: 400,
    height: 300
  }
};