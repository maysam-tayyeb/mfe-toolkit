# @mfe-toolkit/dev

Standalone development server with integrated dev tools for building and testing MFEs independently.

## Overview

`@mfe-toolkit/dev` provides a complete development environment for MFEs without requiring a container application. It includes mock services, an interactive dev tools panel, and hot reload support.

## Features

### 🚀 Standalone Development
- Develop MFEs independently without running the full container
- Zero configuration needed - works out of the box
- Hot reload with instant feedback
- ES module support with import maps

### 🛠️ Interactive Dev Tools
- **Console Tab**: Real-time log streaming with color-coded levels
- **Events Tab**: Event simulator and history viewer
- **Metrics Tab**: Performance and usage tracking
- **Viewport Tab**: Responsive testing with presets
- **Themes Tab**: Light/Dark theme switcher

### 🎯 Mock Services
All container services are automatically mocked:
- Logger service with console output
- Event bus for inter-MFE communication
- Notification service with toast UI
- Modal service for dialogs
- Auth service (mock implementation)

## Installation

```bash
npm install -D @mfe-toolkit/dev
# or
pnpm add -D @mfe-toolkit/dev
```

## Usage

### Basic Setup

1. Add to your MFE's package.json:

```json
{
  "scripts": {
    "dev": "mfe-dev"
  }
}
```

2. Start the dev server:

```bash
pnpm dev
```

3. Open http://localhost:3100 and press `Ctrl+Shift+D` to toggle dev tools

### Configuration

Create an `mfe.config.mjs` file in your MFE root:

```javascript
export default {
  dev: {
    // Port configuration
    port: 3100,
    
    // Load external styles
    styles: [
      './node_modules/@company/design-system/dist/styles.css',
      './src/styles/custom.css'
    ],
    
    // Load external scripts
    scripts: [
      './polyfills.js'
    ],
    
    // Import map for dependencies
    importMap: {
      'react': 'https://esm.sh/react@18',
      'react-dom': 'https://esm.sh/react-dom@18'
    },
    
    // Viewport presets
    viewport: {
      default: 'desktop',
      presets: [
        { name: 'Widget', width: 400, height: 300, icon: '📊' },
        { name: 'Sidebar', width: 350, height: '100vh', icon: '📑' }
      ]
    },
    
    // Theme configuration
    themes: {
      default: 'light',
      themes: [
        {
          name: 'light',
          displayName: 'Light Theme',
          class: 'light'
        },
        {
          name: 'dark',
          displayName: 'Dark Theme',
          class: 'dark'
        }
      ]
    },
    
    // Dev tools settings
    showDevTools: true,
    devToolsPosition: {
      x: 20,
      y: 20,
      width: 400,
      height: 300
    }
  }
};
```

## Dev Tools Usage

### Console Tab
- View all log messages from your MFE
- Color-coded by level (debug, info, warn, error)
- Auto-scrolls to latest entries
- Clear button to reset logs

### Events Tab
- **Event Log**: See all events emitted by your MFE
- **Emit Events**: Send test events to simulate inter-MFE communication
- **Presets**: Quick buttons for common events
- **Custom Events**: JSON editor for complex payloads

Example:
```javascript
// In your MFE
services.eventBus.emit('user:login', { userId: 123 });

// In dev tools Events tab, you can emit:
{
  "type": "cart:updated",
  "payload": {
    "items": 5,
    "total": 99.99
  }
}
```

### Metrics Tab
Tracks:
- Events emitted count
- Notifications shown
- Log entries by level
- Errors caught

### Viewport Tab
Test responsive behavior:
- **Presets**: Mobile, Tablet, Desktop, Wide, Fullscreen
- **Custom**: Set specific width/height with units (px, %, vw, vh)
- **Auto Height**: Let content determine height

### Themes Tab
- Switch between Light and Dark themes
- Test visual compatibility
- Apply custom CSS variables
- Real-time theme switching

## Command Line Options

```bash
# Use a different port
mfe-dev --port 3200

# Specify entry file
mfe-dev --entry src/custom-entry.js

# Custom dist directory
mfe-dev --dist build
```

