# MFE Communication Guide

This guide demonstrates how to implement inter-MFE communication using the event bus system in the MFE Toolkit platform.

> **🚀 Typed Event Bus Support**  
> The platform includes a fully typed event system with compile-time type safety. See the [Typed Event Bus Migration Guide](./typed-event-bus-migration.md) for details on using the typed API.

## 🎯 Overview

The MFE Toolkit provides comprehensive inter-MFE communication capabilities through an event bus system. The platform includes demonstration pages that showcase real-time communication between MFEs, including a trading platform scenario with market data, trading terminals, and analytics engines.

## 🚀 Quick Start

1. **Install dependencies and build:**

   ```bash
   pnpm install
   pnpm build
   ```

2. **Start the development environment:**

   ```bash
   # In terminal 1: Start the container app
   pnpm dev:container-react
   
   # In terminal 2: Serve the MFEs
   pnpm serve
   ```

3. **Explore communication demos:**
   - **Event Bus Demo**: http://localhost:3000/services/event-bus
   - **Trading Platform**: View the integrated trading scenario with real-time market data
   - **Service Demos**: Test modal and notification services across frameworks

## 📡 Inter-MFE Communication Examples

### Example 1: Trading Platform Communication

**Real-time market data synchronization:**

The trading platform demo showcases cross-framework communication:

1. **Market Watch MFE (React)** broadcasts price updates:
   ```json
   {
     "event": "market.price-update",
     "data": {
       "symbol": "AAPL",
       "price": 150.25,
       "change": 2.5,
       "timestamp": "2024-01-20T10:30:00Z"
     }
   }
   ```

2. **Trading Terminal (Vue 3)** receives updates and displays:
   - Real-time price changes
   - Order book updates
   - Trading opportunities

3. **Analytics Engine (Vanilla TS)** processes data:
   - Calculates metrics
   - Detects patterns
   - Broadcasts analytics events

### Example 2: Data Synchronization

**Broadcast data updates to all MFEs:**

1. From the container's Event Bus Controls:
   - **Event Type:** `data.updated`
   - **Event Data:**
   ```json
   {
     "entity": "user",
     "id": "123",
     "changes": {
       "name": "John Doe",
       "email": "john@example.com"
     },
     "version": 2
   }
   ```
2. Click "Publish Event"
3. Both MFEs will receive the update simultaneously

### Example 3: User Action Coordination

**Coordinate user actions across MFEs:**

```javascript
// In Example MFE
eventBus.emit('user.action', {
  action: 'item.selected',
  itemId: '456',
  source: 'example',
  data: {
    title: 'Product ABC',
    price: 99.99,
  },
});

// React 17 MFE listens and responds
eventBus.on('user.action', (payload) => {
  if (payload.data.action === 'item.selected') {
    // Update local state or UI
    updateSelectedItem(payload.data.data);
  }
});
```

### Example 4: Request-Response Pattern

**Implement request-response communication:**

1. **Request from Example MFE:**

   ```json
   {
     "type": "request",
     "id": "req-123",
     "action": "get-user-preferences",
     "from": "example",
     "to": "react17"
   }
   ```

2. **Response from React 17 MFE:**
   ```json
   {
     "type": "response",
     "id": "req-123",
     "from": "react17",
     "to": "example",
     "data": {
       "theme": "dark",
       "language": "en",
       "notifications": true
     }
   }
   ```

## 🔧 Implementation in Your MFE

### Basic Setup

```typescript
import type { MFEServices } from '@mfe-toolkit/core';

export default function createMFE(services: MFEServices) {
  const { eventBus, logger, modal, notification } = services;
  
  return {
    mount(element: HTMLElement) {
      // Your MFE implementation
      logger.info('MFE mounted');
      
      // Subscribe to events
      const unsubscribe = eventBus.on('custom.event', (event) => {
        logger.debug('Received event:', event);
      });
      
      // Return cleanup function
      return () => {
        unsubscribe();
      };
    },
    unmount() {
      logger.info('MFE unmounting');
    }
  };
}
```

### Sending Events

```typescript
// Send a targeted message
eventBus.emit('custom.event', {
  from: 'your-mfe',
  to: 'target-mfe',
  action: 'update',
  data: {
    /* your data */
  },
});

// Broadcast to all MFEs
eventBus.emit('broadcast.event', {
  from: 'your-mfe',
  to: 'all',
  message: 'Global update',
});
```

