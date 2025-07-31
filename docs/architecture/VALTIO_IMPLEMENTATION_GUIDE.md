# Valtio Implementation Guide

## Table of Contents

1. [Implementation Overview](#implementation-overview)
2. [API Compatibility Matrix](#api-compatibility-matrix)
3. [Technical Implementation Details](#technical-implementation-details)
4. [Migration Path](#migration-path)
5. [Testing Strategy](#testing-strategy)
6. [Rollback Plan](#rollback-plan)

## Implementation Overview

### Core Architecture

```typescript
// Current Architecture
UniversalStateManager
├── Map-based storage
├── Manual subscription tracking
├── Custom event system
└── Framework adapters

// Valtio Architecture
ValtioStateManager
├── Proxy-based reactive store
├── Automatic dependency tracking
├── Built-in subscription system
└── Native framework integration
```

### Key Design Decisions

1. **Hybrid Approach**: Keep existing API while leveraging Valtio internally
2. **Feature Parity**: All current features must work identically
3. **Performance First**: Optimize hot paths with Valtio's reactivity
4. **Gradual Migration**: Allow both implementations to coexist

## API Compatibility Matrix

### Core Methods

| Method | Current Behavior | Valtio Implementation | Notes |
|--------|-----------------|---------------------|--------|
| `get<T>(key)` | Returns from Map | Returns from proxy.store[key] | Type inference improved |
| `set<T>(key, value, source)` | Updates Map + notifies | Updates proxy + auto-notify | Batching enabled |
| `delete(key)` | Removes from Map | Delete proxy.store[key] | Triggers subscriptions |
| `clear()` | Clears entire Map | Reset proxy.store = {} | Atomic operation |
| `subscribe(key, listener)` | Manual tracking | subscribeKey() utility | Better performance |
| `subscribeAll(listener)` | Global listener set | subscribe() on proxy | More efficient |
| `getSnapshot()` | Map to object | snapshot(proxy.store) | Immutable snapshot |
| `restoreSnapshot(data)` | Replace Map | Merge into proxy | Maintains reactivity |

### MFE Management

| Method | Implementation Strategy |
|--------|------------------------|
| `registerMFE()` | Store in proxy.mfeRegistry |
| `unregisterMFE()` | Delete from registry + cleanup |
| MFE state isolation | Key prefixing remains same |

### Advanced Features

| Feature | Implementation Approach |
|---------|------------------------|
| Cross-tab sync | BroadcastChannel + Valtio subscribe |
| LocalStorage | valtio-persist with custom adapter |
| Middleware | Intercept set() operations |
| DevTools | valtio/utils devtools + custom bridge |

## Technical Implementation Details

### 1. State Structure

```typescript
interface ValtioInternalState {
  // Main key-value store
  store: Record<string, any>
  
  // MFE tracking
  mfeRegistry: Record<string, {
    id: string
    framework: string
    version: string
    registeredAt: number
  }>
  
  // Metadata for debugging/monitoring
  _internal: {
    version: number
    lastUpdate: number
    updateCount: number
    source: string
  }
}
```

### 2. Subscription System

```typescript
// Current: Manual subscription tracking
class CurrentImplementation {
  private listeners = new Map<string, Set<StateListener>>()
  
  subscribe(key, listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key).add(listener)
    // Manual cleanup tracking...
  }
}

// Valtio: Automatic subscription
class ValtioImplementation {
  subscribe(key, listener) {
    // Valtio handles subscription lifecycle
    return subscribeKey(this.state.store, key, (value) => {
      const event = this.createEvent(key, value)
      listener(value, event)
    })
  }
}
```

### 3. Performance Optimizations

```typescript
class ValtioStateManager {
  // Batch multiple updates
  batchUpdate(updates: Record<string, any>) {
    // Valtio automatically batches these
    Object.assign(this.state.store, updates)
  }
  
  // Computed values with caching
  private computed = derive({
    totalMFEs: (get) => Object.keys(get(this.state).mfeRegistry).length,
    stateSize: (get) => Object.keys(get(this.state).store).length
  })
  
  // Selective subscriptions
  subscribeToPattern(pattern: RegExp, listener: Function) {
    return subscribe(this.state.store, () => {
      const matchingKeys = Object.keys(this.state.store)
        .filter(key => pattern.test(key))
      listener(matchingKeys)
    })
  }
}
```

### 4. Cross-Tab Synchronization

```typescript
private setupCrossTabSync() {
  // Listen to state changes
  subscribe(this.state.store, () => {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'STATE_UPDATE',
        snapshot: snapshot(this.state.store),
        source: this.instanceId
      })
    }
  })
  
  // Handle incoming updates
  this.broadcastChannel.onmessage = (event) => {
    if (event.data.source !== this.instanceId) {
      // Use ref() to avoid triggering our own subscriptions
      ref(this.state.store) = event.data.snapshot
    }
  }
}
```

### 5. LocalStorage Persistence

```typescript
import { subscribeKey } from 'valtio/utils'
import { watch } from 'valtio/utils'

private setupPersistence() {
  // Watch for changes and persist
  const stopWatching = watch((get) => {
    const store = get(this.state.store)
    Object.entries(store).forEach(([key, value]) => {
      try {
        localStorage.setItem(
          `${this.config.storagePrefix}:${key}`,
          JSON.stringify(value)
        )
      } catch (e) {
        console.warn(`Failed to persist ${key}`, e)
      }
    })
  })
  
  // Load on init
  this.loadFromStorage()
}
```

## Migration Path

### Step 1: Parallel Implementation

```typescript
// Add to universal-state package
export { UniversalStateManager } from './core/state-manager'
export { ValtioStateManager } from './core/valtio-state-manager'

// Feature flag in container
const StateManager = process.env.USE_VALTIO_STATE 
  ? ValtioStateManager 
  : UniversalStateManager
```

### Step 2: Adapter Updates

```typescript
// React adapter with Valtio optimization
export function useGlobalState<T>(key: string) {
  const manager = useStateManager()
  
  if (manager instanceof ValtioStateManager) {
    // Use Valtio's snapshot for better performance
    const snap = useSnapshot(manager.getProxyStore())
    const value = snap[key] as T
    
    const setValue = useCallback((newValue: T) => {
      manager.set(key, newValue)
    }, [key])
    
    return [value, setValue]
  }
  
  // Fallback to current implementation
  return useLegacyState(key)
}
```

### Step 3: Gradual Rollout

1. **Development**: Enable for local development
2. **Testing**: Run parallel tests with both implementations
3. **Staging**: Deploy with feature flag (10% → 50% → 100%)
4. **Production**: Monitor metrics, gradual rollout
5. **Cleanup**: Remove old implementation after stability

## Testing Strategy

### Unit Tests

```typescript
describe('ValtioStateManager', () => {
  // Run same tests as UniversalStateManager
  stateManagerTests(ValtioStateManager)
  
  // Valtio-specific tests
  describe('Valtio Features', () => {
    test('proxy reactivity', () => {
      const manager = new ValtioStateManager()
      const spy = jest.fn()
      
      subscribe(manager.getProxyStore(), spy)
      manager.set('test', 'value')
      
      expect(spy).toHaveBeenCalledTimes(1)
    })
    
    test('batched updates', () => {
      const manager = new ValtioStateManager()
      const spy = jest.fn()
      
      manager.subscribeAll(spy)
      
      // These should batch
      manager.set('a', 1)
      manager.set('b', 2)
      manager.set('c', 3)
      
      // Should only trigger once
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})
```

### Integration Tests

```typescript
describe('Cross-Implementation Compatibility', () => {
  test('state sync between implementations', async () => {
    const current = new UniversalStateManager()
    const valtio = new ValtioStateManager()
    
    // Set up sync
    current.subscribeAll((event) => {
      valtio.set(event.key, event.value)
    })
    
    current.set('test', 'value')
    
    expect(valtio.get('test')).toBe('value')
  })
})
```

### Performance Tests

```typescript
describe('Performance Benchmarks', () => {
  const implementations = [
    { name: 'Current', Manager: UniversalStateManager },
    { name: 'Valtio', Manager: ValtioStateManager }
  ]
  
  implementations.forEach(({ name, Manager }) => {
    describe(name, () => {
      benchmark('1000 updates', () => {
        const manager = new Manager()
        for (let i = 0; i < 1000; i++) {
          manager.set(`key${i}`, i)
        }
      })
      
      benchmark('1000 subscriptions', () => {
        const manager = new Manager()
        const unsubscribes = []
        
        for (let i = 0; i < 1000; i++) {
          unsubscribes.push(
            manager.subscribe(`key${i}`, () => {})
          )
        }
        
        unsubscribes.forEach(fn => fn())
      })
    })
  })
})
```

## Rollback Plan

### Monitoring Metrics

1. **Performance Metrics**
   - State update latency
   - Memory usage
   - Re-render frequency

2. **Error Tracking**
   - Exception rates
   - Failed state operations
   - Cross-tab sync failures

3. **User Impact**
   - Page load times
   - Interaction responsiveness
   - MFE load failures

### Rollback Triggers

- Error rate increase > 5%
- Performance degradation > 10%
- Critical bug in production
- MFE compatibility issues

### Rollback Process

1. **Immediate**: Toggle feature flag to disable Valtio
2. **Quick Fix**: Deploy hotfix if issue is minor
3. **Full Rollback**: Revert to previous version if critical
4. **Post-Mortem**: Analyze issues and update implementation

### Recovery Steps

```bash
# 1. Disable feature flag
kubectl set env deployment/container USE_VALTIO_STATE=false

# 2. Verify rollback
curl https://api.example.com/health/state-manager

# 3. Clear affected caches
redis-cli FLUSHDB

# 4. Monitor recovery
watch -n 1 'kubectl logs -l app=container --tail=50'
```

## Success Criteria

### Phase 1 (Implementation)
- [ ] All unit tests pass for both implementations
- [ ] API compatibility 100%
- [ ] No performance regression

### Phase 2 (Testing)
- [ ] E2E tests pass with Valtio
- [ ] Performance improvement confirmed
- [ ] Cross-tab sync working

### Phase 3 (Rollout)
- [ ] Staging deployment successful
- [ ] Monitoring dashboards ready
- [ ] Rollback tested

### Phase 4 (Production)
- [ ] Error rate unchanged
- [ ] Performance metrics improved
- [ ] All MFEs functioning

---

Document Version: 1.0.0  
Last Updated: 2025-07-30  
Next Review: After Phase 1 completion