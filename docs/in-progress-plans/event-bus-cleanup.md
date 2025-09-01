# Event Bus Service Cleanup Plan

> **Created**: January 2025  
> **Status**: ✅ COMPLETE - All phases implemented and migrated  
> **Related**: Phase 7 of Service Architecture Refactoring

## Executive Summary

Following Phase 6 where we unified the event systems, this cleanup plan aims to simplify the EventBus API, remove duplication, and provide clear migration paths from legacy to typed events. The goal is to create a single, clean API that leverages the full power of our type-safe event system while maintaining backward compatibility.

## ✅ Implementation Complete

Phase 7 implementation is fully complete and migrated to production with the following achievements:

### Delivered Features
1. **Event Factory Functions** (`domain/events.ts`):
   - ✅ Added `Events` object with factory functions for all MFE event types
   - ✅ Type-safe event creation with proper structure

2. **Event Type Constants** (`domain/events.ts`):
   - ✅ Added `MFEEvents` constants for IntelliSense support
   - ✅ Enables type-safe event names without string literals

3. **Simplified EventBus Interface** (`services/types/event-bus.ts`):
   - ✅ Single set of methods with intelligent overloads
   - ✅ Supports typed events, legacy strings, and BaseEvent objects
   - ✅ Full backward compatibility maintained
   - ✅ Removed all v2/simplified naming - single clean interface

4. **Enhanced Implementation** (`services/implementations/base/event-bus/simple-event-bus.ts`):
   - ✅ Unified internal format using BaseEvent
   - ✅ Built-in debugging features (logging, history, stats)
   - ✅ Event validation in development mode
   - ✅ Performance tracking
   - ✅ EventFlowDebugger for development

5. **Comprehensive Tests**:
   - ✅ 24 tests covering all functionality
   - ✅ Type safety verification
   - ✅ Debugging features validation
   - ✅ All 87 package tests passing

### Migration Completed
- ✅ Replaced old EventBus interface with simplified version
- ✅ Replaced SimpleEventBus implementation with v2
- ✅ Updated all imports and exports
- ✅ Consolidated test files
- ✅ Removed all v2/simplified file variants
- ✅ Clean single implementation without naming confusion

## Current State Analysis

### Problems Identified

1. **Dual API Confusion**:
   - Legacy methods: `emit()`, `on()`, `once()`, `off()`
   - Typed methods: `emitEvent()`, `onEvent()`, `onceEvent()`, `offEvent()`
   - Developers uncertain which to use

2. **Deprecated but Widely Used**:
   - `EventPayload` marked deprecated but still used throughout codebase
   - No clear migration examples or utilities
   - Examples still use legacy methods

3. **Implementation Complexity**:
   - SimpleEventBus handles both formats with complex branching
   - Type conversions scattered throughout
   - Difficult to maintain and extend

4. **Underutilized Type System**:
   - Rich `MFEEventMap` defined but rarely used
   - No IntelliSense for event names
   - Type safety benefits not realized

5. **Missing Developer Tools**:
   - No event debugging/logging
   - No validation in development
   - No visualization of event flow

## Proposed Solution

### Design Principles

1. **Single API Surface**: One set of methods that handle both formats intelligently
2. **Type-Safe by Default**: Leverage TypeScript for compile-time safety
3. **Progressive Enhancement**: Legacy code works, new code gets benefits
4. **Developer Experience**: IntelliSense, validation, debugging tools
5. **Zero Breaking Changes**: All existing code continues to work

## Implementation Phases

### Phase 1: Unified Interface Design

#### 1.1 Simplified EventBus Interface

```typescript
interface EventBus {
  // Single emit method with overloads
  emit<K extends keyof MFEEventMap>(type: K, data: MFEEventMap[K]): void;
  emit<T = any>(type: string, data?: T): void;
  emit<T extends BaseEvent>(event: T): void;
  
  // Single on method with overloads  
  on<K extends keyof MFEEventMap>(
    type: K, 
    handler: (event: TypedEvent<MFEEventMap, K>) => void
  ): () => void;
  on<T = any>(
    type: string, 
    handler: (event: AnyEvent<T>) => void
  ): () => void;
  
  // Similar for once and off
  once(...): () => void;
  off(...): void;
  
  // Utility methods
  removeAllListeners(type?: string): void;
  listenerCount(type: string): number;
  
  // New debugging methods
  enableLogging(enabled: boolean): void;
  getEventHistory(limit?: number): BaseEvent[];
}
```

#### 1.2 Benefits
- Single method set, multiple signatures
- Type inference from event name
- Backward compatible
- Clean, intuitive API

### Phase 2: Event Helpers & Utilities

#### 2.1 Event Factory Functions

