import { useEffect, useState, useCallback, useRef, useSyncExternalStore } from 'react';
import type {
  StateManager,
  StateKey,
  StateValue,
  StateSetter,
  StateHookReturn,
  GlobalStateListener,
  MFERegistrationMetadata,
  FrameworkAdapter,
} from '../types';

// Type for the state manager context
let globalStateManager: StateManager | null = null;

/**
 * Set the global state manager instance
 */
export function setGlobalStateManager(manager: StateManager): void {
  globalStateManager = manager;
}

/**
 * Get the global state manager instance
 */
function getStateManager(): StateManager {
  if (!globalStateManager) {
    throw new Error('No global state manager set. Call setGlobalStateManager first.');
  }
  return globalStateManager;
}

/**
 * React hook for subscribing to a specific state key
 */
export function useGlobalState<T = StateValue>(key: StateKey): StateHookReturn<T> {
  const stateManager = getStateManager();

  // Use useSyncExternalStore for better performance and consistency
  const value = useSyncExternalStore(
    (callback) => stateManager.subscribe<T>(key, callback),
    () => stateManager.get<T>(key),
    () => stateManager.get<T>(key) // Server snapshot
  );

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
 * React hook for subscribing to multiple state keys
 */
export function useGlobalStates<K extends StateKey>(
  keys: K[]
): MultipleStatesHookReturn<MultipleStatesValue<K>> {
  const stateManager = getStateManager();

  const [values, setValues] = useState<MultipleStatesValue<K>>(() => {
    const initial = {} as MultipleStatesValue<K>;
    keys.forEach((key) => {
      initial[key] = stateManager.get(key);
    });
    return initial;
  });

  useEffect(() => {
    const unsubscribes: Array<() => void> = [];

    keys.forEach((key) => {
      const unsubscribe = stateManager.subscribe(key, (value) => {
        setValues((prev) => ({ ...prev, [key]: value }));
      });
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((fn) => fn());
    };
  }, [keys, stateManager]);

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
 * React hook for subscribing to all state changes
 */
export function useGlobalStateListener(callback: StateListenerCallback): void {
  const stateManager = getStateManager();
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
 * React hook for registering an MFE
 */
export function useMFERegistration(mfeId: string, metadata?: MFERegistrationMetadata): void {
  const stateManager = getStateManager();

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
 * Create a React adapter instance for a specific state manager
 * This is useful when you need multiple state managers
 */
export function createReactAdapter(stateManager: StateManager): ReactAdapter {
  return {
    name: 'react' as const,
    useGlobalState<T = StateValue>(key: StateKey): StateHookReturn<T> {
      const value = useSyncExternalStore(
        (callback) => stateManager.subscribe<T>(key, callback),
        () => stateManager.get<T>(key),
        () => stateManager.get<T>(key)
      );

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
      const [values, setValues] = useState<MultipleStatesValue<K>>(() => {
        const initial = {} as MultipleStatesValue<K>;
        keys.forEach((key) => {
          initial[key] = stateManager.get(key);
        });
        return initial;
      });

      useEffect(() => {
        const unsubscribes: Array<() => void> = [];

        keys.forEach((key) => {
          const unsubscribe = stateManager.subscribe(key, (value) => {
            setValues((prev) => ({ ...prev, [key]: value }));
          });
          unsubscribes.push(unsubscribe);
        });

        return () => {
          unsubscribes.forEach((fn) => fn());
        };
      }, [keys]);

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
  };
}

// React adapter interface
export interface ReactAdapter extends FrameworkAdapter {
  name: 'react';
  useGlobalState: typeof useGlobalState;
  useGlobalStates: typeof useGlobalStates;
  useGlobalStateListener: typeof useGlobalStateListener;
  useMFERegistration: typeof useMFERegistration;
}

