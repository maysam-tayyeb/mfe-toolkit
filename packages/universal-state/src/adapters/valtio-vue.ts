import { computed, ref, onMounted, onUnmounted, ComputedRef } from 'vue';
import { subscribe, snapshot } from 'valtio';
import type {
  StateKey,
  StateValue,
  StateSetter,
  GlobalStateListener,
  MFERegistrationMetadata,
  FrameworkAdapter,
} from '../types';
import { UniversalStateManager } from '../core/universal-state-manager';

// Type for the state manager context
let globalValtioStateManager: UniversalStateManager | null = null;

/**
 * Set the global Valtio state manager instance
 */
export function setGlobalValtioStateManager(manager: UniversalStateManager): void {
  globalValtioStateManager = manager;
}

/**
 * Get the global Valtio state manager instance
 */
function getValtioStateManager(): UniversalStateManager {
  if (!globalValtioStateManager) {
    throw new Error('No global Valtio state manager set. Call setGlobalValtioStateManager first.');
  }
  return globalValtioStateManager;
}

// Vue composition return type
export type VueStateReturn<T> = {
  value: ComputedRef<T | undefined>;
  setValue: StateSetter<T>;
};

/**
 * Vue composition API for subscribing to a specific state key with Valtio
 */
export function useValtioGlobalState<T = StateValue>(key: StateKey): VueStateReturn<T> {
  const stateManager = getValtioStateManager();
  const proxyStore = stateManager.getProxyStore();
  
  // Create reactive ref for the value
  const localValue = ref<T | undefined>(proxyStore[key] as T);
  
  // Subscribe to changes
  onMounted(() => {
    const unsubscribe = subscribe(proxyStore, () => {
      localValue.value = proxyStore[key] as T;
    });
    
    onUnmounted(() => {
      unsubscribe();
    });
  });

  // Computed property for reactive access
  const value = computed(() => localValue.value);

  const setValue: StateSetter<T> = (newValue: T) => {
    stateManager.set<T>(key, newValue, 'vue-composition');
  };

  return {
    value,
    setValue,
  };
}

// Type for multiple states
export type MultipleStatesValue<K extends StateKey> = Record<K, StateValue>;
export type VueMultipleStatesReturn<T> = {
  values: ComputedRef<T>;
  setValues: (updates: Partial<T>) => void;
};

/**
 * Vue composition API for subscribing to multiple state keys with Valtio
 */
export function useValtioGlobalStates<K extends StateKey>(
  keys: K[]
): VueMultipleStatesReturn<MultipleStatesValue<K>> {
  const stateManager = getValtioStateManager();
  const proxyStore = stateManager.getProxyStore();
  
  // Create reactive ref for values
  const localValues = ref<MultipleStatesValue<K>>({} as MultipleStatesValue<K>);
  
  // Initialize values
  keys.forEach((key) => {
    localValues.value[key] = proxyStore[key];
  });
  
  // Subscribe to changes
  onMounted(() => {
    const unsubscribe = subscribe(proxyStore, () => {
      const newValues = {} as MultipleStatesValue<K>;
      keys.forEach((key) => {
        newValues[key] = proxyStore[key];
      });
      localValues.value = newValues;
    });
    
    onUnmounted(() => {
      unsubscribe();
    });
  });

  // Computed property for reactive access
  const values = computed(() => localValues.value);

  const setValues = (updates: Partial<MultipleStatesValue<K>>) => {
    Object.entries(updates).forEach(([key, value]) => {
      stateManager.set(key as StateKey, value, 'vue-composition-multi');
    });
  };

  return {
    values,
    setValues,
  };
}

// Type for state listener callback
export type StateListenerCallback = (key: StateKey, value: StateValue) => void;

/**
 * Vue composition API for subscribing to all state changes with Valtio
 */
export function useValtioGlobalStateListener(callback: StateListenerCallback): void {
  const stateManager = getValtioStateManager();

  onMounted(() => {
    const listener: GlobalStateListener = (event) => {
      callback(event.key, event.value);
    };

    const unsubscribe = stateManager.subscribeAll(listener);

    onUnmounted(() => {
      unsubscribe();
    });
  });
}

/**
 * Vue composition API for registering an MFE with Valtio
 */
export function useValtioMFERegistration(mfeId: string, metadata?: MFERegistrationMetadata): void {
  const stateManager = getValtioStateManager();

  onMounted(() => {
    stateManager.registerMFE(mfeId, {
      ...metadata,
      framework: 'vue',
    });

    onUnmounted(() => {
      stateManager.unregisterMFE(mfeId);
    });
  });
}