### Receiving Events

```typescript
// React Component Example
import { useEffect } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

function MyComponent({ services }: { services: MFEServices }) {
  const { eventBus, logger } = services;
  
  useEffect(() => {
    const unsubscribe = eventBus.on('custom.event', (event) => {
      logger.debug('Received event:', event);
      
      // Check if this MFE is the target
      if (event.data?.to === 'your-mfe' || event.data?.to === 'all') {
        // Handle the event
        handleIncomingEvent(event.data);
      }
    });

    return () => unsubscribe();
  }, [eventBus, logger]);
  
  return <div>Your component UI</div>;
}

// Vue 3 Composition API Example
import { onMounted, onUnmounted } from 'vue';

export default {
  setup(props: { services: MFEServices }) {
    const { eventBus, logger } = props.services;
    let unsubscribe: (() => void) | null = null;
    
    onMounted(() => {
      unsubscribe = eventBus.on('custom.event', (event) => {
        logger.debug('Vue received:', event);
        // Handle event
      });
    });
    
    onUnmounted(() => {
      unsubscribe?.();
    });
  }
};
```

### Event Types Reference

The platform supports these standard event types:

| Event Type          | Purpose                   | Example Usage                     |
| ------------------- | ------------------------- | --------------------------------- |
| `mfe.loaded`        | MFE successfully loaded   | Notify other MFEs of availability |
| `mfe.unloaded`      | MFE is unmounting         | Cleanup shared resources          |
| `inter-mfe.message` | Direct MFE communication  | Send targeted messages            |
| `user.action`       | User interaction events   | Coordinate UI state               |
| `data.updated`      | Data change notifications | Sync shared data                  |
| `auth.changed`      | Authentication updates    | Update permissions                |
| `custom.*`          | Custom application events | App-specific needs                |

## 📊 Platform Features

### Event Bus Demo Page

The Event Bus demo (`/services/event-bus`) provides:

- **Live Trading Scenario**: Market Watch, Trading Terminal, and Analytics Engine
- **Interactive Event Playground**: Solid.js-based tool for testing events
- **Real-time Event Log**: Monitor all events with timestamps and data
- **Event Controls**: Send custom events with JSON payloads
- **Framework Showcase**: See React, Vue 3, Solid.js, and Vanilla TS working together

### Service Integration

All MFEs receive these services at mount time:

- **Logger Service**: Centralized logging with levels
- **Event Bus**: Pub/sub communication system
- **Modal Service**: Cross-framework modal management
- **Notification Service**: Toast notifications
- **Auth Service**: Authentication state management
- **Error Reporter**: Error tracking and reporting

## 🎨 Design System Integration

The platform uses a CSS-first design system with 500+ utility classes:

### Event UI Components

```typescript
// Event display with design system classes
<div className="ds-card ds-p-4">
  <div className="ds-flex ds-justify-between ds-items-center">
    <span className="ds-badge ds-badge-info">Event Type</span>
    <span className="ds-text-sm ds-text-muted">10:30:25</span>
  </div>
  <pre className="ds-code-block ds-mt-2">
    {JSON.stringify(eventData, null, 2)}
  </pre>
</div>
```

### Visual Indicators

- **Event Types**: Color-coded badges for different event categories
- **Timestamps**: Formatted with `ds-text-muted` for subtle display
- **Data Display**: `ds-code-block` for JSON formatting
- **Status**: `ds-badge-success`, `ds-badge-warning`, `ds-badge-danger`

## 🚦 Best Practices

1. **Event Naming Convention**
   - Use dot notation: `domain.action`
   - Examples: `user.login`, `cart.updated`, `mfe.ready`

2. **Payload Structure**
   - Always include `from` field
   - Include `to` field for targeted messages
   - Add `timestamp` for event ordering
   - Keep payloads lightweight

3. **Error Handling**

   ```typescript
   try {
     const data = JSON.parse(eventData);
     eventBus.emit(eventType, data);
   } catch (error) {
     console.error('Invalid event data:', error);
   }
   ```

4. **Memory Management**
   - Always unsubscribe from events on component unmount
   - Limit event log size (e.g., keep last 50 events)
   - Clear unused event listeners

## 🔍 Debugging Tips

