# @mfe-toolkit/service-event-bus

Event bus service for inter-MFE communication in MFE Toolkit.

## Installation

```bash
pnpm add @mfe-toolkit/service-event-bus
```

## Usage

### In MFEs (Type-only import - zero runtime cost)

```typescript
import type { EventBus } from '@mfe-toolkit/service-event-bus';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';

const module: MFEModule = {
  mount: async (element: HTMLElement, container: ServiceContainer) => {
    const eventBus = container.get('eventBus');
    
    // Subscribe to events
    const unsubscribe = eventBus.on('user:login', (event) => {
      console.log('User logged in:', event.data);
    });
    
    // Emit events
    eventBus.emit('mfe:ready', { name: 'my-mfe' });
    
    // Clean up on unmount
    return () => unsubscribe();
  },
  
  unmount: async () => {
    // Cleanup handled by returned function above
  }
};

export default module;
```

### In Container (Implementation import)

```typescript
import { createEventBus } from '@mfe-toolkit/service-event-bus';

// Create and register the service
const eventBus = createEventBus('container', {
  debug: true,
  maxHistorySize: 200
});

container.register('eventBus', eventBus);
```

### With Service Provider (Lazy initialization)

```typescript
import { eventBusServiceProvider } from '@mfe-toolkit/service-event-bus';

registry.registerProvider(eventBusServiceProvider);
```

## API

### EventBus Interface

```typescript
interface EventBus {
  // Emit events
  emit<T = any>(type: string, data?: T): void;
  emit<T = any>(event: EventPayload<T>): void;
  
  // Subscribe to events
  on<T = any>(type: string, handler: EventHandler<T>): () => void;
  once<T = any>(type: string, handler: EventHandler<T>): () => void;
  off<T = any>(type: string, handler: EventHandler<T>): void;
  
  // Manage listeners
  removeAllListeners(type?: string): void;
  listenerCount(type: string): number;
  getEventTypes(): string[];
  
  // Debugging features
  enableLogging(enabled: boolean): void;
  getEventHistory(limit?: number): EventPayload[];
  clearEventHistory(): void;
  enableValidation(enabled: boolean): void;
  getEventStats(): EventStats;
}
```

### EventPayload Structure

```typescript
interface EventPayload<T = any> {
  type: string;          // Event type/name
  data?: T;             // Event data
  timestamp: number;     // When the event was emitted
  source: string;        // Source of the event (MFE name, container, etc.)
  metadata?: Record<string, unknown>;  // Additional metadata
}
```

### Configuration

```typescript
interface EventBusConfig {
  debug?: boolean;              // Enable debug logging
  maxHistorySize?: number;      // Max events to keep in history
  enableValidation?: boolean;   // Enable event validation
  logger?: Logger;              // Custom logger instance
}
```

## Common Event Patterns

### MFE Lifecycle Events

```typescript
// MFE loaded
eventBus.emit('mfe:loaded', { 
  name: 'shopping-cart',
  version: '1.0.0'
});

// MFE ready
eventBus.emit('mfe:ready', {
  name: 'shopping-cart',
  capabilities: ['cart', 'checkout']
});

// MFE error
eventBus.emit('mfe:error', {
  name: 'shopping-cart',
  error: 'Failed to load',
  stack: error.stack
});
```

### User Events

```typescript
// User login
eventBus.emit('user:login', {
  userId: '123',
  username: 'john.doe',
  roles: ['user', 'admin']
});

// User logout
eventBus.emit('user:logout', {
  userId: '123',
  reason: 'Session expired'
});
```

### Navigation Events

```typescript
// Navigation change
eventBus.emit('navigation:change', {
  from: '/home',
  to: '/products',
  method: 'push'
});
```

## Debugging

### Enable Logging

```typescript
eventBus.enableLogging(true);
// All events will be logged to console
```

### Event History

```typescript
// Get last 10 events
const history = eventBus.getEventHistory(10);

// Clear history
eventBus.clearEventHistory();
```

### Event Statistics

```typescript
const stats = eventBus.getEventStats();
console.log('Total events emitted:', stats.totalEmitted);
console.log('Event counts by type:', stats.eventCounts);
```

## Module Augmentation

This package extends the `ServiceMap` interface from `@mfe-toolkit/core`:

```typescript
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    eventBus: EventBus;
  }
}
```

## Development

```bash
# Build the package
pnpm build

# Run tests
pnpm test

# Watch mode
pnpm build:watch
pnpm test:watch
```

## License

MIT