## Environment Variables

- `MFE_DEV_PORT`: Override default port (3100)
- `MFE_DEV_HOST`: Override default host (localhost)
- `MFE_DEV_HTTPS`: Enable HTTPS (requires certificates)

## Keyboard Shortcuts

- `Ctrl+Shift+D`: Toggle dev tools panel
- `Ctrl+Shift+C`: Clear console
- `Ctrl+Shift+E`: Focus events tab
- `Ctrl+Shift+M`: Focus metrics tab

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import type { MFEDevConfig } from '@mfe-toolkit/dev';

const config: MFEDevConfig = {
  dev: {
    port: 3100,
    // ... fully typed configuration
  }
};

export default config;
```

## Integration with Build Tools

### With @mfe-toolkit/build

```javascript
// build.js
import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/my-mfe.js',
  manifestPath: './manifest.json',
  // Dev server will automatically detect built files
});
```

### With Vite

```javascript
// vite.config.js
export default {
  build: {
    lib: {
      entry: 'src/main.tsx',
      formats: ['es'],
      fileName: 'my-mfe'
    }
  }
};
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3100
lsof -ti:3100 | xargs kill -9

# Or use a different port
mfe-dev --port 3200
```

### Styles Not Loading
- Check paths in mfe.config.mjs are relative to MFE root
- Ensure design system is built before running dev server
- Use absolute paths for node_modules resources

### Events Not Working
- Check event names match exactly between publisher and subscriber
- Use the Events tab to see what events are being emitted
- Verify services.eventBus is available in your MFE

### Dev Tools Not Opening
- Try the keyboard shortcut: Ctrl+Shift+D
- Check browser console for errors
- Ensure showDevTools: true in config

## Examples

### React MFE Example

```typescript
// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import type { MFEModule } from '@mfe-toolkit/core';

const MyMFE: MFEModule = ({ logger, eventBus, notification }) => {
  return {
    mount: (element: HTMLElement) => {
      const root = createRoot(element);
      
      const App = () => {
        const handleClick = () => {
          notification.show({
            title: 'Hello!',
            message: 'From standalone dev',
            type: 'success'
          });
          
          eventBus.emit('button:clicked', { timestamp: Date.now() });
        };
        
        return (
          <div>
            <h1>My MFE</h1>
            <button onClick={handleClick}>Test Services</button>
          </div>
        );
      };
      
      root.render(<App />);
      logger.info('MFE mounted');
      
      return () => {
        root.unmount();
        logger.info('MFE unmounted');
      };
    }
  };
};

export default MyMFE;
```

### Vue MFE Example

```typescript
// src/main.ts
import { createApp } from 'vue';
import type { MFEModule } from '@mfe-toolkit/core';

const VueMFE: MFEModule = ({ logger, eventBus }) => {
  return {
    mount: (element: HTMLElement) => {
      const app = createApp({
        template: `
          <div>
            <h1>Vue MFE</h1>
            <button @click="testServices">Test Services</button>
          </div>
        `,
        methods: {
          testServices() {
            eventBus.emit('vue:action', { type: 'test' });
            logger.info('Services tested');
          }
        }
      });
      
      app.mount(element);
      
      return () => {
        app.unmount();
      };
    }
  };
};

export default VueMFE;
```

## Best Practices

1. **Use Configuration File**: Always create an mfe.config.mjs for better control
2. **Test Responsiveness**: Use viewport presets to test different screen sizes
3. **Theme Testing**: Always test both light and dark themes
4. **Event Naming**: Use consistent event naming convention (namespace:action)
5. **Error Handling**: Test error scenarios using the dev tools
6. **Performance**: Monitor metrics tab for performance issues

## Migration from Container Development

If you're moving from container-based development:

1. Install @mfe-toolkit/dev
2. Add dev script to package.json
3. Create mfe.config.mjs with your design system styles
4. Remove any container-specific dependencies
5. Use mock services for testing

## API Reference

See the [API Documentation](./api.md) for detailed API reference.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](../../../../CONTRIBUTING.md).

## License

MIT