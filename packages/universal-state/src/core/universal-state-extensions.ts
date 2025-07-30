import { subscribe } from 'valtio';
import { UniversalStateManager } from './universal-state-manager';

/**
 * Enhanced extensions for UniversalStateManager that leverage Valtio's advanced features
 * while maintaining the abstraction layer
 */

/**
 * Create a derived state that automatically updates when dependencies change
 * This provides computed state functionality
 */
export function createDerivedState<T>(
  manager: UniversalStateManager,
  deriveFn: (state: Record<string, any>) => T,
  key?: string
): () => T {
  const proxyStore = manager.getProxyStore();
  let cachedValue: T = deriveFn(proxyStore);
  
  // Update cache when state changes
  subscribe(proxyStore, () => {
    const newValue = deriveFn(proxyStore);
    if (newValue !== cachedValue) {
      cachedValue = newValue;
      if (key) {
        manager.set(key, newValue, 'derived');
      }
    }
  });
  
  // Initialize derived value if key is provided
  if (key) {
    manager.set(key, cachedValue, 'derived');
  }
  
  return () => {
    const currentValue = deriveFn(proxyStore);
    if (currentValue !== cachedValue) {
      cachedValue = currentValue;
      if (key) {
        manager.set(key, currentValue, 'derived');
      }
    }
    return cachedValue;
  };
}

/**
 * Watch specific paths in the state and react to changes
 * This provides fine-grained reactivity beyond key-level subscriptions
 */
export function watchPath(
  manager: UniversalStateManager,
  path: string[],
  callback: (value: any, previousValue: any) => void
): () => void {
  const proxyStore = manager.getProxyStore();
  
  // Function to get value at path
  const getValueAtPath = () => {
    let current = proxyStore;
    for (const segment of path) {
      if (current && typeof current === 'object' && segment in current) {
        current = current[segment];
      } else {
        return undefined;
      }
    }
    return current;
  };
  
  let previousValue = getValueAtPath();
  
  // Subscribe to all changes and check if our path was affected
  return subscribe(proxyStore, () => {
    const currentValue = getValueAtPath();
    if (currentValue !== previousValue) {
      callback(currentValue, previousValue);
      previousValue = currentValue;
    }
  });
}

/**
 * Create a transaction that batches multiple updates
 * All updates within the transaction are applied atomically
 */
export function transaction(
  manager: UniversalStateManager,
  updateFn: (state: Record<string, any>) => void
): void {
  const updates: Record<string, any> = {};
  
  // Create a recording proxy that captures all updates
  const transactionProxy = new Proxy({}, {
    get(target, prop) {
      if (typeof prop === 'string') {
        return manager.get(prop);
      }
      return undefined;
    },
    set(target, prop, value) {
      if (typeof prop === 'string') {
        updates[prop] = value;
      }
      return true;
    },
  });
  
  // Execute the update function with the transaction proxy
  updateFn(transactionProxy);
  
  // Apply all updates at once
  if (Object.keys(updates).length > 0) {
    manager.batchUpdate(updates, 'transaction');
  }
}

/**
 * Create a selector that only re-runs when selected values change
 * This provides React-style selector optimization for any framework
 */
export function createSelector<T>(
  manager: UniversalStateManager,
  selector: (state: Record<string, any>) => T,
  equalityFn?: (a: T, b: T) => boolean
): {
  get: () => T;
  subscribe: (callback: (value: T) => void) => () => void;
} {
  const proxyStore = manager.getProxyStore();
  let lastValue = selector(proxyStore);
  const listeners = new Set<(value: T) => void>();
  
  const equals = equalityFn || ((a, b) => a === b);
  
  // Subscribe to all changes but only notify when selected value changes
  const unsubscribe = subscribe(proxyStore, () => {
    const newValue = selector(proxyStore);
    if (!equals(newValue, lastValue)) {
      lastValue = newValue;
      listeners.forEach((listener) => listener(newValue));
    }
  });
  
  return {
    get: () => selector(proxyStore),
    subscribe: (callback: (value: T) => void) => {
      listeners.add(callback);
      callback(lastValue); // Call immediately with current value
      
      return () => {
        listeners.delete(callback);
        if (listeners.size === 0) {
          unsubscribe();
        }
      };
    },
  };
}

