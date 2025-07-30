import { useSnapshot } from 'valtio';
import { useEffect, useCallback, useRef } from 'react';
import type {
  StateKey,
  StateValue,
  StateSetter,
  StateHookReturn,
  GlobalStateListener,
  MFERegistrationMetadata,
  FrameworkAdapter,
} from '../types';
import { ValtioStateManager } from '../core/valtio-state-manager';

// Type for the state manager context
let globalValtioStateManager: ValtioStateManager | null = null;

/**
 * Set the global Valtio state manager instance
 */
export function setGlobalValtioStateManager(manager: ValtioStateManager): void {
  globalValtioStateManager = manager;
}

/**
 * Get the global Valtio state manager instance
 */
function getValtioStateManager(): ValtioStateManager {
  if (!globalValtioStateManager) {
    throw new Error('No global Valtio state manager set. Call setGlobalValtioStateManager first.');
  }
  return globalValtioStateManager;
}

/**
 * React hook for subscribing to a specific state key with Valtio
 */
export function useValtioGlobalState<T = StateValue>(key: StateKey): StateHookReturn<T> {
  const stateManager = getValtioStateManager();
  const proxyStore = stateManager.getProxyStore();
  
  // Use Valtio's useSnapshot for reactive updates
  const snap = useSnapshot(proxyStore);
  const value = snap[key] as T | undefined;

  const setValue: StateSetter<T> = useCallback(
    (newValue: T) => {
      stateManager.set<T>(key, newValue, 'react-hook');
    },
    [key, stateManager]
  );

  return [value, setValue];
}

// Type for multiple states
export type MultipleStatesValue<K extends StateKey> = Record<K, StateValue>;
export type MultipleStatesSetter<T> = (updates: Partial<T>) => void;
export type MultipleStatesHookReturn<T> = [T, MultipleStatesSetter<T>];

/**
 * React hook for subscribing to multiple state keys with Valtio
 */
export function useValtioGlobalStates<K extends StateKey>(
  keys: K[]
): MultipleStatesHookReturn<MultipleStatesValue<K>> {
  const stateManager = getValtioStateManager();
  const proxyStore = stateManager.getProxyStore();
  
  // Use Valtio's useSnapshot for reactive updates
  const snap = useSnapshot(proxyStore);
  
  // Extract values for requested keys
  const values = keys.reduce((acc, key) => {
    acc[key] = snap[key];
    return acc;
  }, {} as MultipleStatesValue<K>);

  const setMultipleValues: MultipleStatesSetter<MultipleStatesValue<K>> = useCallback(
    (updates) => {
      Object.entries(updates).forEach(([key, value]) => {
        stateManager.set(key as StateKey, value, 'react-hook-multi');
      });
    },
    [stateManager]
  );

  return [values, setMultipleValues];
}

// Type for state listener callback
export type StateListenerCallback = (key: StateKey, value: StateValue) => void;

/**
 * React hook for subscribing to all state changes with Valtio
 */
export function useValtioGlobalStateListener(callback: StateListenerCallback): void {
  const stateManager = getValtioStateManager();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const listener: GlobalStateListener = (event) => {
      callbackRef.current(event.key, event.value);
    };

    return stateManager.subscribeAll(listener);
  }, [stateManager]);
}

/**
 * React hook for registering an MFE with Valtio
 */
export function useValtioMFERegistration(mfeId: string, metadata?: MFERegistrationMetadata): void {
  const stateManager = getValtioStateManager();

  useEffect(() => {
    stateManager.registerMFE(mfeId, {
      ...metadata,
      framework: 'react',
    });

    return () => {
      stateManager.unregisterMFE(mfeId);
    };
  }, [mfeId, metadata, stateManager]);
}

/**
 * Hook to get direct access to the Valtio proxy store
 * For advanced use cases where you want to use Valtio directly
 */
export function useValtioStore(): Record<string, any> {
  const stateManager = getValtioStateManager();
  const proxyStore = stateManager.getProxyStore();
  return useSnapshot(proxyStore);
}

/**
 * Create a React adapter instance for a specific Valtio state manager
 * This is useful when you need multiple state managers
 */
export function createValtioReactAdapter(stateManager: ValtioStateManager): ValtioReactAdapter {
  return {
    name: 'react' as const,
    useGlobalState<T = StateValue>(key: StateKey): StateHookReturn<T> {
      const proxyStore = stateManager.getProxyStore();
      const snap = useSnapshot(proxyStore);
      const value = snap[key] as T | undefined;

      const setValue: StateSetter<T> = useCallback(
        (newValue: T) => {
          stateManager.set<T>(key, newValue, 'react-hook');
        },
        [key]
      );

      return [value, setValue];
    },

    useGlobalStates<K extends StateKey>(
      keys: K[]
    ): MultipleStatesHookReturn<MultipleStatesValue<K>> {
      const proxyStore = stateManager.getProxyStore();
      const snap = useSnapshot(proxyStore);
      
      const values = keys.reduce((acc, key) => {
        acc[key] = snap[key];
        return acc;
      }, {} as MultipleStatesValue<K>);

      const setMultipleValues: MultipleStatesSetter<MultipleStatesValue<K>> = useCallback(
        (updates) => {
          Object.entries(updates).forEach(([key, value]) => {
            stateManager.set(key as StateKey, value, 'react-hook-multi');
          });
        },
        []
      );

      return [values, setMultipleValues];
    },

    useGlobalStateListener(callback: StateListenerCallback): void {
      const callbackRef = useRef(callback);
      callbackRef.current = callback;

      useEffect(() => {
        const listener: GlobalStateListener = (event) => {
          callbackRef.current(event.key, event.value);
        };

        return stateManager.subscribeAll(listener);
      }, []);
    },

    useMFERegistration(mfeId: string, metadata?: MFERegistrationMetadata): void {
      useEffect(() => {
        stateManager.registerMFE(mfeId, {
          ...metadata,
          framework: 'react',
        });

        return () => {
          stateManager.unregisterMFE(mfeId);
        };
      }, [mfeId, metadata]);
    },

    useStore(): Record<string, any> {
      const proxyStore = stateManager.getProxyStore();
      return useSnapshot(proxyStore);
    },
  };
}

// React adapter interface
export interface ValtioReactAdapter extends FrameworkAdapter {
  name: 'react';
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