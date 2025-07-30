// Simplified inline state manager for demo
export interface StateManager {
  get(key: string): any;
  set(key: string, value: any, source?: string): void;
  subscribe(key: string, listener: (value: any) => void): () => void;
  subscribeAll(listener: (event: any) => void): () => void;
  getSnapshot(): Record<string, any>;
  clear(): void;
  registerMFE(mfeId: string, metadata?: any): void;
  unregisterMFE(mfeId: string): void;
}

class SimpleStateManager implements StateManager {
  private state = new Map<string, any>();
  private listeners = new Map<string, Set<(value: any) => void>>();
  private globalListeners = new Set<(event: any) => void>();

  constructor() {
    // Load from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('mfe-state:')) {
          try {
            const stateKey = key.slice(10);
            const value = JSON.parse(localStorage.getItem(key)!);
            this.state.set(stateKey, value);
          } catch (e) {
            console.error('Failed to load state from localStorage', e);
          }
        }
      }
    }

    // Setup cross-tab sync
    if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('mfe-state-sync');
      channel.onmessage = (event) => {
        const { key, value, source } = event.data;
        this.state.set(key, value);
        this.notifyListeners(key, value, source + ' (cross-tab)');
      };
      (this as any).channel = channel;
    }
  }

  get(key: string): any {
    return this.state.get(key);
  }

  set(key: string, value: any, source: string = 'unknown'): void {
    this.state.set(key, value);

    // Save to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`mfe-state:${key}`, JSON.stringify(value));
      } catch (e) {
        console.error('Failed to save state to localStorage', e);
      }
    }

    // Broadcast to other tabs
    if ((this as any).channel) {
      (this as any).channel.postMessage({ key, value, source });
    }

    this.notifyListeners(key, value, source);
  }

  subscribe(key: string, listener: (value: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    const listeners = this.listeners.get(key)!;
    listeners.add(listener);

    // Call immediately with current value
    const currentValue = this.state.get(key);
    if (currentValue !== undefined) {
      listener(currentValue);
    }

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  subscribeAll(listener: (event: any) => void): () => void {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }

  getSnapshot(): Record<string, any> {
    const snapshot: Record<string, any> = {};
    this.state.forEach((value, key) => {
      snapshot[key] = value;
    });
    return snapshot;
  }

  clear(): void {
    const keys = Array.from(this.state.keys());
    this.state.clear();

    // Clear localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      keys.forEach((key) => {
        localStorage.removeItem(`mfe-state:${key}`);
      });
    }

    // Notify listeners
    keys.forEach((key) => {
      this.notifyListeners(key, undefined, 'clear');
    });
  }

  registerMFE(mfeId: string, metadata?: any): void {
    this.set(`mfe:${mfeId}:registered`, true, 'system');
    console.log(`MFE registered: ${mfeId}`, metadata);
  }

  unregisterMFE(mfeId: string): void {
    const keysToRemove: string[] = [];
    this.state.forEach((_, key) => {
      if (key.startsWith(`mfe:${mfeId}:`)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => {
      this.state.delete(key);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(`mfe-state:${key}`);
      }
    });

    console.log(`MFE unregistered: ${mfeId}`);
  }

  private notifyListeners(key: string, value: any, source: string): void {
    // Notify key-specific listeners
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach((listener) => {
        try {
          listener(value);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    }

    // Notify global listeners
    this.globalListeners.forEach((listener) => {
      try {
        listener({
          key,
          value,
          source,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Global state listener error:', error);
      }
    });
  }
}

let globalInstance: StateManager | null = null;

export function getGlobalStateManager(): StateManager {
  if (!globalInstance) {
    globalInstance = new SimpleStateManager();

    // Expose to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__MFE_STATE__ = {
        manager: globalInstance,
        getState: () => globalInstance!.getSnapshot(),
      };
    }
  }
  return globalInstance;
}

// React adapter hooks
import { useEffect, useCallback, useRef, useSyncExternalStore } from 'react';

export function useGlobalState<T = any>(key: string): [T | undefined, (value: T) => void] {
  const stateManager = getGlobalStateManager();

  const value = useSyncExternalStore(
    (callback) => stateManager.subscribe(key, callback),
    () => stateManager.get(key),
    () => stateManager.get(key)
  );

  const setValue = useCallback(
    (newValue: T) => {
      stateManager.set(key, newValue, 'react-hook');
    },
    [key, stateManager]
  );

  return [value, setValue];
}

export function useGlobalStateListener(callback: (key: string, value: any) => void): void {
  const stateManager = getGlobalStateManager();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return stateManager.subscribeAll((event) => {
      callbackRef.current(event.key, event.value);
    });
  }, [stateManager]);
}

export function useMFERegistration(mfeId: string, metadata?: any): void {
  const stateManager = getGlobalStateManager();

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

// For backward compatibility
export class ReactAdapter {
  constructor(private stateManager: StateManager) {}

  // These methods are deprecated - use the hook functions directly
  useGlobalState = useGlobalState;
  useGlobalStateListener = useGlobalStateListener;
  useMFERegistration = useMFERegistration;
}
