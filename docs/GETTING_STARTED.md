# Getting Started with MFE Toolkit - Complete Guide

This guide takes you from zero to a production-ready microfrontend application using MFE Toolkit.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Understanding the Architecture](#understanding-the-architecture)
3. [Setting Up a Container Application](#setting-up-a-container-application) - **Start Here! This is required before creating MFEs**
4. [Creating Your First MFE](#creating-your-first-mfe)
5. [Connecting MFEs with Services](#connecting-mfes-with-services)
6. [Inter-MFE Communication](#inter-mfe-communication)
7. [State Management](#state-management)
8. [Testing Your MFEs](#testing-your-mfes)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm/pnpm installed
- **Basic knowledge** of JavaScript/TypeScript
- **Familiarity** with ES modules and modern build tools
- **A code editor** (VS Code recommended)

## Understanding the Architecture

### Why You Need a Container First

**MFEs cannot run by themselves.** They are JavaScript modules that need a host application (container) to:

1. **Load and Mount Them**
   - MFEs export functions, not applications
   - They need a DOM element to render into
   - The container manages their lifecycle (mount/unmount)

2. **Provide Essential Services**
   - Logger for debugging
   - Event bus for communication
   - Modal and notification systems
   - Authentication state
   - Error handling

3. **Handle Application-Level Concerns**
   - Routing between MFEs
   - Overall layout and navigation
   - Shared state management
   - Cross-cutting concerns

### The Architecture Flow

```
┌─────────────────────────────────────┐
│         Container (Host App)         │ ← You need this first!
│  - Loads MFEs                        │
│  - Provides services                 │
│  - Manages routing                   │
└─────────────┬───────────────────────┘
              │
              │ Injects services & mounts
              ↓
┌─────────────────────────────────────┐
│            Your MFEs                 │ ← Then create these
│  - Receive services from container   │
│  - Mount into provided DOM element   │
│  - Communicate via event bus         │
└─────────────────────────────────────┘
```

> **🎯 Key Point:** Think of the container as the "operating system" and MFEs as "applications". You can't run apps without an OS!

## Setting Up a Container Application

> **🚨 Important:** This is a prerequisite! You MUST have a container running before you can develop MFEs.

### Quick Start: Use the Existing Container

The fastest way to get started is using the pre-built container:

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

The container includes:
- Service injection system
- MFE loader components
- Event bus for communication
- Modal and notification services
- Error boundaries
- Example MFEs already integrated

### Building Your Own Container

> **📚 Need a custom container?**  
> See our **[Complete Container Setup Guide](./CONTAINER_SETUP_GUIDE.md)** for step-by-step instructions.

**Minimum requirements for a container:**

1. **Service Creation**
   ```typescript
   const services = createMFEServices();  // Create once, share with all MFEs
   ```

2. **MFE Loading**
   ```tsx
   <MFELoader url="http://localhost:8080/my-mfe.js" services={services} />
   ```

3. **Error Handling**
   ```tsx
   <ErrorBoundary fallback={<ErrorUI />}>
     <MFELoader ... />
   </ErrorBoundary>
   ```

## Creating Your First MFE

> **✅ Prerequisite Check:** Is your container running at http://localhost:3000? If not, go back to the previous section!

### Step 1: Generate a New MFE

```bash
# Using npx (recommended - always uses latest version)
npx @mfe-toolkit/cli create my-first-mfe

# Or if you have it installed globally
mfe-toolkit create my-first-mfe

# Choose your framework:
# - React 19
# - Vue 3
# - Solid.js
# - Vanilla TypeScript
```

> **📁 Existing Examples in Repo:**
> - React: `apps/service-demos/modal/mfe-modal-react19/`
> - Vue 3: `apps/service-demos/modal/mfe-modal-vue3/`
> - Solid.js: `apps/service-demos/modal/mfe-modal-solidjs/`
> - Vanilla TS: `apps/service-demos/modal/mfe-modal-vanilla/`

### Step 2: Understand the MFE Structure

Your MFE should export a default function that returns mount/unmount methods.

> **📁 See Working Example:** `apps/service-demos/notifications/mfe-notification-vanilla/src/main.ts`

```typescript
// src/main.ts - Vanilla TypeScript example
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';

const MyFirstMFE: MFEModule = ({ logger, eventBus, notification }) => {
  return {
    mount: (element: HTMLElement) => {
      // Your MFE initialization logic
      logger.info('MyFirstMFE mounted');
      
      // Create your UI
      element.innerHTML = `
        <div class="my-mfe">
          <h2>My First MFE</h2>
          <button id="send-event">Send Event</button>
        </div>
      `;
      
      // Add event listeners
      const button = element.querySelector('#send-event');
      button?.addEventListener('click', () => {
        eventBus.emit('mfe:button-clicked', { 
          source: 'my-first-mfe',
          timestamp: Date.now() 
        });
        notification.show({
          title: 'Event Sent!',
          type: 'success'
        });
      });
      
      // Subscribe to events from other MFEs
      const unsubscribe = eventBus.on('app:theme-changed', (data) => {
        logger.info('Theme changed:', data);
      });
      
      // Return cleanup function
      return () => {
        unsubscribe();
        element.innerHTML = '';
        logger.info('MyFirstMFE unmounted');
      };
    }
  };
};

export default MyFirstMFE;
```

### Step 3: React MFE Example

> **📁 See Working Examples:**
> - React 19: `apps/service-demos/modal/mfe-modal-react19/src/main.tsx`
> - React 18: `apps/service-demos/modal/mfe-modal-react18/src/main.tsx`
> - React 17: `apps/service-demos/modal/mfe-modal-react17/src/main.tsx`

```tsx
// src/main.tsx - React example
import React from 'react';
import { createRoot } from 'react-dom/client';
import type { MFEModule } from '@mfe-toolkit/core';

const App: React.FC<{ services: any }> = ({ services }) => {
  const handleClick = () => {
    services.eventBus.emit('mfe:button-clicked', {
      source: 'react-mfe',
      timestamp: Date.now()
    });
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

### Step 4: Vue MFE Example

> **📁 See Working Example:** `apps/service-demos/modal/mfe-modal-vue3/src/main.ts`

```typescript
// src/main.ts - Vue 3 example
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
            services.eventBus.emit('mfe:button-clicked', {
              source: 'vue-mfe',
              timestamp: Date.now()
            });
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

### Step 5: Build Your MFE

> **📁 See Working Example:** `apps/service-demos/modal/mfe-modal-react19/build.js`

Create a `build.js` file in your MFE directory:

```javascript
// build.js
import { buildMFE } from '@mfe-toolkit/build';

await buildMFE({
  entry: 'src/main.tsx',
  outfile: 'dist/my-first-mfe.js',
  manifestPath: './manifest.json'
});
```

> **📁 See Working Example:** `apps/service-demos/modal/mfe-modal-react19/manifest.json`

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

Build the MFE:

```bash
node build.js
```

### Step 6: Register Your MFE

Add your MFE to the container's registry:

> **📁 See Working Example:** `apps/container-react/public/mfe-registry.json`

```json
{
  "mfes": [
    {
      "id": "my-first-mfe",
      "name": "My First MFE",
      "url": "http://localhost:8080/my-first-mfe.js",
      "manifest": "http://localhost:8080/my-first-mfe/manifest.json"
    }
  ]
}
```

### Step 7: Load Your MFE in the Container

Now use the RegistryMFELoader in any container page:

> **📁 See Working Example:** `apps/container-react/src/pages/services/ModalPage.tsx`

```tsx
import { RegistryMFELoader } from '@/components/RegistryMFELoader';

export const MyPage = () => {
  return (
    <div>
      <h1>My Page</h1>
      <RegistryMFELoader id="my-first-mfe" />
    </div>
  );
};
```

## Connecting MFEs with Services

### Available Services

> **📁 See Implementation:** `packages/mfe-toolkit-core/src/services/`

MFE Toolkit provides these services out of the box:

```typescript
interface MFEServices {
  logger: {
    debug: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, error?: Error) => void;
  };
  
  eventBus: {
    emit: (event: string, data?: any) => void;
    on: (event: string, handler: Function) => () => void;
    once: (event: string, handler: Function) => () => void;
    off: (event?: string) => void;
  };
  
  notification: {
    show: (config: {
      title: string;
      message?: string;
      type?: 'info' | 'success' | 'warning' | 'error';
      duration?: number;
    }) => void;
  };
  
  modal: {
    open: (config: {
      title: string;
      content: any;
      onConfirm?: () => void;
      onClose?: () => void;
    }) => void;
    close: () => void;
  };
  
  auth?: {
    getSession: () => AuthSession | null;
    isAuthenticated: () => boolean;
  };
}
```

### Using Services in Your MFE

> **📁 See Working Example:** `apps/service-demos/event-bus/mfe-event-playground/src/main.tsx`

```typescript
// Example: Using all services
const MyMFE: MFEModule = ({ logger, eventBus, notification, modal, auth }) => {
  return {
    mount: (element: HTMLElement) => {
      // Logging
      logger.info('MFE starting up');
      
      // Check authentication
      if (auth?.isAuthenticated()) {
        logger.info('User is authenticated');
      }
      
      // Show notification
      notification.show({
        title: 'Welcome!',
        type: 'success',
        duration: 3000
      });
      
      // Open modal
      modal.open({
        title: 'Confirm Action',
        content: 'Are you sure?',
        onConfirm: () => {
          logger.info('User confirmed');
          eventBus.emit('user:action-confirmed');
        }
      });
      
      // Listen for events
      const unsubscribe = eventBus.on('app:logout', () => {
        logger.info('User logged out, cleaning up...');
      });
      
      return () => {
        unsubscribe();
      };
    }
  };
};
```

## Inter-MFE Communication

### Event Bus Patterns

> **📁 See Working Examples:** 
> - Trading Demo: `apps/service-demos/event-bus/scenarios/trading/`
> - Event Playground: `apps/service-demos/event-bus/mfe-event-playground/`

```typescript
// MFE A: Publisher
eventBus.emit('product:selected', {
  productId: '123',
  name: 'Widget',
  price: 29.99
});

// MFE B: Subscriber
eventBus.on('product:selected', (data) => {
  console.log(`Product selected: ${data.name}`);
  updateCartDisplay(data);
});

// MFE C: One-time listener
eventBus.once('app:ready', () => {
  console.log('App is ready, initializing...');
});

// Wildcard listener (for debugging)
eventBus.on('*', (event) => {
  console.log('Event occurred:', event);
});
```

### Request-Response Pattern

```typescript
// MFE A: Request data
eventBus.emit('data:request', {
  requestId: 'req-123',
  type: 'user-profile'
});

// MFE B: Respond to request
eventBus.on('data:request', async (request) => {
  if (request.type === 'user-profile') {
    const data = await fetchUserProfile();
    eventBus.emit('data:response', {
      requestId: request.requestId,
      data
    });
  }
});

// MFE A: Handle response
eventBus.on('data:response', (response) => {
  if (response.requestId === 'req-123') {
    updateUI(response.data);
  }
});
```

## State Management

### Using Universal State Manager

> **📁 See Package:** `packages/mfe-toolkit-state/`
> - **Note:** State demo MFEs to be implemented

```typescript
import { createStateManager } from '@mfe-toolkit/state';

// Create a shared state manager
const stateManager = createStateManager({
  initialState: {
    user: null,
    cart: [],
    theme: 'light'
  }
});

// In MFE A: Update state
stateManager.setState({
  user: { id: 1, name: 'John' }
});

// In MFE B: Subscribe to state changes
const unsubscribe = stateManager.subscribe((state) => {
  console.log('User changed:', state.user);
});

// React hook usage
function MyComponent() {
  const user = stateManager.useSelector(state => state.user);
  
  return <div>Welcome, {user?.name}!</div>;
}

// Vue 3 usage
export default {
  setup() {
    const state = stateManager.useVueState();
    return { state };
  }
};
```

### Cross-Tab Synchronization

```typescript
const stateManager = createStateManager({
  crossTab: true, // Enable cross-tab sync
  persistent: true, // Persist to localStorage
  storageKey: 'app-state'
});

// State changes in one tab automatically sync to other tabs
```

## Testing Your MFEs

### Unit Testing

> **📁 See Test Examples:** 
> - Core tests: `packages/mfe-toolkit-core/src/services/event-bus.test.ts`
> - Container tests: `apps/container-react/src/services/__tests__/mfe-services.test.ts`

```typescript
// my-mfe.test.ts
import { describe, it, expect, vi } from 'vitest';
import MyMFE from './main';

describe('MyMFE', () => {
  it('should mount and unmount correctly', () => {
    const mockServices = {
      logger: {
        info: vi.fn(),
        error: vi.fn()
      },
      eventBus: {
        emit: vi.fn(),
        on: vi.fn(() => vi.fn())
      }
    };
    
    const element = document.createElement('div');
    const mfe = MyMFE(mockServices);
    
    const unmount = mfe.mount(element);
    expect(mockServices.logger.info).toHaveBeenCalledWith('MyFirstMFE mounted');
    expect(element.innerHTML).toContain('My First MFE');
    
    unmount();
    expect(element.innerHTML).toBe('');
  });
});
```

### Integration Testing

> **⚠️ Note:** Integration test examples to be implemented

```typescript
// integration.test.ts
import { createMFEServices } from '@mfe-toolkit/core';
import MyMFE from './my-mfe';
import AnotherMFE from './another-mfe';

describe('MFE Integration', () => {
  it('should communicate between MFEs', async () => {
    const services = createMFEServices();
    const element1 = document.createElement('div');
    const element2 = document.createElement('div');
    
    // Mount both MFEs
    const unmount1 = MyMFE(services).mount(element1);
    const unmount2 = AnotherMFE(services).mount(element2);
    
    // Simulate interaction
    const button = element1.querySelector('button');
    button?.click();
    
    // Wait for event propagation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if second MFE received the event
    expect(element2.textContent).toContain('Event received');
    
    // Cleanup
    unmount1();
    unmount2();
  });
});
```

## Production Deployment

### Step 1: Build for Production

```bash
# Build all packages
pnpm build

# Build specific MFE
cd apps/my-mfe
node build.js
```

### Step 2: Configure CDN URLs

Update your manifest for production:

```json
{
  "name": "my-mfe",
  "version": "1.0.0",
  "url": "https://cdn.example.com/mfes/my-mfe/1.0.0/bundle.js",
  "alternativeUrls": [
    "https://backup-cdn.example.com/mfes/my-mfe/1.0.0/bundle.js"
  ],
  "security": {
    "integrity": "sha384-...",
    "csp": {
      "script-src": ["'self'", "https://cdn.example.com"]
    }
  }
}
```

### Step 3: Deploy Container as Static Site

Since the container is a SPA, deploy it to any static hosting:

```bash
# Build the container app
pnpm build

# Deploy to Netlify
npx netlify deploy --prod --dir=dist

# Or Vercel
npx vercel --prod

# Or GitHub Pages
npx gh-pages -d dist

# Or AWS S3
aws s3 sync dist/ s3://your-bucket-name
```

### Step 4: Deploy MFEs to CDN

```bash
# Upload to S3/CloudFront
aws s3 cp dist/ s3://my-bucket/mfes/my-mfe/1.0.0/ --recursive
aws cloudfront create-invalidation --distribution-id ABCD --paths "/mfes/*"

# Or deploy all at once
pnpm build  # Builds everything
aws s3 sync dist/ s3://your-mfes-bucket/
```

### Step 5: CI/CD with GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy SPA and MFEs
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      
      # Deploy container to Netlify
      - run: |
          cd apps/container-react
          npx netlify deploy --prod --dir=dist
      
      # Deploy MFEs to CDN
      - run: aws s3 sync dist/ s3://${{ secrets.MFE_BUCKET }}/
```

### Step 6: Monitoring

> **📁 See Implementation:** `packages/mfe-toolkit-state-middleware-performance/`

```typescript
// Add performance monitoring
const stateManager = createStateManager({
  middleware: [
    createPerformanceMiddleware({
      onSlowUpdate: (metrics) => {
        // Send to analytics
        analytics.track('slow-state-update', metrics);
      }
    })
  ]
});

// Error tracking
window.addEventListener('error', (event) => {
  if (event.filename?.includes('/mfes/')) {
    errorReporter.reportError(event.error, {
      mfe: extractMFEName(event.filename),
      context: 'runtime-error'
    });
  }
});
```

## Troubleshooting

### Common Issues and Solutions

#### Container Not Running

```bash
# Check if container is running
curl http://localhost:3000
# If not, start it:
pnpm dev:container-react
```

#### MFE Not Loading

```typescript
// Check 1: Verify URL is accessible
fetch('http://localhost:8080/my-mfe.js')
  .then(res => console.log('Status:', res.status))
  .catch(err => console.error('Failed to load:', err));

// Check 2: Verify CORS headers
// Server should include:
// Access-Control-Allow-Origin: *
// Access-Control-Allow-Methods: GET, OPTIONS

// Check 3: Check console for errors
// Look for: Syntax errors, missing dependencies, etc.
```

#### Services Not Available

```typescript
// Ensure services are created before MFE loads
const services = createMFEServices(); // Do this once

// Pass same instance to all MFEs
<MFELoader services={services} /> // ✅ Correct
<MFELoader services={createMFEServices()} /> // ❌ Wrong - creates new instance
```

#### Events Not Received

```typescript
// Check 1: Event names match exactly
eventBus.emit('user:login'); // Publisher
eventBus.on('user:login', handler); // ✅ Matches
eventBus.on('user-login', handler); // ❌ Different format

// Check 2: Subscription timing
// Subscribe BEFORE emitting
const unsubscribe = eventBus.on('event', handler); // First
eventBus.emit('event', data); // Then emit

// Check 3: Memory leaks - always cleanup
return () => {
  unsubscribe(); // Don't forget this!
};
```

#### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Clear build cache
rm -rf dist .cache

# Check for version conflicts
pnpm why react  # Check which versions are installed
```

### Debug Mode

Enable debug logging:

```typescript
// In development
const services = createMFEServices({
  logger: {
    level: 'debug'
  },
  eventBus: {
    debug: true // Logs all events
  }
});

// Add debug UI
if (process.env.NODE_ENV === 'development') {
  window.__MFE_DEBUG__ = {
    services,
    registry: mfeRegistry,
    events: eventHistory
  };
}
```

## Next Steps

Now that you have a working MFE setup:

1. **Explore Advanced Features**
   - [State Management Patterns](./docs/architecture/state-management-architecture.md)
   - [Security Best Practices](./docs/guides/security.md)
   - [Performance Optimization](./docs/guides/performance.md)

2. **Check Out Examples**
   - [Trading Platform Demo](../apps/service-demos/event-bus/scenarios/trading/) - Cross-framework event communication
   - [Modal Service Demos](../apps/service-demos/modal/) - React, Vue, Solid.js, Vanilla examples
   - [Notification Demos](../apps/service-demos/notifications/) - Service usage examples
   - State Management Demos - **To be implemented**

3. **Join the Community**
   - [GitHub Discussions](https://github.com/maysam-tayyeb/mfe-toolkit/discussions)
   - [Report Issues](https://github.com/maysam-tayyeb/mfe-toolkit/issues)
   - [Contribute](./CONTRIBUTING.md)

## FAQ

### Q: Can I use MFE Toolkit with my existing application?

A: Yes! You can gradually adopt MFE Toolkit by:
1. Starting with one small feature as an MFE
2. Using your existing app as the container
3. Gradually extracting more features into MFEs

### Q: Do all MFEs need to use the same framework?

A: No! That's the beauty of MFE Toolkit. You can mix React, Vue, Solid.js, and Vanilla JS MFEs in the same application.

### Q: How do I handle authentication across MFEs?

A: The container provides an auth service that all MFEs can access:
```typescript
if (services.auth?.isAuthenticated()) {
  // User is logged in
  const session = services.auth.getSession();
}
```

### Q: Can I use my own state management solution?

A: Yes! MFE Toolkit's state management is optional. You can use Redux, MobX, Zustand, or any other solution. Just ensure you handle cross-MFE state sync if needed.

### Q: How do I style my MFEs?

A: You have complete freedom:
- Use any CSS framework (Tailwind, Bootstrap, etc.)
- CSS Modules for isolation
- CSS-in-JS solutions
- Your own design system

### Q: What about TypeScript support?

A: MFE Toolkit is TypeScript-first with full type definitions. All packages include TypeScript types out of the box.

### Q: How do I handle routing?

A: Each MFE can handle its own routes internally. The container typically handles top-level routing and delegates to MFEs:
```typescript
// Container routes
/dashboard/* → Dashboard MFE
/shop/*      → Shopping MFE
/profile/*   → Profile MFE
```

### Q: Do I need a container for development?

A: **Yes!** MFEs are modules that need a host. The container:
- Provides the services MFEs depend on
- Gives MFEs a place to mount
- Handles communication between MFEs
- Manages the application lifecycle

Without a container, MFEs cannot function.

---

## Summary

You've learned how to:
- ✅ Understand why a container is required
- ✅ Set up a container application first
- ✅ Create your first MFE
- ✅ Use services for communication
- ✅ Manage shared state
- ✅ Test your MFEs
- ✅ Deploy to production

**Remember: Container first, then MFEs!** 🚀