import { create, type StoreApi } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface MFEStoreConfig {
  name: string;
  enableDevtools?: boolean;
}

// Simple registry to track MFE stores for cleanup
const storeRegistry = new Map<string, StoreApi<any>>();

// Create a namespaced store for an MFE
export function createMFEStore<T extends object>(
  config: MFEStoreConfig,
  initialState: T,
  actions?: (set: (state: Partial<T>) => void, get: () => T) => any
) {
  const storeName = `mfe-${config.name}`;

  // Check if store already exists
  if (storeRegistry.has(storeName)) {
    console.warn(`Store ${storeName} already exists. Returning existing store.`);
    return storeRegistry.get(storeName) as StoreApi<T>;
  }

  // Create the store with optional devtools
  const store = create<T>()(
    config.enableDevtools !== false
      ? devtools(
          (set: any, get: any) => ({
            ...initialState,
            ...(actions ? actions(set, get) : {}),
          }),
          { name: storeName }
        )
      : (set: any, get: any) => ({
          ...initialState,
          ...(actions ? actions(set, get) : {}),
        })
  );

  // Register the store
  storeRegistry.set(storeName, store);

  return store;
}

// Get a store by MFE name (for internal use only)
export function getMFEStore<T = any>(mfeName: string): StoreApi<T> | undefined {
  return storeRegistry.get(`mfe-${mfeName}`) as StoreApi<T> | undefined;
}

// Remove a store (for cleanup when MFE unmounts)
export function removeMFEStore(mfeName: string): void {
  const storeName = `mfe-${mfeName}`;
  storeRegistry.delete(storeName);
}
