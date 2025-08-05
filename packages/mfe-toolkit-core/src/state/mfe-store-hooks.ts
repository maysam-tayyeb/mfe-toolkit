import { useState } from 'react';
import { useStore, type StoreApi } from 'zustand';
import { createMFEStore, getMFEStore, MFEStoreConfig } from './mfe-store-factory';

// Hook to create and use an MFE store
export function useMFEStore<T extends object>(
  config: MFEStoreConfig,
  initialState: T,
  actions?: (set: (state: Partial<T>) => void, get: () => T) => any
): [T, StoreApi<T>] {
  const [store] = useState(() => {
    // Try to get existing store first
    const existingStore = getMFEStore<T>(config.name);
    if (existingStore) {
      return existingStore;
    }

    // Create new store
    return createMFEStore(config, initialState, actions);
  });

  const state = useStore(store);

  return [state, store];
}

// Hook for conditional store creation
export function useLazyMFEStore<T extends object>(
  config: MFEStoreConfig,
  initialState: () => T,
  actions?: (set: (state: Partial<T>) => void, get: () => T) => any
): {
  store: StoreApi<T> | null;
  initialize: () => StoreApi<T>;
  isInitialized: boolean;
} {
  const [store, setStore] = useState<StoreApi<T> | null>(() => {
    return getMFEStore<T>(config.name) || null;
  });

  const initialize = () => {
    if (!store) {
      const newStore = createMFEStore(config, initialState(), actions);
      setStore(newStore);
      return newStore;
    }
    return store;
  };

  return {
    store,
    initialize,
    isInitialized: store !== null,
  };
}
