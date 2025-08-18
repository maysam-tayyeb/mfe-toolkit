# @mfe-toolkit/dev API Reference

## Configuration

### MFEDevConfig

Main configuration interface for the dev server.

```typescript
interface MFEDevConfig {
  dev?: DevServerConfig;
  meta?: {
    name?: string;
    version?: string;
    description?: string;
    framework?: 'react' | 'vue' | 'angular' | 'svelte' | 'solid' | 'vanilla';
  };
}
```

### DevServerConfig

Development server configuration options.

```typescript
interface DevServerConfig {
  // CSS files to load
  styles?: FilePath[];
  
  // JavaScript files to load before MFE
  scripts?: FilePath[];
  
  // Import map for ES modules
  importMap?: ImportMap;
  
  // Server port (default: 3100)
  port?: PortNumber;
  
  // HTML to inject in <head>
  headHtml?: HTMLString;
  
  // HTML to inject before </body>
  bodyHtml?: HTMLString;
  
  // Viewport configuration
  viewport?: ViewportConfig;
  
  // Theme configuration
  themes?: ThemeConfig;
  
  // Show dev tools on startup (default: true)
  showDevTools?: boolean;
  
  // Initial dev tools position
  devToolsPosition?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
}
```

## Type Definitions

### Core Types

```typescript
// CSS length with units
type CSSLength = number | `${number}${'px'|'%'|'vw'|'vh'|'em'|'rem'}` | 'auto';

// File path (absolute, relative, or URL)
type FilePath = string;

// Port number (1-65535)
type PortNumber = number;

// HTML string to inject
type HTMLString = string;

// CSS class name
type CSSClassName = string;

// CSS custom property
type CSSCustomProperty = `--${string}`;

// CSS color value
type CSSColor = string;
```

### ViewportConfig

```typescript
interface ViewportConfig {
  // Default viewport preset
  default?: ViewportPresetName;
  
  // Custom viewport when default is 'custom'
  custom?: CustomViewport;
  
  // Additional viewport presets
  presets?: ViewportPreset[];
}

type ViewportPresetName = 
  | 'mobile' 
  | 'tablet' 
  | 'desktop' 
  | 'wide' 
  | 'fullscreen' 
  | 'sidebar' 
  | 'widget' 
  | 'modal' 
  | 'custom';

interface ViewportPreset {
  name: string;
  width: CSSLength;
  height: CSSLength;
  icon?: string;
  description?: string;
}

interface CustomViewport {
  width: CSSLength;
  height: CSSLength;
  name?: string;
}
```

### ThemeConfig

```typescript
interface ThemeConfig {
  // Default theme name
  default?: ThemeName;
  
  // Available themes
  themes?: Theme[];
  
  // Allow custom CSS in dev tools
  allowCustomCSS?: boolean;
}

interface Theme {
  // Unique theme identifier
  name: ThemeName;
  
  // Display name in UI
  displayName?: string;
  
  // Theme description
  description?: string;
  
  // CSS files for this theme
  styles?: FilePath | FilePath[];
  
  // CSS class to apply
  class?: CSSClassName;
  
  // CSS variables to set
  variables?: Record<CSSCustomProperty, CSSColor>;
  
  // Extend another theme
  extends?: ThemeName;
}

type ThemeName = string;
```

### ImportMap

```typescript
interface ImportMap {
  [specifier: string]: string;
}

// Example:
const importMap: ImportMap = {
  'react': 'https://esm.sh/react@18',
  'react-dom': 'https://esm.sh/react-dom@18',
  '@company/ui': './node_modules/@company/ui/dist/index.js'
};
```

## Configuration Functions

### loadConfig

Loads configuration from mfe.config.js or mfe.config.mjs.

```typescript
function loadConfig(cwd: string): Promise<MFEDevConfig | null>
```

**Parameters:**
- `cwd`: Current working directory to search for config

**Returns:**
- Configuration object or null if not found

**Example:**
```typescript
const config = await loadConfig(process.cwd());
if (config) {
  console.log('Loaded config:', config);
}
```

### resolvePath

Resolves a path relative to the MFE root.

```typescript
function resolvePath(path: FilePath, cwd: string): string
```

**Parameters:**
- `path`: Path to resolve (absolute, relative, or URL)
- `cwd`: Current working directory

**Returns:**
- Resolved absolute path or URL

**Example:**
```typescript
const resolved = resolvePath('./styles.css', process.cwd());
// Returns: /absolute/path/to/styles.css
```

### isURL

Checks if a path is a URL.

```typescript
function isURL(path: FilePath): boolean
```

**Parameters:**
- `path`: Path to check

**Returns:**
- True if path is http:// or https:// URL

### isAbsolutePath

Checks if a path is absolute.

```typescript
function isAbsolutePath(path: FilePath): boolean
```

**Parameters:**
- `path`: Path to check

**Returns:**
- True if path starts with /

## Default Configurations

