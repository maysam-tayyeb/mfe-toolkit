# Typed Event Bus Migration Guide

## Overview

The MFE platform now includes a fully typed event bus system that provides compile-time type safety, better developer experience, and prevents runtime errors. This guide will help you migrate from the untyped event bus to the new typed system.

## Benefits of Typed Events

- **Compile-time type safety**: Catch event data mismatches during development
- **Better IntelliSense**: Auto-completion for event types and data
- **Self-documenting**: Event schemas serve as documentation
- **Refactoring safety**: Renaming events or changing data structures is safer
- **Runtime validation**: Optional schema validation for events

## Quick Start

The event bus now uses the typed implementation by default:

```typescript
import { createEventBus } from '@mfe/dev-kit';

// Creates a typed event bus with migration support
const eventBus = createEventBus();

// You can still use it with the legacy API
eventBus.emit('user:login', { userId: '123' });

// Or access the typed API directly
eventBus.typed.emit('user:login', {
  userId: '123',
  username: 'john',
  roles: ['user'],
});
```

## Standard MFE Events

The platform provides a standard set of typed events:

```typescript
import type { MFEEventMap } from '@mfe/dev-kit';

// Lifecycle Events
('mfe:loaded'); // MFE has been loaded
('mfe:unloaded'); // MFE has been unloaded
('mfe:error'); // MFE encountered an error
('mfe:ready'); // MFE is ready for interaction

// Navigation Events
('navigation:change'); // Route has changed
('navigation:request'); // Request to navigate

// User Events
('user:login'); // User logged in
('user:logout'); // User logged out
('user:action'); // User performed an action

// State Sync Events
('state:sync'); // State synchronization
('state:request'); // Request state data
('state:response'); // Response with state data

// Communication Events
('broadcast:message'); // Broadcast to MFEs
('request:data'); // Request data from MFE
('response:data'); // Response with data
```

## Migration Steps

### Step 1: Use Typed Event Bus (Automatic)

The event bus now defaults to the typed implementation with backward compatibility:

```typescript
// No changes needed - this now returns a typed event bus
const eventBus = createEventBus();
```

### Step 2: Gradually Adopt Typed API

You can migrate incrementally by accessing the typed API:

```typescript
// Legacy usage (still works)
eventBus.emit('user:login', { userId: '123' });

// Typed usage (recommended)
eventBus.typed.emit('user:login', {
  userId: '123',
  username: 'john',
  roles: ['user'],
});
```

### Step 3: Update Event Handlers

Migrate handlers to use typed events:

```typescript
// Before
eventBus.on('user:login', (payload) => {
  console.log(payload.data.userId); // No type safety
});

// After
eventBus.typed.on('user:login', (event) => {
  console.log(event.data.userId); // ✅ Type safe
  console.log(event.data.username); // ✅ Type safe
  console.log(event.data.roles); // ✅ Type safe
});
```

### Step 4: Create Custom Event Maps

For application-specific events, create your own event map:

```typescript
// types/app-events.ts
import type { MFEEventMap } from '@mfe/dev-kit';

export type AppEventMap = MFEEventMap & {
  // Add your custom events
  'product:selected': {
    productId: string;
    name: string;
    price: number;
  };
  'cart:updated': {
    items: Array<{ id: string; quantity: number }>;
    total: number;
  };
  'order:placed': {
    orderId: string;
    items: string[];
    totalAmount: number;
  };
};
```

Then use it:

```typescript
import { createCustomEventBus } from '@mfe/dev-kit';
import type { AppEventMap } from './types/app-events';

const eventBus = createCustomEventBus<AppEventMap>();

// Now you get type safety for both standard and custom events
eventBus.emit('product:selected', {
  productId: '123',
  name: 'Widget',
  price: 29.99,
});
```

## Advanced Features

### Event Validation

Add runtime validation for critical events:

```typescript
import { createTypedEventBus } from '@mfe/dev-kit';
import type { EventSchema, MFEEventMap } from '@mfe/dev-kit';

const schema: EventSchema<MFEEventMap> = {
  'user:login': (data): data is MFEEventMap['user:login'] => {
    return (
      typeof data === 'object' &&
      typeof data.userId === 'string' &&
      typeof data.username === 'string' &&
      Array.isArray(data.roles)
    );
  },
};

const eventBus = createTypedEventBus({
  schema,
  onError: (error, event) => {
    console.error('Event validation failed:', error, event);
  },
});
```

