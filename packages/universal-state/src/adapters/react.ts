import React, { useEffect, useState, useCallback, useRef, useSyncExternalStore } from 'react';
import { StateManager } from '../types';

export class ReactAdapter {
  constructor(private stateManager: StateManager) {}
  
  /**
   * React hook for subscribing to a specific state key
   */
  useGlobalState<T = any>(key: string): [T | undefined, (value: T) => void] {
    // Use useSyncExternalStore for better performance and consistency
    const value = useSyncExternalStore(
      (callback) => this.stateManager.subscribe(key, callback),
      () => this.stateManager.get(key),
      () => this.stateManager.get(key) // Server snapshot
    );
    
    const setValue = useCallback((newValue: T) => {
      this.stateManager.set(key, newValue, 'react-hook');
    }, [key]);
    
    return [value, setValue];
  }
  
  /**
   * React hook for subscribing to multiple state keys
   */
  useGlobalStates<T extends Record<string, any>>(
    keys: string[]
  ): [T, (updates: Partial<T>) => void] {
    const [values, setValues] = useState<T>(() => {
      const initial: any = {};
      keys.forEach(key => {
        initial[key] = this.stateManager.get(key);
      });
      return initial;
    });
    
    useEffect(() => {
      const unsubscribes: (() => void)[] = [];
      
      keys.forEach(key => {
        const unsubscribe = this.stateManager.subscribe(key, (value) => {
          setValues(prev => ({ ...prev, [key]: value }));
        });
        unsubscribes.push(unsubscribe);
      });
      
      return () => {
        unsubscribes.forEach(fn => fn());
      };
    }, [keys.join(',')]);
    
    const setMultipleValues = useCallback((updates: Partial<T>) => {
      Object.entries(updates).forEach(([key, value]) => {
        this.stateManager.set(key, value, 'react-hook-multi');
      });
    }, []);
    
    return [values, setMultipleValues];
  }
  
  /**
   * React hook for subscribing to all state changes
   */
  useGlobalStateListener(
    callback: (key: string, value: any) => void
  ): void {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    
    useEffect(() => {
      return this.stateManager.subscribeAll((event) => {
        callbackRef.current(event.key, event.value);
      });
    }, []);
  }
  
  /**
   * React hook for registering an MFE
   */
  useMFERegistration(mfeId: string, metadata?: any): void {
    useEffect(() => {
      this.stateManager.registerMFE(mfeId, {
        ...metadata,
        framework: 'react'
      });
      
      return () => {
        this.stateManager.unregisterMFE(mfeId);
      };
    }, [mfeId]);
  }
  
  /**
   * Higher-order component for providing state context
   */
  withGlobalState<P extends object>(
    Component: React.ComponentType<P>,
    stateKeys: string[]
  ): React.FC<P> {
    return (props: P) => {
      const [states] = this.useGlobalStates(stateKeys);
      return React.createElement(Component, { ...props, ...states });
    };
  }
}

// Convenience hooks for direct import
let defaultAdapter: ReactAdapter | null = null;

export function setDefaultStateManager(stateManager: StateManager) {
  defaultAdapter = new ReactAdapter(stateManager);
}

export function useGlobalState<T = any>(key: string): [T | undefined, (value: T) => void] {
  if (!defaultAdapter) {
    throw new Error('No default state manager set. Call setDefaultStateManager first.');
  }
  return defaultAdapter.useGlobalState<T>(key);
}

export function useGlobalStates<T extends Record<string, any>>(
  keys: string[]
): [T, (updates: Partial<T>) => void] {
  if (!defaultAdapter) {
    throw new Error('No default state manager set. Call setDefaultStateManager first.');
  }
  return defaultAdapter.useGlobalStates<T>(keys);
}