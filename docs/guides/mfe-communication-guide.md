# MFE Communication Guide

This guide demonstrates how to implement inter-MFE communication using the event bus system in the MFE platform.

> **🚀 New: Typed Event Bus**  
> The platform now supports a fully typed event system with compile-time type safety. See the [Typed Event Bus Migration Guide](./typed-event-bus-migration.md) for details on migrating to the typed API.

## 🎯 Overview

The MFE Communication Center provides a real-time testing environment for inter-MFE communication. It displays two MFEs side-by-side with a centralized event log, allowing you to observe and test event-based communication patterns.

## 🚀 Quick Start

1. **Start all applications:**

   ```bash
   pnpm dev
   ```

2. **Navigate to the MFE Communication Center:**
   - Open http://localhost:3000/mfe-communication
   - You'll see both MFEs loaded side-by-side with event controls

## 📡 Inter-MFE Communication Examples

### Example 1: Simple Message Exchange

**From Example MFE to React 17 MFE:**

1. In the Example MFE (left panel), enter:
   - **Event name:** `inter-mfe.message`
   - **Event data:**
   ```json
   {
     "from": "example",
     "to": "react17",
     "message": "Hello React 17!",
     "timestamp": "2024-01-20T10:30:00Z"
   }
   ```
2. Click "Send Event"
3. Observe the event appear in:
   - Example MFE Event Log (marked as "Sent")
   - React 17 MFE Event Log (marked as "Received")
   - Central Event Log (with direction indicators)

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

### Sending Events

```typescript
// Access the event bus from services
const { eventBus } = window.__MFE_SERVICES__;

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
useEffect(() => {
  const { eventBus } = window.__MFE_SERVICES__;

  // Listen for specific events
  const unsubscribe = eventBus.on('custom.event', (payload) => {
    console.log('Received event:', payload);

    // Check if this MFE is the target
    if (payload.data.to === 'your-mfe' || payload.data.to === 'all') {
      // Handle the event
      handleIncomingEvent(payload.data);
    }
  });

  // Cleanup on unmount
  return () => unsubscribe();
}, []);
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

## 📊 MFE Communication Center Features

### Event Bus Controls

- **Custom Event Publisher**: Send events with custom types and JSON payloads
- **Quick Actions**: Pre-configured buttons for common event types
- **Event Type Input**: Define custom event types
- **JSON Data Editor**: Format complex event payloads

### Real-time Event Log

- **Direction Indicators**: Visual distinction between sent (→ OUT) and received (← IN) events
- **Timestamp Tracking**: Precise timing for each event
- **Source Identification**: Track which MFE sent each event
- **Data Visualization**: Formatted JSON display of event payloads
- **Log Management**: Clear log functionality

### Communication Statistics

- **Total Events**: Count of all logged events
- **Events Sent**: Number of outgoing events
- **Events Received**: Number of incoming events
- **Active MFEs**: Current number of loaded MFEs

## 🎨 UI Components

### Event Log Entry Structure

```typescript
interface EventLogEntry {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  data: any;
  direction: 'sent' | 'received';
}
```

### Visual Indicators

- **Blue**: Outgoing events (sent from container)
- **Green**: Incoming events (received from MFEs)
- **Timestamps**: Locale-specific time formatting
- **JSON Formatting**: Pretty-printed data with syntax highlighting

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
   - Monitor the `__EVENT_BUS__` on window object
   - Check console logs for event activity

2. **Event Log Inspection**
   - Watch the central event log for all communications
   - Use the direction indicators to trace event flow
   - Check timestamps to debug timing issues

3. **Testing Patterns**
   - Start with simple ping-pong messages
   - Test broadcast events with multiple listeners
   - Verify cleanup by checking for memory leaks

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
import { throttle } from 'lodash';

const throttledEmit = throttle((eventType, data) => {
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

- [MFE Development Kit API](../packages/mfe-dev-kit/README.md)
- [Container Services](../apps/container/README.md)
- [Event Bus Implementation](../packages/mfe-dev-kit/src/services/event-bus.ts)
- [Typed Event Bus Migration Guide](./typed-event-bus-migration.md)

## 💡 Try It Yourself

1. Open the MFE Communication Center
2. Send a message from one MFE to another
3. Watch the event flow in real-time
4. Experiment with different event types and payloads
5. Build your own inter-MFE communication patterns!
