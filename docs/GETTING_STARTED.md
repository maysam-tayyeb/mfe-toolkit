# Getting Started with MFE Toolkit - Complete Guide

This guide takes you from zero to a production-ready microfrontend application using MFE Toolkit.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Quick Start - Standalone Development](#quick-start---standalone-development)
4. [Setting Up a Container Application](#setting-up-a-container-application)
5. [Creating Your First MFE](#creating-your-first-mfe)
6. [Connecting MFEs with Services](#connecting-mfes-with-services)
7. [Inter-MFE Communication](#inter-mfe-communication)
8. [State Management](#state-management)
9. [Testing Your MFEs](#testing-your-mfes)
10. [Production Deployment](#production-deployment)
11. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm/pnpm installed
- **Basic knowledge** of JavaScript/TypeScript
- **Familiarity** with ES modules and modern build tools
- **A code editor** (VS Code recommended)

## Understanding the Architecture

### MFE Development Approaches

MFE Toolkit now offers **two development approaches**:

#### 1. 🚀 **Standalone Development** (Recommended for Development)
- Develop MFEs independently without running the full container
- Includes built-in dev tools and mock services
- Faster iteration and testing
- Perfect for component development

#### 2. 🏗️ **Container Integration** (Required for Production)
- Full integration with the container application
- Real service implementations
- Complete application context
- Production-like environment

### The Architecture Flow

```
┌─────────────────────────────────────┐
│    Standalone Development (Dev)      │ ← Start here for quick development!
│  - @mfe-toolkit/dev server           │
│  - Mock services                     │
│  - Dev tools & debugging             │
└─────────────┬───────────────────────┘
              │
              │ Build & Export
              ↓
┌─────────────────────────────────────┐
│         Container (Production)       │ ← Deploy here for production
│  - Loads built MFEs                  │
│  - Provides real services            │
│  - Manages routing                   │
└─────────────────────────────────────┘
```

## Quick Start - Standalone Development

### The Fastest Way to Start Building MFEs

With `@mfe-toolkit/dev`, you can start building MFEs immediately without setting up a container:

#### Step 1: Create a New MFE

```bash
# Create a new MFE using the CLI
npx @mfe-toolkit/cli create my-awesome-mfe

# Choose your framework:
# - React 19
# - Vue 3
# - Solid.js
# - Vanilla TypeScript

cd my-awesome-mfe
```

#### Step 2: Install Dev Toolkit

```bash
# Add the dev toolkit
pnpm add -D @mfe-toolkit/dev

# Update package.json
{
  "scripts": {
    "dev": "mfe-dev",
    "build": "node build.js"
  }
}
```

#### Step 3: Configure Your Design System (Optional)

Create an `mfe.config.mjs` file to load your styles:

```javascript
// mfe.config.mjs
export default {
  dev: {
    // Load your design system CSS
    styles: [
      './node_modules/@your-company/design-system/dist/styles.css',
      // Or use our design system
      '../../../../packages/design-system/dist/styles.css'
    ],
    
    // Configure viewport presets for testing
    viewport: {
      default: 'desktop',
      presets: [
        { name: 'Dashboard Widget', width: 450, height: 350, icon: '📊' },
        { name: 'Sidebar Panel', width: 380, height: '100vh', icon: '📑' }
      ]
    },
    
    // Configure themes for testing
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
    }
  }
};
```

#### Step 4: Start Development

```bash
# Start the standalone dev server
pnpm dev

# Your MFE is now running at http://localhost:3100 with:
# ✅ Mock services injected
# ✅ Dev tools panel (press Ctrl+Shift+D)
# ✅ Hot reload
# ✅ Event bus simulator
# ✅ Viewport controls
# ✅ Theme switcher
```

### 🛠️ Using the Dev Tools

The standalone dev server includes powerful dev tools:

#### **Console Tab**
- Real-time log messages from your MFE
- Color-coded by level (debug, info, warn, error)
- Automatic scrolling to latest entries

#### **Events Tab**
- View all events emitted by your MFE
- Emit test events to simulate inter-MFE communication
- Quick preset buttons for common events
- JSON editor for complex event payloads

#### **Metrics Tab**
- Track events emitted
- Monitor notifications shown
- Count log entries
- Track errors caught

#### **Viewport Tab**
- Test responsive behavior with preset sizes
- Mobile (375×667), Tablet (768×1024), Desktop (1280×720)
- Custom dimensions with px, %, vw, vh units
- Auto-height mode for adaptive components

#### **Themes Tab**
- Switch between Light and Dark themes
- Test visual compatibility
- Apply custom CSS variables
- Ensure design system compliance

### Example: Building a Notification MFE

```typescript
// src/main.ts
import type { MFEModule } from '@mfe-toolkit/core';

const NotificationMFE: MFEModule = ({ logger, eventBus, notification }) => {
  return {
    mount: (element: HTMLElement) => {
      logger.info('NotificationMFE mounting');
      
      // Create UI with your design system classes
      element.innerHTML = `
        <div class="ds-card ds-p-4">
          <h2 class="ds-text-lg ds-font-bold">Notifications</h2>
          <button class="ds-btn-primary" id="test-btn">
            Send Test Notification
          </button>
          <div id="notification-list" class="ds-mt-4"></div>
        </div>
      `;
      
      // Add functionality
      const button = element.querySelector('#test-btn');
      button?.addEventListener('click', () => {
        notification.show({
          title: 'Test Notification',
          message: 'This is from the MFE!',
          type: 'success'
        });
        
        eventBus.emit('notification:sent', {
          timestamp: Date.now(),
          source: 'notification-mfe'
        });
      });
      
      // Listen for events from other MFEs
      const unsubscribe = eventBus.on('app:notification', (data) => {
        const list = element.querySelector('#notification-list');
        if (list) {
          list.innerHTML += `
            <div class="ds-alert ds-alert-info ds-mt-2">
              ${data.message}
            </div>
          `;
        }
      });
      
      return () => {
        unsubscribe();
        logger.info('NotificationMFE unmounting');
      };
    }
  };
};

export default NotificationMFE;
```

### Building for Production

Once your MFE is ready:

```bash
# Build the MFE
node build.js

# This creates dist/my-awesome-mfe.js
# Ready to be loaded by the container!
```

## Setting Up a Container Application

While standalone development is great for building MFEs, you'll need a container for production deployment and integration testing.

### Quick Start: Use the Existing Container

```bash
# Clone the repository with working container
git clone https://github.com/maysam-tayyeb/mfe-toolkit.git
cd mfe-toolkit

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start the container application
pnpm dev:container-react  # Runs on http://localhost:3000

# In another terminal, serve the MFEs
pnpm serve  # Runs on http://localhost:8080
```

✅ **Now you have a working container!** You can see it at http://localhost:3000

### Building Your Own Container

> **📚 Need a custom container?**  
> See our **[Complete Container Setup Guide](./CONTAINER_SETUP_GUIDE.md)** for step-by-step instructions.

## Creating Your First MFE

### Step 1: Generate a New MFE

```bash
# Using the CLI
npx @mfe-toolkit/cli create my-first-mfe

# Choose your framework and follow the prompts
```

### Step 2: MFE Structure

Every MFE exports a default function that returns mount/unmount methods:

```typescript
// src/main.ts
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';

const MyFirstMFE: MFEModule = (services: MFEServices) => {
  return {
    mount: (element: HTMLElement) => {
      // Initialize your MFE
      services.logger.info('MFE mounted');
      
      // Return cleanup function
      return () => {
        services.logger.info('MFE unmounted');
      };
    }
  };
};

export default MyFirstMFE;
```

### Step 3: Framework Examples

#### React Example

```tsx
// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import type { MFEModule } from '@mfe-toolkit/core';

const App: React.FC<{ services: any }> = ({ services }) => {
  const handleClick = () => {
    services.eventBus.emit('button:clicked', { source: 'react-mfe' });
  };

  return (
    <div>
      <h2>React MFE</h2>
      <button onClick={handleClick}>Send Event</button>
    </div>
  );
};

const ReactMFE: MFEModule = (services) => {
  let root: any = null;

  return {
    mount: (element: HTMLElement) => {
      root = createRoot(element);
      root.render(<App services={services} />);
      
      return () => {
        root.unmount();
      };
    }
  };
};

export default ReactMFE;
```

#### Vue Example

```typescript
// src/main.ts
import { createApp } from 'vue';
import type { MFEModule } from '@mfe-toolkit/core';

const VueMFE: MFEModule = (services) => {
  let app: any = null;

  return {
    mount: (element: HTMLElement) => {
      app = createApp({
        template: `
          <div>
            <h2>Vue MFE</h2>
            <button @click="sendEvent">Send Event</button>
          </div>
        `,
        methods: {
          sendEvent() {
            services.eventBus.emit('button:clicked', { source: 'vue-mfe' });
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

### Step 4: Build Configuration

Create a `build.js` file:

```javascript
// build.js
import { buildMFE } from '@mfe-toolkit/core';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/my-first-mfe.js',
  manifestPath: './manifest.json'
});
```

Create a `manifest.json`:

```json
{
  "name": "my-first-mfe",
  "version": "1.0.0",
  "dependencies": {
    "runtime": {},
    "peer": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0"
    }
  }
}
```

## Connecting MFEs with Services

### Available Services

MFE Toolkit provides these services out of the box:

```typescript
interface MFEServices {
  logger: LoggerService;
  eventBus: EventBusService;
  notification: NotificationService;
  modal: ModalService;
  auth?: AuthService;
  errorReporter?: ErrorReporter;
  stateManager?: StateManager;
}
```

### Using Services in Development

During standalone development with `@mfe-toolkit/dev`, mock services are automatically injected:

```typescript
const MyMFE: MFEModule = ({ logger, eventBus, notification }) => {
  return {
    mount: (element: HTMLElement) => {
      // All services work in dev mode!
      logger.info('Starting up');
      
      notification.show({
        title: 'Welcome!',
        type: 'success'
      });
      
      eventBus.emit('mfe:ready', { id: 'my-mfe' });
      
      return () => {
        logger.info('Cleaning up');
      };
    }
  };
};
```

## Inter-MFE Communication

### Event Bus Patterns

```typescript
// Publisher MFE
eventBus.emit('product:selected', {
  productId: '123',
  name: 'Widget',
  price: 29.99
});

// Subscriber MFE
const unsubscribe = eventBus.on('product:selected', (data) => {
  console.log(`Product selected: ${data.name}`);
  updateCartDisplay(data);
});

// Remember to clean up!
return () => {
  unsubscribe();
};
```

### Testing Events in Dev Mode

The dev tools Events tab lets you:
1. See all events being emitted
2. Emit test events to simulate other MFEs
3. Use preset events for common scenarios

## State Management

### Using the State Manager

```typescript
import { createStateManager } from '@mfe-toolkit/state';

// Create shared state
const stateManager = createStateManager({
  initialState: {
    user: null,
    cart: [],
    theme: 'light'
  }
});

// Update state
stateManager.setState({ user: { id: 1, name: 'John' } });

// Subscribe to changes
const unsubscribe = stateManager.subscribe((state) => {
  console.log('State changed:', state);
});
```

## Testing Your MFEs

### Testing in Standalone Mode

```bash
# Run your MFE in dev mode
pnpm dev

# Use the dev tools to:
# - Test different viewport sizes
# - Switch themes
# - Emit test events
# - Monitor console logs
# - Track metrics
```

### Unit Testing

```typescript
// my-mfe.test.ts
import { describe, it, expect, vi } from 'vitest';
import MyMFE from './main';

describe('MyMFE', () => {
  it('should mount correctly', () => {
    const mockServices = {
      logger: { info: vi.fn() },
      eventBus: { emit: vi.fn(), on: vi.fn(() => vi.fn()) }
    };
    
    const element = document.createElement('div');
    const mfe = MyMFE(mockServices);
    const unmount = mfe.mount(element);
    
    expect(mockServices.logger.info).toHaveBeenCalled();
    expect(element.innerHTML).not.toBe('');
    
    unmount();
  });
});
```

## Production Deployment

### Step 1: Build for Production

```bash
# Build your MFE
node build.js

# Output: dist/my-mfe.js
```

### Step 2: Deploy to CDN

```bash
# Upload to S3/CloudFront
aws s3 cp dist/ s3://my-bucket/mfes/my-mfe/1.0.0/ --recursive

# Or any static hosting
rsync -av dist/ server:/var/www/mfes/my-mfe/
```

### Step 3: Register in Container

Add to the container's MFE registry:

```json
{
  "mfes": [
    {
      "id": "my-mfe",
      "name": "My MFE",
      "url": "https://cdn.example.com/mfes/my-mfe/1.0.0/bundle.js",
      "manifest": "https://cdn.example.com/mfes/my-mfe/1.0.0/manifest.json"
    }
  ]
}
```

## Troubleshooting

### Common Issues

#### Dev Server Issues

```bash
# Port already in use
lsof -ti:3100 | xargs kill -9

# Or use a different port
mfe-dev --port 3200
```

#### Styles Not Loading

```javascript
// Check your mfe.config.mjs
export default {
  dev: {
    styles: [
      // Paths must be relative to MFE root
      './styles.css',
      '../../../packages/design-system/dist/styles.css'
    ]
  }
};
```

#### Events Not Working

```typescript
// In dev mode, check the Events tab
// Make sure event names match exactly
eventBus.emit('user:login');  // Publisher
eventBus.on('user:login', handler);  // Subscriber ✅
eventBus.on('user-login', handler);  // Wrong format ❌
```

### Debug Mode

Enable verbose logging:

```javascript
// mfe.config.mjs
export default {
  dev: {
    debug: true,  // Enables verbose logging
    showDevTools: true  // Auto-open dev tools
  }
};
```

## Next Steps

### 1. Explore Examples

- **Event Bus Trading Demo**: `apps/service-demos/event-bus/scenarios/trading/`
- **Modal Examples**: `apps/service-demos/modal/` (All frameworks)
- **Notification Examples**: `apps/service-demos/notifications/`

### 2. Advanced Features

- [State Management Patterns](./docs/architecture/state-management-architecture.md)
- [Build System Architecture](./docs/architecture/build-system-architecture.md)
- [Design System Integration](./docs/DESIGN_SYSTEM_GUIDE.md)

### 3. Join the Community

- [GitHub Discussions](https://github.com/maysam-tayyeb/mfe-toolkit/discussions)
- [Report Issues](https://github.com/maysam-tayyeb/mfe-toolkit/issues)
- [Contribute](./CONTRIBUTING.md)

## FAQ

### Q: Do I need a container to develop MFEs?

A: **No!** With `@mfe-toolkit/dev`, you can develop MFEs standalone. You only need the container for:
- Production deployment
- Integration testing with other MFEs
- Testing with real services

### Q: Can I use my own design system?

A: **Yes!** Simply configure it in `mfe.config.mjs`:
```javascript
export default {
  dev: {
    styles: ['./node_modules/@my-company/design-system/dist/styles.css']
  }
};
```

### Q: How do I test responsive behavior?

A: Use the Viewport tab in dev tools to test different screen sizes:
- Preset sizes (Mobile, Tablet, Desktop)
- Custom dimensions
- Auto-height mode for adaptive components

### Q: Can I develop multiple MFEs simultaneously?

A: **Yes!** Run each on different ports:
```bash
# Terminal 1
cd mfe-1 && mfe-dev --port 3100

# Terminal 2
cd mfe-2 && mfe-dev --port 3101
```

### Q: How do I simulate inter-MFE communication?

A: Use the Events tab in dev tools:
1. See events your MFE emits
2. Emit test events to simulate other MFEs
3. Use preset events for common scenarios

### Q: Do all MFEs need the same framework?

A: **No!** Mix React, Vue, Solid.js, and Vanilla JS freely. The event bus enables cross-framework communication.

### Q: What about TypeScript?

A: Full TypeScript support with complete type definitions:
```typescript
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';
```

### Q: How do I handle authentication?

A: In dev mode, mock auth is provided. In production, the container provides real auth:
```typescript
if (services.auth?.isAuthenticated()) {
  const user = services.auth.getUser();
}
```

---

## Summary

You've learned how to:
- ✅ **Start fast** with standalone development
- ✅ **Build MFEs** without a container
- ✅ **Use dev tools** for testing and debugging
- ✅ **Configure** your design system
- ✅ **Test** responsive behavior and themes
- ✅ **Deploy** to production

**Start with `@mfe-toolkit/dev` for rapid development, then integrate with the container for production!** 🚀