/**
 * Get direct access to the Valtio store snapshot
 * For advanced use cases where you want reactive access to the entire store
 */
export function useValtioStore(): ComputedRef<Record<string, any>> {
  const stateManager = getValtioStateManager();
  const proxyStore = stateManager.getProxyStore();
  const localSnapshot = ref(snapshot(proxyStore));

  onMounted(() => {
    const unsubscribe = subscribe(proxyStore, () => {
      localSnapshot.value = snapshot(proxyStore);
    });

    onUnmounted(() => {
      unsubscribe();
    });
  });

  return computed(() => localSnapshot.value);
}

/**
 * Create a Vue adapter instance for a specific Valtio state manager
 * This is useful when you need multiple state managers
 */
export function createValtioVueAdapter(stateManager: UniversalStateManager): ValtioVueAdapter {
  return {
    name: 'vue' as const,
    
    useGlobalState<T = StateValue>(key: StateKey): VueStateReturn<T> {
      const proxyStore = stateManager.getProxyStore();
      const localValue = ref<T | undefined>(proxyStore[key] as T);
      
      onMounted(() => {
        const unsubscribe = subscribe(proxyStore, () => {
          localValue.value = proxyStore[key] as T;
        });
        
        onUnmounted(() => {
          unsubscribe();
        });
      });

      const value = computed(() => localValue.value);

      const setValue: StateSetter<T> = (newValue: T) => {
        stateManager.set<T>(key, newValue, 'vue-composition');
      };

      return {
        value,
        setValue,
      };
    },

    useGlobalStates<K extends StateKey>(
      keys: K[]
    ): VueMultipleStatesReturn<MultipleStatesValue<K>> {
      const proxyStore = stateManager.getProxyStore();
      const localValues = ref<MultipleStatesValue<K>>({} as MultipleStatesValue<K>);
      
      keys.forEach((key) => {
        localValues.value[key] = proxyStore[key];
      });
      
      onMounted(() => {
        const unsubscribe = subscribe(proxyStore, () => {
          const newValues = {} as MultipleStatesValue<K>;
          keys.forEach((key) => {
            newValues[key] = proxyStore[key];
          });
          localValues.value = newValues;
        });
        
        onUnmounted(() => {
          unsubscribe();
        });
      });

      const values = computed(() => localValues.value);

      const setValues = (updates: Partial<MultipleStatesValue<K>>) => {
        Object.entries(updates).forEach(([key, value]) => {
          stateManager.set(key as StateKey, value, 'vue-composition-multi');
        });
      };

      return {
        values,
        setValues,
      };
    },

    useGlobalStateListener(callback: StateListenerCallback): void {
      onMounted(() => {
        const listener: GlobalStateListener = (event) => {
          callback(event.key, event.value);
        };

        const unsubscribe = stateManager.subscribeAll(listener);

        onUnmounted(() => {
          unsubscribe();
        });
      });
    },

    useMFERegistration(mfeId: string, metadata?: MFERegistrationMetadata): void {
      onMounted(() => {
        stateManager.registerMFE(mfeId, {
          ...metadata,
          framework: 'vue',
        });

        onUnmounted(() => {
          stateManager.unregisterMFE(mfeId);
        });
      });
    },

    useStore(): ComputedRef<Record<string, any>> {
      const proxyStore = stateManager.getProxyStore();
      const localSnapshot = ref(snapshot(proxyStore));

      onMounted(() => {
        const unsubscribe = subscribe(proxyStore, () => {
          localSnapshot.value = snapshot(proxyStore);
        });

        onUnmounted(() => {
          unsubscribe();
        });
      });

      return computed(() => localSnapshot.value);
    },
  };
}

// Vue adapter interface
export interface ValtioVueAdapter extends FrameworkAdapter {
  name: 'vue';
  useGlobalState: typeof useValtioGlobalState;
  useGlobalStates: typeof useValtioGlobalStates;
  useGlobalStateListener: typeof useValtioGlobalStateListener;
  useMFERegistration: typeof useValtioMFERegistration;
  useStore: typeof useValtioStore;
}

// For backward compatibility with existing code
export const useGlobalState = useValtioGlobalState;
export const useGlobalStates = useValtioGlobalStates;
export const useGlobalStateListener = useValtioGlobalStateListener;
export const useMFERegistration = useValtioMFERegistration;