```typescript
// In domain/events.ts
export const Events = {
  // MFE Lifecycle
  mfeLoaded: (name: string, version: string, metadata?: any) => 
    createEvent<MFEEventMap>('mfe:loaded', { name, version, metadata }, name),
  
  mfeReady: (name: string, capabilities?: string[]) =>
    createEvent<MFEEventMap>('mfe:ready', { name, capabilities }, name),
  
  mfeError: (name: string, error: Error, context?: any) =>
    createEvent<MFEEventMap>('mfe:error', {
      name,
      error: error.message,
      stack: error.stack,
      context
    }, name),
  
  // Navigation
  navigationChange: (from: string, to: string, method: 'push' | 'replace' | 'back' | 'forward') =>
    createEvent<MFEEventMap>('navigation:change', { from, to, method }, 'router'),
  
  // User Events
  userLogin: (userId: string, username: string, roles: string[]) =>
    createEvent<MFEEventMap>('user:login', { userId, username, roles }, 'auth'),
  
  userLogout: (userId: string, reason?: string) =>
    createEvent<MFEEventMap>('user:logout', { userId, reason }, 'auth'),
};

// Usage:
eventBus.emit(Events.mfeLoaded('my-mfe', '1.0.0'));
eventBus.emit(Events.userLogin('123', 'john', ['admin']));
```

#### 2.2 Event Type Constants

```typescript
// Export event types as constants for IntelliSense
export const MFEEvents = {
  // Lifecycle
  LOADED: 'mfe:loaded' as const,
  UNLOADED: 'mfe:unloaded' as const,
  ERROR: 'mfe:error' as const,
  READY: 'mfe:ready' as const,
  
  // Navigation
  NAV_CHANGE: 'navigation:change' as const,
  NAV_REQUEST: 'navigation:request' as const,
  
  // User
  USER_LOGIN: 'user:login' as const,
  USER_LOGOUT: 'user:logout' as const,
  USER_ACTION: 'user:action' as const,
  
  // State
  STATE_SYNC: 'state:sync' as const,
  STATE_REQUEST: 'state:request' as const,
  STATE_RESPONSE: 'state:response' as const,
} as const;

// Usage with IntelliSense:
eventBus.on(MFEEvents.LOADED, (event) => {
  // event is fully typed!
  console.log(event.data.name, event.data.version);
});
```

#### 2.3 Migration Utilities

```typescript
// Helper to convert legacy emit calls to typed
export function migrateEmit(eventBus: EventBus) {
  const originalEmit = eventBus.emit.bind(eventBus);
  
  return {
    // Provide typed wrappers for common events
    emitMFELoaded: (name: string, version: string) => 
      originalEmit('mfe:loaded', { name, version }),
    
    emitNavigation: (from: string, to: string) =>
      originalEmit('navigation:change', { from, to, method: 'push' }),
    
    // Generic typed emit
    emitTyped: <K extends keyof MFEEventMap>(
      type: K, 
      data: MFEEventMap[K]
    ) => originalEmit(type, data),
  };
}
```

### Phase 3: Implementation Simplification

#### 3.1 Simplified SimpleEventBus

```typescript
class SimpleEventBus implements EventBus {
  private handlers = new Map<string, Set<Handler>>();
  private eventHistory: BaseEvent[] = [];
  private loggingEnabled = false;
  
  emit(...args: any[]): void {
    const event = this.normalizeToBaseEvent(args);
    
    if (this.loggingEnabled) {
      console.log('[EventBus]', event.type, event);
    }
    
    this.eventHistory.push(event);
    this.dispatch(event);
  }
  
  private normalizeToBaseEvent(args: any[]): BaseEvent {
    // Handle different call signatures
    if (args.length === 1 && typeof args[0] === 'object' && 'type' in args[0]) {
      // Already a BaseEvent
      return args[0];
    } else if (args.length >= 1) {
      // Legacy: emit(type, data?)
      return {
        type: args[0],
        data: args[1],
        timestamp: Date.now(),
        source: this.source,
      };
    }
    throw new Error('Invalid emit arguments');
  }
  
  private dispatch(event: BaseEvent): void {
    // Single dispatch logic for all events
    const handlers = this.handlers.get(event.type) || [];
    const wildcardHandlers = this.handlers.get('*') || [];
    
    [...handlers, ...wildcardHandlers].forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in handler for ${event.type}:`, error);
      }
    });
  }
}
```

#### 3.2 Benefits
- Single internal format (BaseEvent)
- Simpler dispatch logic
- Built-in debugging features
- Event history for debugging

### Phase 4: Developer Experience Enhancements

#### 4.1 Event Validation (Dev Mode)

```typescript
// In development, validate events against schema
if (process.env.NODE_ENV === 'development') {
  const validator = createEventValidator(MFEEventSchema);
  
  eventBus.on('*', (event) => {
    if (!validator(event)) {
      console.warn(`Invalid event structure for ${event.type}`, event);
    }
  });
}
```

#### 4.2 Event Flow Visualization

```typescript
// Debug utility to visualize event flow
export class EventFlowVisualizer {
  private flows: Map<string, EventFlow> = new Map();
  