### DEFAULT_VIEWPORT_PRESETS

```typescript
const DEFAULT_VIEWPORT_PRESETS: ViewportPreset[] = [
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
```

### DEFAULT_THEMES

```typescript
const DEFAULT_THEMES: Theme[] = [
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
```

### DEFAULT_DEV_CONFIG

```typescript
const DEFAULT_DEV_CONFIG: Required<DevServerConfig> = {
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
```

## CLI Usage

### Command Line Interface

```bash
mfe-dev [options]
```

### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--port <number>` | `-p` | Port to run dev server | 3100 |
| `--entry <path>` | `-e` | Entry file path | Auto-detect |
| `--dist <path>` | `-d` | Distribution directory | dist |
| `--config <path>` | `-c` | Config file path | mfe.config.mjs |
| `--no-dev-tools` | | Disable dev tools | false |
| `--verbose` | `-v` | Verbose logging | false |
| `--help` | `-h` | Show help | |

### Examples

```bash
# Basic usage
mfe-dev

# Custom port
mfe-dev --port 3200

# Custom entry file
mfe-dev --entry src/custom-main.js

# Custom config
mfe-dev --config config/dev.config.mjs

# Disable dev tools
mfe-dev --no-dev-tools

# Verbose mode
mfe-dev --verbose
```

## Mock Services API

### Logger Service

```typescript
interface LoggerService {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
```

### Event Bus Service

```typescript
interface EventBusService {
  emit(event: string, data?: any): void;
  on(event: string, handler: (data: any) => void): () => void;
  off(event: string, handler: (data: any) => void): void;
  once(event: string, handler: (data: any) => void): void;
}
```

### Notification Service

```typescript
interface NotificationService {
  show(options: NotificationOptions): void;
  clear(): void;
}

interface NotificationOptions {
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // milliseconds
}
```

### Modal Service

```typescript
interface ModalService {
  open(options: ModalOptions): void;
  close(): void;
}

interface ModalOptions {
  title: string;
  content: string | HTMLElement;
  buttons?: ModalButton[];
}

interface ModalButton {
  label: string;
  onClick: () => void;
  primary?: boolean;
}
```

## Window API

### Global Functions

These functions are injected into the window object for dev tools interaction:

```typescript
// Apply a theme
window.applyTheme(theme: Theme): void;

// Toggle dev tools
window.toggleDevTools(): void;

// Clear console
window.clearConsole(): void;

// Emit event
window.emitEvent(type: string, payload: any): void;

// Get metrics
window.getMetrics(): Metrics;

interface Metrics {
  eventsEmitted: number;
  notificationsShown: number;
  logs: {
    debug: number;
    info: number;
    warn: number;
    error: number;
  };
  errorsCaught: number;
}
```

## Error Handling

### Error Types

```typescript
class DevServerError extends Error {
  code: string;
  details?: any;
}

// Common error codes
const ERROR_CODES = {
  PORT_IN_USE: 'PORT_IN_USE',
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  CONFIG_INVALID: 'CONFIG_INVALID',
  BUILD_FAILED: 'BUILD_FAILED',
  MFE_LOAD_FAILED: 'MFE_LOAD_FAILED'
};
```

### Error Handling Example

```typescript
try {
  await startDevServer(config);
} catch (error) {
  if (error instanceof DevServerError) {
    switch (error.code) {
      case 'PORT_IN_USE':
        console.error(`Port ${config.dev.port} is already in use`);
        break;
      case 'CONFIG_INVALID':
        console.error('Invalid configuration:', error.details);
        break;
      default:
        console.error('Dev server error:', error.message);
    }
  }
}
```

## Events

### Dev Server Events

The dev server emits these events:

```typescript
// Server started
devServer.on('start', (port: number) => {
  console.log(`Dev server running on port ${port}`);
});

// MFE loaded
devServer.on('mfe:loaded', (name: string) => {
  console.log(`MFE ${name} loaded successfully`);
});

// Error occurred
devServer.on('error', (error: Error) => {
  console.error('Dev server error:', error);
});

// File changed (hot reload)
devServer.on('file:change', (path: string) => {
  console.log(`File changed: ${path}`);
});
```

## Advanced Usage

### Custom Service Implementation

```typescript
// mfe.config.mjs
export default {
  dev: {
    services: {
      // Override the default logger
      logger: {
        debug: (msg) => console.log(`[CUSTOM] ${msg}`),
        info: (msg) => console.log(`[CUSTOM] ${msg}`),
        warn: (msg) => console.warn(`[CUSTOM] ${msg}`),
        error: (msg) => console.error(`[CUSTOM] ${msg}`)
      }
    }
  }
};
```

### Middleware Support

```typescript
// mfe.config.mjs
export default {
  dev: {
    middleware: [
      // Add custom Express middleware
      (req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
      }
    ]
  }
};
```

### Proxy Configuration

```typescript
// mfe.config.mjs
export default {
  dev: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
};
```