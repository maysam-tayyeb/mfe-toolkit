# Valtio State Manager Migration Guide

## Overview

This guide helps you migrate from the original `UniversalStateManager` to the new `ValtioStateManager` implementation. The migration is designed to be gradual and backward-compatible.

## Quick Start

### 1. Enable Valtio via Environment Variable

Create or update `.env.local` in your container app:

```bash
# Enable Valtio state manager
VITE_USE_VALTIO_STATE=true
```

### 2. No Code Changes Required!

The existing API is 100% compatible. Your MFEs will work without any modifications:

```typescript
// This works with both implementations
const user = stateManager.get('user');
stateManager.set('user', { name: 'John' });
stateManager.subscribe('user', (value) => {
  console.log('User changed:', value);
});
```

## Taking Advantage of Valtio Features

### React MFEs - Enhanced Hooks

For better performance and developer experience, use Valtio-specific hooks:

```typescript
import { 
  ValtioStateManager, 
  setGlobalValtioStateManagerReact,
  useValtioGlobalState,
  useValtioStore 
} from '@mfe/universal-state';

// In your MFE component
export const MyMFE = ({ stateManager }) => {
  // Check if using Valtio
  if (stateManager instanceof ValtioStateManager) {
    // Set global instance for hooks
    setGlobalValtioStateManagerReact(stateManager);
    
    // Use Valtio hooks
    const [user, setUser] = useValtioGlobalState<User>('user');
    const [theme, setTheme] = useValtioGlobalState<'light' | 'dark'>('theme');
    
    // Get entire store snapshot
    const store = useValtioStore();
  }
};
```

### Vue MFEs - Composition API

```typescript
import { 
  ValtioStateManager,
  setGlobalValtioStateManagerVue,
  useValtioGlobalStateVue,
  useValtioStoreVue
} from '@mfe/universal-state';

export default {
  setup() {
    const stateManager = inject('stateManager');
    
    if (stateManager instanceof ValtioStateManager) {
      setGlobalValtioStateManagerVue(stateManager);
      
      const { value: user, setValue: setUser } = useValtioGlobalStateVue('user');
      const store = useValtioStoreVue();
      
      return { user, setUser, store };
    }
  }
};
```

### Direct Proxy Access

For advanced use cases, access the Valtio proxy directly:

```typescript
if (stateManager instanceof ValtioStateManager) {
  const proxyStore = stateManager.getProxyStore();
  
  // Direct mutations (use sparingly)
  proxyStore.directValue = 'value';
  
  // Reactive access in vanilla JS
  import { subscribe, snapshot } from 'valtio';
  
  subscribe(proxyStore, () => {
    console.log('Store changed:', snapshot(proxyStore));
  });
}
```

## Migration Checklist

### Phase 1: Test Compatibility ✅
- [x] Enable Valtio via environment variable
- [x] Verify existing MFEs work without changes
- [x] Check cross-tab synchronization
- [x] Verify localStorage persistence

### Phase 2: Optimize React MFEs
- [ ] Update to use Valtio hooks
- [ ] Remove unnecessary state copies
- [ ] Leverage fine-grained reactivity

### Phase 3: Optimize Vue MFEs
- [ ] Update to use Valtio composition API
- [ ] Use reactive store access
- [ ] Remove manual subscriptions where possible

### Phase 4: Production Rollout
- [ ] Monitor performance metrics
- [ ] Gradual rollout with feature flags
- [ ] Remove legacy implementation

## Performance Considerations

### Benefits
- **47% smaller bundle size** (8KB vs 15KB)
- **Fine-grained reactivity** - Only components using changed data re-render
- **Better TypeScript inference** - No manual type annotations needed
- **Automatic dependency tracking** - No manual subscription management

### Trade-offs
- **Raw operation overhead** - Proxy adds ~50% overhead for individual operations
- **Memory usage** - Slightly higher due to proxy wrappers
- **Browser support** - Requires Proxy support (modern browsers only)

## Troubleshooting

### Issue: Hooks throw "No global state manager" error

**Solution**: Set the global state manager before using hooks:

```typescript
// React
setGlobalValtioStateManagerReact(stateManager);

// Vue
setGlobalValtioStateManagerVue(stateManager);
```

### Issue: TypeScript errors with Valtio types

**Solution**: Ensure you're importing from the correct path:

```typescript
// Correct
import { ValtioStateManager } from '@mfe/universal-state';

// Also correct for specific adapters
import { useValtioGlobalState } from '@mfe/universal-state';
```

### Issue: State not persisting across page reloads

**Solution**: Verify localStorage is enabled in Valtio config:

```typescript
getGlobalStateManager({
  persistent: true,  // Must be true
  useValtio: true
})
```

### Issue: Cross-tab sync not working

**Solution**: Check BroadcastChannel support and config:

```typescript
getGlobalStateManager({
  crossTab: true,   // Must be true
  useValtio: true
})
```

## Best Practices

1. **Gradual Migration**: Start with one MFE, then expand
2. **Feature Detection**: Always check `instanceof ValtioStateManager`
3. **Backward Compatibility**: Keep fallbacks for legacy implementation
4. **Performance Monitoring**: Track metrics before and after migration
5. **Type Safety**: Leverage Valtio's better TypeScript support

## Example: Full MFE Migration

### Before (Legacy)

```typescript
export const MyMFE = ({ stateManager }) => {
  const [user, setUser] = useState();
  const [theme, setTheme] = useState();
  
  useEffect(() => {
    // Initial values
    setUser(stateManager.get('user'));
    setTheme(stateManager.get('theme'));
    
    // Subscribe to changes
    const unsubUser = stateManager.subscribe('user', setUser);
    const unsubTheme = stateManager.subscribe('theme', setTheme);
    
    return () => {
      unsubUser();
      unsubTheme();
    };
  }, [stateManager]);
  
  const updateUser = (newUser) => {
    stateManager.set('user', newUser);
  };
  
  return <div>...</div>;
};
```

### After (Valtio)

```typescript
export const MyMFE = ({ stateManager }) => {
  // Feature detection
  if (stateManager instanceof ValtioStateManager) {
    setGlobalValtioStateManagerReact(stateManager);
    
    // Use Valtio hooks - much cleaner!
    const [user, setUser] = useValtioGlobalState('user');
    const [theme, setTheme] = useValtioGlobalState('theme');
    
    return <div>...</div>;
  }
  
  // Fallback to legacy implementation
  return <LegacyMyMFE stateManager={stateManager} />;
};
```

## Monitoring Success

Track these metrics to validate the migration:

1. **Bundle Size**: Should see ~47% reduction
2. **Re-render Count**: Should decrease significantly
3. **Memory Usage**: May increase slightly (acceptable trade-off)
4. **User Experience**: Should feel more responsive

## Next Steps

1. Enable Valtio in development
2. Update one MFE to use Valtio features
3. Monitor performance and stability
4. Gradually roll out to all MFEs
5. Remove legacy implementation (after full validation)

---

For questions or issues, please refer to:
- [Valtio Documentation](https://github.com/pmndrs/valtio)
- [MFE State Management Architecture](./STATE_MANAGEMENT_ARCHITECTURE.md)
- [Performance Benchmarks](../../packages/universal-state/src/__tests__/performance-benchmark.test.ts)