### Event Interceptors

Add middleware for logging, analytics, or transformation:

```typescript
const eventBus = createTypedEventBus({
  interceptors: [
    {
      beforeEmit: (event) => {
        console.log('Event emitted:', event);
        // Transform or cancel event by returning null
        return event;
      },
      afterHandle: (event, handler, error) => {
        if (error) {
          console.error('Handler error:', error);
        }
      },
    },
  ],
});
```

### Waiting for Events

Use async/await patterns:

```typescript
// Wait for an event with timeout
const loginEvent = await eventBus.typed.waitFor('user:login', {
  timeout: 5000,
  filter: (event) => event.data.userId === '123',
});

// Use in async flows
async function waitForMFEReady(mfeName: string) {
  const event = await eventBus.typed.waitFor('mfe:ready', {
    filter: (e) => e.data.name === mfeName,
    timeout: 10000,
  });
  return event.data.capabilities;
}
```

### Event Statistics

Monitor event bus usage:

```typescript
const stats = eventBus.typed.getStats();
console.log('Total events:', stats.totalEvents);
console.log('Event counts:', stats.eventCounts);
console.log('Handler counts:', stats.handlerCounts);
```

## Best Practices

1. **Use namespaced events**: Follow the `namespace:action` pattern (e.g., `user:login`, `cart:updated`)

2. **Keep event data minimal**: Only include necessary data to reduce coupling

3. **Document custom events**: Add JSDoc comments to your event map types

4. **Use correlation IDs**: For tracking related events across MFEs

5. **Handle errors gracefully**: Always add error handling for event handlers

## Common Patterns

### Request-Response Pattern

```typescript
// Request side
const requestId = crypto.randomUUID();
eventBus.typed.emit('request:data', {
  from: 'mfe-a',
  to: 'mfe-b',
  requestId,
  query: { type: 'user-info' },
});

// Wait for response
const response = await eventBus.typed.waitFor('response:data', {
  filter: (e) => e.data.requestId === requestId,
  timeout: 3000,
});

// Response side
eventBus.typed.on('request:data', (event) => {
  if (event.data.to === 'mfe-b') {
    // Process request and send response
    eventBus.typed.emit('response:data', {
      from: 'mfe-b',
      to: event.data.from,
      requestId: event.data.requestId,
      data: { name: 'John Doe', email: 'john@example.com' },
    });
  }
});
```

### State Synchronization

```typescript
// Broadcast state changes
eventBus.typed.emit('state:sync', {
  from: 'mfe-cart',
  state: { items: [], total: 0 },
  partial: false,
});

// Listen for state changes
eventBus.typed.on('state:sync', (event) => {
  if (event.data.from === 'mfe-cart') {
    updateLocalState(event.data.state);
  }
});
```

## Troubleshooting

### TypeScript Errors

If you get TypeScript errors when using typed events:

1. Ensure you're importing types correctly:

   ```typescript
   import type { MFEEventMap } from '@mfe/dev-kit';
   ```

2. Check that event data matches the schema:

   ```typescript
   // ❌ Wrong - missing required fields
   eventBus.typed.emit('user:login', { userId: '123' });

   // ✅ Correct - all required fields
   eventBus.typed.emit('user:login', {
     userId: '123',
     username: 'john',
     roles: ['user'],
   });
   ```

### Legacy Code Compatibility

The migration adapter ensures backward compatibility:

```typescript
// Both work with the same event bus
legacyModule.setEventBus(eventBus); // Uses EventBus interface
newModule.setEventBus(eventBus.typed); // Uses TypedEventBus interface
```

### Performance Considerations

The typed event bus has minimal overhead:

- Type checking is compile-time only
- Runtime validation is optional
- Event statistics can be disabled in production

## Summary

The typed event bus provides significant benefits with minimal migration effort. Start by using the default typed implementation, then gradually migrate your event handlers and emissions to use the typed API for better type safety and developer experience.

For more examples, check out the example MFEs in the repository that demonstrate typed event usage.
