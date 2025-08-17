# @mfe-toolkit/core [WIP]

> **⚠️ Work in Progress**: This package is under active development and not yet ready for production use. APIs may change without notice.

Framework-agnostic core toolkit for building and managing microfrontends.

## Features

- 🔧 **Service Container Pattern** - Dependency injection for MFE services
- 📨 **Event Bus System** - Both legacy and typed event bus for inter-MFE communication
- 🚨 **Error Handling** - Comprehensive error boundaries and reporting
- 📦 **MFE Module Interface** - Standard interface for MFE modules
- 📋 **Manifest System** - Validation and migration tools for MFE configurations
- 🔍 **Developer Tools** - Logging, debugging, and CLI utilities
- 🎯 **TypeScript First** - Full type safety and IntelliSense support
- 🌐 **Framework Agnostic** - Works with React, Vue, Angular, or Vanilla JS

## Installation

```bash
npm install @mfe-toolkit/core
# or
yarn add @mfe-toolkit/core
# or
pnpm add @mfe-toolkit/core
```

## Quick Start

### 1. Define Your MFE Module

```typescript
import type { MFEModule, MFEServices } from '@mfe-toolkit/core';

const MyMFE: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    // Your MFE implementation
    const { logger, eventBus, notification } = services;

    logger.info('MFE mounted');

    // Implement your MFE logic here
    element.innerHTML = '<div>My MFE Content</div>';

    // Subscribe to events
    const unsubscribe = eventBus.on('user:action', (data) => {
      logger.info('Received event:', data);
    });

    // Return unmount function
    return () => {
      unsubscribe();
      element.innerHTML = '';
      logger.info('MFE unmounted');
    };
  },
};

export default MyMFE;
```

### 2. Use the Event Bus

```typescript
import { createTypedEventBus } from '@mfe-toolkit/core';

// Define your events
type AppEvents = {
  'user:login': { userId: string; timestamp: Date };
  'cart:update': { items: number; total: number };
};

// Create typed event bus
const eventBus = createTypedEventBus<AppEvents>();

// Subscribe to events
eventBus.on('user:login', (data) => {
  console.log(`User ${data.userId} logged in at ${data.timestamp}`);
});

// Emit events
eventBus.emit('user:login', {
  userId: '123',
  timestamp: new Date(),
});
```

## Core APIs

### Services

#### Logger Service

```typescript
import { createLogger } from '@mfe-toolkit/core';

const logger = createLogger('my-mfe');
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', new Error('Something went wrong'));
```

#### Error Reporter

```typescript
import { getErrorReporter } from '@mfe-toolkit/core';

const errorReporter = getErrorReporter();
errorReporter.reportError(error, {
  context: 'user-action',
  userId: '123',
  metadata: { action: 'checkout' },
});
```

### Components

#### MFE Error Boundary

```tsx
import { MFEErrorBoundary } from '@mfe-toolkit/core';

<MFEErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error, errorInfo) => {
    console.error('MFE Error:', error, errorInfo);
  }}
>
  <YourMFEComponent />
</MFEErrorBoundary>;
```

### CLI Tools

Generate MFE manifests:

```bash
npx mfe-manifest generate
```

## MFE Manifest

Define your MFE configuration:

```json
{
  "id": "my-mfe",
  "name": "My Microfrontend",
  "version": "1.0.0",
  "url": "http://localhost:8080/my-mfe.js",
  "metadata": {
    "team": "frontend-team",
    "contact": "team@example.com"
  },
  "routes": ["/my-feature/*"],
  "dependencies": {
    "react": "^18.0.0"
  }
}
```

## Advanced Usage

### Custom Event Bus

```typescript
import { createCustomEventBus } from '@mfe-toolkit/core';

const eventBus = createCustomEventBus({
  maxListeners: 100,
  enableLogging: true,
  logPrefix: '[CustomBus]',
  interceptors: [
    (eventName, data) => {
      console.log(`Event intercepted: ${eventName}`, data);
      return data; // Can modify data here
    },
  ],
});
```

### State Management

```typescript
import { createMFEStore } from '@mfe-toolkit/core';

const store = createMFEStore({
  initialState: { count: 0 },
  actions: {
    increment: (state) => ({ count: state.count + 1 }),
    decrement: (state) => ({ count: state.count - 1 }),
  },
});
```

## Migration from v0.x to v1.0

See our [Migration Guide](https://github.com/yourusername/mfe-made-easy/blob/main/docs/MIGRATION.md) for detailed upgrade instructions.

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/yourusername/mfe-made-easy/blob/main/CONTRIBUTING.md) for details.

## License

MIT © [Your Name]

## Support

- 📚 [Documentation](https://github.com/yourusername/mfe-made-easy/tree/main/docs)
- 💬 [Discussions](https://github.com/yourusername/mfe-made-easy/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/mfe-made-easy/issues)