1. **Use Browser DevTools**
   - Check the container's service container for event bus instance
   - Monitor console logs with logger service output
   - Use React/Vue DevTools to inspect MFE state

2. **Event Log Inspection**
   - Visit `/services/event-bus` for the interactive demo
   - Use the Event Playground MFE to test custom events
   - Monitor real-time event flow between MFEs

3. **Testing Patterns**
   - Start with the trading platform demo
   - Test cross-framework communication
   - Verify service injection and cleanup

## 📚 Advanced Patterns

### Event Aggregation

```typescript
// Collect responses from multiple MFEs
const responses = new Map();
const requestId = 'req-' + Date.now();

eventBus.emit('survey.request', {
  id: requestId,
  question: 'Are you ready?',
});

eventBus.on('survey.response', (payload) => {
  if (payload.data.requestId === requestId) {
    responses.set(payload.source, payload.data.answer);
  }
});
```

### Event Throttling

```typescript
import { throttle } from '@mfe-toolkit/core';

const throttledEmit = throttle((eventType: string, data: unknown) => {
  eventBus.emit(eventType, data);
}, 100);

// Use for high-frequency events
window.addEventListener('scroll', () => {
  throttledEmit('ui.scroll', { position: window.scrollY });
});
```

### State Synchronization

```typescript
// Sync state changes across MFEs
const syncState = (state) => {
  eventBus.emit('state.sync', {
    from: 'mfe-name',
    state: state,
    version: Date.now(),
  });
};

// Listen for state updates
eventBus.on('state.sync', (payload) => {
  if (payload.source !== 'mfe-name') {
    updateLocalState(payload.data.state);
  }
});
```

## 🚀 Using the Typed Event Bus

The platform now includes a fully typed event bus that provides compile-time type safety and better developer experience. Here's how to use it:

### Define Your Event Types

```typescript
// types/events.ts
import type { EventMap } from '@mfe-toolkit/core';

export type MyMFEEventMap = EventMap & {
  'inter-mfe.message': {
    from: string;
    to: string;
    message: string;
    timestamp: string;
  };
  'user.action': {
    action: string;
    itemId: string;
    source: string;
    data: unknown;
  };
  'data.updated': {
    entity: string;
    id: string;
    changes: Record<string, unknown>;
    version: number;
  };
};
```

### Use Typed Event Bus

```typescript
import { createTypedEventBus } from '@mfe-toolkit/core';
import type { MyMFEEventMap } from './types/events';

// Create typed event bus
const eventBus = createTypedEventBus<MyMFEEventMap>({
  source: 'my-mfe',
});

// Emit with full type safety
eventBus.emit('inter-mfe.message', {
  from: 'example',
  to: 'react17',
  message: 'Hello!',
  timestamp: new Date().toISOString(),
}); // TypeScript ensures all fields are correct!

// Subscribe with typed handlers
eventBus.on('user.action', (event) => {
  // event.data is fully typed
  console.log(event.data.action); // Auto-completion works!
  console.log(event.data.itemId);
});

// Wait for events asynchronously
const response = await eventBus.waitFor('data.updated', {
  timeout: 5000,
  filter: (event) => event.data.entity === 'user',
});
```

### Benefits of Typed Events

1. **Compile-time Safety**: Catch typos and type mismatches before runtime
2. **Auto-completion**: IntelliSense for event names and data structures
3. **Refactoring Support**: Rename events across your codebase safely
4. **Better Documentation**: Types serve as living documentation

For a complete migration guide, see [Typed Event Bus Migration Guide](./typed-event-bus-migration.md).

## 🔗 Related Documentation

- [MFE Toolkit Core API](../packages/mfe-toolkit-core/README.md)
- [MFE Toolkit React Components](../packages/mfe-toolkit-react/README.md)
- [MFE Toolkit CLI](../packages/mfe-toolkit-cli/README.md)
- [State Management Architecture](../architecture/state-management-architecture.md)
- [Typed Event Bus Migration Guide](./typed-event-bus-migration.md)
- [Design System Documentation](../packages/design-system/README.md)

## 💡 Try It Yourself

1. Start the development environment with `pnpm dev:container-react` and `pnpm serve`
2. Visit http://localhost:3000/services/event-bus
3. Watch the trading platform demo with live market data
4. Use the Event Playground to send custom events
5. Experiment with cross-framework communication
6. Build your own inter-MFE communication patterns!