  track(eventBus: EventBus): void {
    eventBus.on('*', (event) => {
      this.recordFlow(event);
    });
  }
  
  getFlowDiagram(): string {
    // Generate mermaid diagram of event flows
    return `
      graph LR
      ${Array.from(this.flows.values())
        .map(flow => `${flow.source} -->|${flow.type}| ${flow.listeners.join(',')}`)
        .join('\n')}
    `;
  }
}
```

#### 4.3 TypeScript Plugin

```typescript
// VS Code extension for event IntelliSense
// Shows available events when typing strings that match event patterns
// Provides go-to-definition for event types
// Shows event payload structure on hover
```

### Phase 5: Migration Strategy

#### 5.1 Stage 1: Add New Features (Non-Breaking)
1. Add factory functions and constants
2. Add overloaded signatures to existing methods
3. Add debugging features
4. Update documentation

#### 5.2 Stage 2: Update Examples
1. Convert all examples to use typed events
2. Show migration patterns
3. Demonstrate type safety benefits

#### 5.3 Stage 3: Gradual Codebase Migration
1. Start with new code using typed events
2. Migrate high-traffic events first
3. Use codemods for bulk updates
4. Keep legacy support indefinitely

#### 5.4 Stage 4: Deprecate Duplicate Methods
1. Mark emitEvent, onEvent, etc. as deprecated
2. Point to unified methods in deprecation message
3. Remove in next major version (v2.0)

## Code Examples

### Before (Current)
```typescript
// Confusing dual APIs
eventBus.emit('mfe:loaded', { name: 'my-mfe', version: '1.0.0' });
eventBus.emitEvent({ 
  type: 'mfe:loaded', 
  data: { name: 'my-mfe', version: '1.0.0' },
  timestamp: Date.now(),
  source: 'my-mfe'
});

// No type safety
eventBus.on('mfe:loaded', (payload) => {
  // payload is any, no IntelliSense
  console.log(payload.data.nmae); // Typo not caught!
});
```

### After (Cleaned Up)
```typescript
// Single, clear API with multiple options

// Option 1: Typed with constants
eventBus.emit(MFEEvents.LOADED, { name: 'my-mfe', version: '1.0.0' });

// Option 2: Factory functions
eventBus.emit(Events.mfeLoaded('my-mfe', '1.0.0'));

// Option 3: Direct typed (with IntelliSense)
eventBus.emit('mfe:loaded', { name: 'my-mfe', version: '1.0.0' });

// Full type safety
eventBus.on('mfe:loaded', (event) => {
  // event is TypedEvent<MFEEventMap, 'mfe:loaded'>
  console.log(event.data.name); // Full IntelliSense!
  console.log(event.data.nmae); // Error: Property 'nmae' does not exist
});

// With debugging
eventBus.enableLogging(true);
const history = eventBus.getEventHistory(10); // Last 10 events
```

## Success Metrics

1. **API Simplification**:
   - Single set of methods (no duplicates)
   - Clear, intuitive interface
   - Consistent patterns

2. **Type Safety**:
   - 100% of new code uses typed events
   - IntelliSense for all event types
   - Compile-time error catching

3. **Developer Experience**:
   - Reduced learning curve
   - Better debugging tools
   - Clear migration path

4. **Code Quality**:
   - Simpler implementation
   - Better test coverage
   - Fewer runtime errors

5. **Adoption**:
   - All examples updated
   - Migration guide followed
   - Community feedback positive

## Timeline

- **Week 1**: Interface design and approval
- **Week 2**: Implementation of new interface and utilities
- **Week 3**: Update examples and documentation
- **Week 4**: Testing and refinement
- **Week 5**: Gradual rollout and migration support

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing code | All changes are additive, full backward compatibility |
| Confusion during transition | Clear documentation, examples, and migration guide |
| Performance impact | Benchmark before/after, optimize hot paths |
| Complex type signatures | Provide simple examples, good defaults |
| Low adoption | Show clear benefits, provide codemods |

## Next Steps

1. Review and approve this plan
2. Create feature branch for implementation
3. Start with Phase 1 (Interface Design)
4. Get early feedback from team
5. Iterate based on feedback

## References

- [Phase 6: Event System Unification](./service-architecture-refactoring.md#phase-6-unify-event-systems)
- [Domain Events Documentation](../../architecture/domain-events.md)
- [EventBus Service Interface](../../packages/mfe-toolkit-core/src/services/types/event-bus.ts)
- [MFE Event Types](../../packages/mfe-toolkit-core/src/domain/events.ts)