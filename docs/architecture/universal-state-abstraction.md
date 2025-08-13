# Universal State Manager - Abstraction Architecture

## Overview

The Universal State Manager provides a vendor-agnostic abstraction layer for state management across microfrontends. While the current implementation uses Valtio as the underlying state management engine, the abstraction ensures that the platform can migrate to different state management solutions without breaking MFE contracts.

## Design Philosophy

### 1. **Vendor Independence**

The abstraction layer decouples MFEs from specific state management implementations:

```typescript
// MFEs use the abstract interface
const stateManager: StateManager = services.stateManager;
stateManager.set('key', 'value');

// Implementation details are hidden
// Currently Valtio, but could be MobX, Zustand, or custom
```

### 2. **Framework Agnostic**

The same API works across React, Vue, Solid.js, and Vanilla JavaScript:

```typescript
// React
const [value, setValue] = useGlobalState('key');

// Vue
const { value, setValue } = useGlobalState('key');

// Vanilla JS
const value = stateManager.get('key');
stateManager.set('key', newValue);
```

### 3. **Progressive Enhancement**

The abstraction allows leveraging implementation-specific features without breaking compatibility:

```typescript
// Basic usage works everywhere
stateManager.set('count', 1);

// Enhanced features for capable implementations
if (stateManager instanceof UniversalStateManager) {
  // Access Valtio proxy for fine-grained reactivity
  const proxy = stateManager.getProxyStore();

  // Use advanced features
  const derived = createDerivedState(
    stateManager,
    (state) => state.firstName + ' ' + state.lastName
  );
}
```

## Benefits of the Abstraction

### 1. **Future-Proof Architecture**

The abstraction layer enables seamless migration between state management solutions:

```typescript
// Today: Valtio implementation
export class UniversalStateManager implements StateManager {
  private state = proxy({ store: {} });
  // Valtio-based implementation
}

// Future: Different implementation
export class UniversalStateManager implements StateManager {
  private store = createStore({});
  // MobX/Zustand/Custom implementation
}

// MFE code remains unchanged!
```

### 2. **Performance Optimization**

Different MFEs can use different state management strategies:

- **Container**: Full Valtio with all features
- **Legacy MFEs**: Simple key-value implementation
- **Performance-critical MFEs**: Custom optimized implementation

### 3. **Testing and Mocking**

The abstraction makes testing easier:

```typescript
// Easy to mock for tests
const mockStateManager: StateManager = {
  get: vi.fn(),
  set: vi.fn(),
  subscribe: vi.fn(() => () => {}),
  // ...
};

// No need to mock complex Valtio internals
```

### 4. **Gradual Migration**

New features can be added without breaking existing MFEs:

```typescript
// Old MFEs continue working
stateManager.get('key');
stateManager.set('key', 'value');

// New MFEs can use enhanced features
const history = createHistory(stateManager);
const machine = createStateMachine(stateManager, config);
```

## Implementation Architecture

### Core Interface

```typescript
interface StateManager {
  // Basic operations
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, source?: string): void;
  delete(key: string): void;
  clear(): void;

  // Subscriptions
  subscribe<T>(key: string, listener: StateListener<T>): Unsubscribe;
  subscribeAll(listener: GlobalStateListener): Unsubscribe;

  // MFE management
  registerMFE(mfeId: string, metadata?: any): void;
  unregisterMFE(mfeId: string): void;

  // Snapshots
  getSnapshot(): Record<string, any>;
  restoreSnapshot(snapshot: Record<string, any>): void;
}
```

### Current Implementation Stack

```
┌─────────────────────────────────────┐
│         MFE Applications            │
├─────────────────────────────────────┤
│    Framework Adapters (React/Vue)   │
├─────────────────────────────────────┤
│     StateManager Interface          │
├─────────────────────────────────────┤
│   UniversalStateManager Class       │
├─────────────────────────────────────┤
│      Valtio Proxy Store            │
└─────────────────────────────────────┘
```

### Extension Points

The architecture provides multiple extension points:

1. **Middleware System**

   ```typescript
   const middleware = [
     (event, next) => {
       console.log('State change:', event);
       next();
     },
   ];
   ```

2. **Custom Adapters**

   ```typescript
   const customAdapter = createReactAdapter(stateManager);
   ```

3. **Enhanced Features**
   ```typescript
   // Leverage implementation specifics
   const selector = createSelector(stateManager, (state) => state.user.preferences);
   ```

## Migration Strategy

When migrating to a different state management solution:

1. **Implement StateManager Interface**

   ```typescript
   export class NewStateManager implements StateManager {
     // New implementation
   }
   ```

2. **Update Factory Functions**

   ```typescript
   export function createStateManager(config?: StateManagerConfig) {
     return new NewStateManager(config);
   }
   ```

3. **Test Compatibility**
   - Run existing test suite
   - Verify MFE functionality
   - Check performance metrics

4. **Gradual Rollout**
   - Use feature flags
   - Test with subset of MFEs
   - Monitor for issues

## Best Practices

### For MFE Developers

1. **Use the Abstract Interface**

   ```typescript
   // Good: Uses abstract interface
   const value = stateManager.get('key');

   // Avoid: Implementation-specific
   const proxy = (stateManager as any).state.store;
   ```

2. **Check Capabilities**

   ```typescript
   // Check for enhanced features
   if ('getProxyStore' in stateManager) {
     // Use enhanced features
   }
   ```

3. **Handle Different Implementations**
   ```typescript
   // Defensive coding
   try {
     const derived = createDerivedState(stateManager, ...);
   } catch (e) {
     // Fallback to basic functionality
   }
   ```

### For Platform Developers

1. **Maintain Interface Compatibility**
   - Don't break existing methods
   - Use deprecation warnings
   - Provide migration guides

2. **Document Implementation Details**
   - Current implementation: Valtio
   - Performance characteristics
   - Known limitations

3. **Monitor Usage Patterns**
   - Track which features are used
   - Identify optimization opportunities
   - Plan future enhancements

## Conclusion

The Universal State Manager abstraction provides a robust foundation for state management across microfrontends. By decoupling the interface from implementation, it enables:

- **Flexibility**: Change implementations without breaking MFEs
- **Performance**: Optimize for different use cases
- **Innovation**: Add new features progressively
- **Stability**: Maintain backward compatibility

This architecture ensures the platform can evolve with changing requirements while protecting existing investments in MFE development.