/**
 * Create a history manager for undo/redo functionality
 */
export function createHistory(
  manager: UniversalStateManager,
  options: {
    maxHistory?: number;
    debounceMs?: number;
  } = {}
): {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
} {
  const { maxHistory = 50, debounceMs = 500 } = options;
  const history: Record<string, any>[] = [];
  let currentIndex = -1;
  let debounceTimer: NodeJS.Timeout | null = null;
  
  // Subscribe to all state changes
  const saveSnapshot = () => {
    const snapshot = manager.getSnapshot();
    
    // Remove any history entries after current index
    history.splice(currentIndex + 1);
    
    // Add new snapshot
    history.push(snapshot);
    if (history.length > maxHistory) {
      history.shift();
    } else {
      currentIndex++;
    }
  };
  
  // Debounced snapshot saving
  manager.subscribeAll(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(saveSnapshot, debounceMs);
  });
  
  return {
    undo: () => {
      if (currentIndex > 0) {
        currentIndex--;
        manager.restoreSnapshot(history[currentIndex]);
      }
    },
    
    redo: () => {
      if (currentIndex < history.length - 1) {
        currentIndex++;
        manager.restoreSnapshot(history[currentIndex]);
      }
    },
    
    canUndo: () => currentIndex > 0,
    canRedo: () => currentIndex < history.length - 1,
    
    clear: () => {
      history.length = 0;
      currentIndex = -1;
    },
  };
}

/**
 * Create a persistence adapter with custom serialization
 */
export function createPersistenceAdapter(
  manager: UniversalStateManager,
  options: {
    serialize?: (value: any) => string;
    deserialize?: (value: string) => any;
    storage?: Storage;
    prefix?: string;
  } = {}
): {
  save: (key: string) => void;
  load: (key: string) => any;
  remove: (key: string) => void;
} {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    storage = localStorage,
    prefix = 'universal-state',
  } = options;
  
  return {
    save: (key: string) => {
      const value = manager.get(key);
      if (value !== undefined) {
        storage.setItem(`${prefix}:${key}`, serialize(value));
      }
    },
    
    load: (key: string) => {
      const stored = storage.getItem(`${prefix}:${key}`);
      if (stored !== null) {
        try {
          const value = deserialize(stored);
          manager.set(key, value, 'persistence');
          return value;
        } catch (error) {
          console.error(`Failed to deserialize ${key}:`, error);
        }
      }
      return undefined;
    },
    
    remove: (key: string) => {
      storage.removeItem(`${prefix}:${key}`);
    },
  };
}

/**
 * Create a state machine on top of the state manager
 */
export function createStateMachine<
  TStates extends string,
  TEvents extends string
>(
  manager: UniversalStateManager,
  config: {
    key: string;
    initial: TStates;
    states: Record<
      TStates,
      {
        on?: Partial<Record<TEvents, TStates>>;
        entry?: () => void;
        exit?: () => void;
      }
    >;
  }
): {
  send: (event: TEvents) => void;
  getState: () => TStates;
  subscribe: (callback: (state: TStates) => void) => () => void;
} {
  const { key, initial, states } = config;
  
  // Initialize state
  if (!manager.get(key)) {
    manager.set(key, initial, 'state-machine');
  }
  
  return {
    send: (event: TEvents) => {
      const currentState = manager.get<TStates>(key)!;
      const stateConfig = states[currentState];
      
      if (stateConfig?.on?.[event]) {
        const nextState = stateConfig.on[event]!;
        
        // Call exit handler
        stateConfig.exit?.();
        
        // Transition to next state
        manager.set(key, nextState, 'state-machine');
        
        // Call entry handler
        states[nextState]?.entry?.();
      }
    },
    
    getState: () => manager.get<TStates>(key)!,
    
    subscribe: (callback: (state: TStates) => void) => {
      return manager.subscribe<TStates>(key, (value) => {
        if (value !== undefined) {
          callback(value);
        }
      });
    },
  };
}