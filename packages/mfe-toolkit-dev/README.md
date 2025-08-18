# @mfe-toolkit/dev

Standalone development server for MFEs with mock services and dev tools.

## Features

- 🚀 **Standalone Development**: Run MFEs independently without the enterprise container
- 🎨 **Design System Support**: Load any CSS framework or design system
- 🛠️ **Dev Tools**: Built-in console, event tracker, and metrics dashboard
- 🔌 **Mock Services**: Full mock implementations of all MFE services
- 📦 **Zero Config**: Works out of the box with sensible defaults
- ⚙️ **Configurable**: Customize via `mfe.config.mjs` when needed

## Installation

```bash
npm install --save-dev @mfe-toolkit/dev
# or
pnpm add -D @mfe-toolkit/dev
```

## Usage

### Basic Setup

Add to your MFE's `package.json`:

```json
{
  "scripts": {
    "dev": "mfe-dev",
    "build": "node build.js"
  },
  "devDependencies": {
    "@mfe-toolkit/dev": "^0.1.0"
  }
}
```

Run the development server:

```bash
pnpm dev
```

Your MFE will be available at `http://localhost:3100` with:
- Mock services injected
- Dev tools panel (press Ctrl+Shift+D to toggle)
- Hot reload on file changes

## Configuration

### Design System Integration

Create an `mfe.config.mjs` file in your MFE root to load custom styles, scripts, or modules:

```javascript
// mfe.config.mjs
export default {
  dev: {
    // Load CSS files (design systems, frameworks, etc.)
    styles: [
      // Relative paths to workspace packages
      '../../../../packages/design-system/dist/styles.css',
      
      // Node modules
      './node_modules/@company/design-system/dist/styles.css',
      
      // External URLs
      'https://cdn.jsdelivr.net/npm/tailwindcss@2/dist/tailwind.min.css'
    ],
    
    // Load JavaScript files before MFE initialization
    scripts: [
      './node_modules/@company/design-tokens/dist/tokens.js',
      '../../../../packages/shared/dist/utils.js'
    ],
    
    // Configure import maps for ES modules
    importMap: {
      '@company/ui': './node_modules/@company/ui/dist/index.js',
      '@company/tokens': './node_modules/@company/tokens/dist/index.js',
      'react': 'https://esm.sh/react@18',
      'react-dom': 'https://esm.sh/react-dom@18'
    },
    
    // Custom port (default: 3100)
    port: 3200,
    
    // Additional HTML for <head>
    headHtml: `
      <link rel="icon" href="/favicon.ico">
      <meta name="theme-color" content="#000000">
    `,
    
    // Additional HTML before </body>
    bodyHtml: `
      <script>
        // Custom initialization code
        window.MFE_ENV = 'development';
      </script>
    `
  }
};
```

### Real-World Examples

#### Example 1: Using Tailwind CSS

```javascript
// mfe.config.mjs
export default {
  dev: {
    styles: [
      './node_modules/tailwindcss/dist/tailwind.min.css'
    ]
  }
};
```

#### Example 2: Using Material-UI

```javascript
// mfe.config.mjs
export default {
  dev: {
    styles: [
      'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap',
      'https://fonts.googleapis.com/icon?family=Material+Icons'
    ],
    importMap: {
      '@mui/material': 'https://esm.sh/@mui/material@5',
      '@emotion/react': 'https://esm.sh/@emotion/react@11',
      '@emotion/styled': 'https://esm.sh/@emotion/styled@11'
    }
  }
};
```

#### Example 3: Enterprise Design System

```javascript
// mfe.config.mjs
export default {
  dev: {
    styles: [
      './node_modules/@acme-corp/design-system/dist/acme.css',
      './node_modules/@acme-corp/design-system/dist/themes/light.css'
    ],
    scripts: [
      './node_modules/@acme-corp/design-system/dist/tokens.js'
    ],
    importMap: {
      '@acme-corp/ui': './node_modules/@acme-corp/ui/dist/index.js',
      '@acme-corp/icons': './node_modules/@acme-corp/icons/dist/index.js'
    },
    headHtml: `
      <link rel="stylesheet" href="https://fonts.acme-corp.com/css?family=AcmeSans">
    `
  }
};
```

#### Example 4: Monorepo with Shared Packages

```javascript
// mfe.config.mjs
export default {
  dev: {
    styles: [
      // Load from workspace packages
      '../../../../packages/design-system/dist/styles.css',
      '../../../../packages/ui-components/dist/components.css'
    ],
    scripts: [
      // Shared utilities
      '../../../../packages/shared/dist/utils.js',
      '../../../../packages/analytics/dist/tracker.js'
    ]
  }
};
```

## Mock Services

The dev server provides mock implementations of all MFE services:

### Logger Service
```javascript
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

### Event Bus
```javascript
// Subscribe to events
const unsubscribe = eventBus.on('user:login', (data) => {
  console.log('User logged in:', data);
});

// Emit events
eventBus.emit('user:login', { userId: '123' });

// Cleanup
unsubscribe();
```

### Notification Service
```javascript
notification.show({
  title: 'Success!',
  message: 'Operation completed',
  type: 'success',
  duration: 3000
});
```

### Modal Service
```javascript
modal.open({
  title: 'Confirm Action',
  content: 'Are you sure?',
  onConfirm: () => console.log('Confirmed'),
  onCancel: () => console.log('Cancelled')
});
```

### Auth Service
```javascript
const user = auth.getUser(); // Returns mock user
const isAuth = auth.isAuthenticated(); // Always true in dev
const hasPermission = auth.hasPermission('read'); // Always true in dev
```

## Dev Tools

The built-in dev tools panel provides:

### Console Tab
- Real-time log messages with timestamps
- Color-coded by level (debug, info, warn, error)
- Automatic scrolling to latest entries

### Events Tab
- Tracks all emitted events
- Shows event names and payloads
- Useful for debugging inter-MFE communication

### Metrics Tab
- Live counters for:
  - Events emitted
  - Notifications shown
  - Log entries
  - Errors caught

### Keyboard Shortcuts
- `Ctrl+Shift+D`: Toggle dev tools panel
- Panel can also be minimized/maximized via UI button

## Static File Serving

The dev server automatically serves:
- `/dist/*` - Your built MFE files
- `/node_modules/*` - Dependencies from node_modules
- `/workspace/*` - Workspace root (for monorepo packages)

## TypeScript Support

The package exports TypeScript definitions:

```typescript
import type { MFEDevConfig } from '@mfe-toolkit/dev';

const config: MFEDevConfig = {
  dev: {
    styles: ['./styles.css'],
    port: 3100
  }
};

export default config;
```

## Troubleshooting

### Styles not loading
- Check the path is relative to your MFE root
- For workspace packages, use `../` to navigate up
- For node_modules, path should include `node_modules/`
- Check browser console for 404 errors

### Port already in use
```bash
# Kill process on port 3100
lsof -ti:3100 | xargs kill -9

# Or use a different port in config
```

### MFE not mounting
- Ensure your MFE exports the correct interface
- Check that `dist/` folder exists (run build first)
- Verify mock services are being received

## Contributing

See the main repository's CONTRIBUTING.md for guidelines.

## License

MIT