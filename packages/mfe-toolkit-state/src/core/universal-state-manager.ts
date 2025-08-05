import { proxy, snapshot, ref } from 'valtio';
import { devtools } from 'valtio/utils';
import {
  StateManager,
  StateListener,
  StateChangeEvent,
  Unsubscribe,
  MFEMetadata,
  StateManagerConfig,
} from '../types';

/**
 * UniversalStateManager - Cross-framework state management solution
 * 
 * This implementation uses Valtio as the underlying state management library,
 * but provides a vendor-agnostic API that allows for:
 * 1. Consistent state management across React, Vue, and Vanilla JS
 * 2. Easy migration to different state management solutions if needed
 * 3. Custom middleware, persistence, and cross-tab synchronization
 * 4. Framework-specific adapters without vendor lock-in
 * 
 * Current implementation: Valtio (proxy-based reactivity)
 */

interface ValtioInternalState {
  store: Record<string, any>;
  mfeRegistry: Record<string, MFEMetadata>;
  _meta: {
    version: number;
    lastUpdate: number;
    updateCount: number;
    source: string;
  };
}

export class UniversalStateManager implements StateManager {
  private state: ValtioInternalState;
  private config: Required<StateManagerConfig>;
  private broadcastChannel?: BroadcastChannel;
  private instanceId = `valtio-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  private isProcessingBroadcast = false;
  private globalListeners = new Set<(event: StateChangeEvent) => void>();
  private keyListeners = new Map<string, Set<StateListener>>();

  constructor(config: StateManagerConfig = {}) {
    this.config = {
      persistent: true,
      storagePrefix: 'mfe-state',
      crossTab: true,
      devtools: true,
      initialState: {},
      middleware: [],
      ...config,
    };

    // Initialize Valtio proxy state
    this.state = proxy<ValtioInternalState>({
      store: { ...this.config.initialState },
      mfeRegistry: {},
      _meta: {
        version: 1,
        lastUpdate: Date.now(),
        updateCount: 0,
        source: 'init',
      },
    });

    // Setup devtools
    if (this.config.devtools && typeof window !== 'undefined') {
      devtools(this.state, {
        name: 'MFE State Manager',
        enabled: true,
      });
      this.setupDevtools();
    }

    // Load from localStorage if persistent
    if (this.config.persistent) {
      this.loadFromStorage();
    }

    // Setup cross-tab synchronization
    if (this.config.crossTab && typeof BroadcastChannel !== 'undefined') {
      this.setupCrossTabSync();
    }

    // Setup internal state change tracking
    this.setupInternalSubscriptions();
  }

  get<T = unknown>(key: string): T | undefined {
    return this.state.store[key] as T | undefined;
  }

  set<T = unknown>(key: string, value: T, source: string = 'unknown'): void {
    const previousValue = this.state.store[key];

    // Create state change event
    const event: StateChangeEvent = {
      key,
      value,
      previousValue,
      source,
      timestamp: Date.now(),
    };

    // Run middleware chain
    this.runMiddleware(event, () => {
      // Update the source before making changes
      this.state._meta.source = source;
      
      // Update state using Valtio proxy
      this.state.store[key] = value;
      this.state._meta.lastUpdate = Date.now();
      this.state._meta.updateCount++;

      // Notify key-specific listeners immediately
      const keyListenerSet = this.keyListeners.get(key);
      if (keyListenerSet && keyListenerSet.size > 0) {
        keyListenerSet.forEach((listener) => {
          try {
            listener(value, event);
          } catch (error) {
            console.error(`[UniversalStateManager] Error in listener for key "${key}":`, error);
          }
        });
      }
      
      // Notify global listeners immediately
      this.notifyGlobalListeners(event);

      // Persist to storage
      if (this.config.persistent && !this.isProcessingBroadcast) {
        this.saveToStorage(key, value);
      }

      // Broadcast to other tabs
      if (this.config.crossTab && this.broadcastChannel && !this.isProcessingBroadcast) {
        try {
          // Create a serializable version of the event
          const serializableEvent = {
            key: event.key,
            value: this.toSerializable(event.value),
            previousValue: this.toSerializable(event.previousValue),
            source: event.source,
            timestamp: event.timestamp,
          };
          
          this.broadcastChannel.postMessage({
            type: 'STATE_UPDATE',
            event: serializableEvent,
            instanceId: this.instanceId,
          });
        } catch (error) {
          console.warn('Failed to broadcast state update:', error);
        }
      }

      // Log to devtools
      this.logToDevtools('SET', event);
    });
  }

  delete(key: string): void {
    if (!(key in this.state.store)) return;

    const previousValue = this.state.store[key];
    delete this.state.store[key];
    
    this.state._meta.lastUpdate = Date.now();
    this.state._meta.updateCount++;
    this.state._meta.source = 'delete';

    const event: StateChangeEvent = {
      key,
      value: undefined,
      previousValue,
      source: 'delete',
      timestamp: Date.now(),
    };

    // Notify key-specific listeners immediately
    const keyListenerSet = this.keyListeners.get(key);
    if (keyListenerSet && keyListenerSet.size > 0) {
      keyListenerSet.forEach((listener) => {
        try {
          listener(undefined, event);
        } catch (error) {
          console.error(`[ValtioStateManager] Error in listener for key "${key}":`, error);
        }
      });
    }
    
    // Notify global listeners immediately
    this.notifyGlobalListeners(event);

    // Remove from storage
    if (this.config.persistent) {
      localStorage.removeItem(`${this.config.storagePrefix}:${key}`);
    }

    // Broadcast to other tabs
    if (this.config.crossTab && this.broadcastChannel && !this.isProcessingBroadcast) {
      try {
        const serializableEvent = {
          key: event.key,
          value: undefined,
          previousValue: this.toSerializable(event.previousValue),
          source: event.source,
          timestamp: event.timestamp,
        };
        
        this.broadcastChannel.postMessage({
          type: 'STATE_DELETE',
          event: serializableEvent,
          instanceId: this.instanceId,
        });
      } catch (error) {
        console.warn('Failed to broadcast state delete:', error);
      }
    }

    this.logToDevtools('DELETE', event);
  }

  clear(): void {
    const keys = Object.keys(this.state.store);
    const previousValues: Record<string, unknown> = {};
    
    // Store previous values for notifications
    keys.forEach(key => {
      previousValues[key] = this.state.store[key];
    });
    
    // Clear the store
    this.state.store = {};
    this.state._meta.lastUpdate = Date.now();
    this.state._meta.updateCount++;
    this.state._meta.source = 'clear';

    // Notify all key-specific listeners
    keys.forEach((key) => {
      const keyListenerSet = this.keyListeners.get(key);
      if (keyListenerSet && keyListenerSet.size > 0) {
        const event: StateChangeEvent = {
          key,
          value: undefined,
          previousValue: previousValues[key],
          source: 'clear',
          timestamp: Date.now(),
        };
        keyListenerSet.forEach((listener) => {
          try {
            listener(undefined, event);
          } catch (error) {
            console.error(`[UniversalStateManager] Error in listener for key "${key}":`, error);
          }
        });
        // Also notify global listeners for each key
        this.notifyGlobalListeners(event);
      }
    });

    // Clear storage
    if (this.config.persistent) {
      keys.forEach((key) => {
        localStorage.removeItem(`${this.config.storagePrefix}:${key}`);
      });
    }

    // Broadcast to other tabs
    if (this.config.crossTab && this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'STATE_CLEAR',
        instanceId: this.instanceId,
      });
    }

    this.logToDevtools('CLEAR', { keys });
  }

  subscribe<T = unknown>(key: string, listener: StateListener<T>): Unsubscribe {
    // Store listener for manual notification
    if (!this.keyListeners.has(key)) {
      this.keyListeners.set(key, new Set());
    }
    this.keyListeners.get(key)!.add(listener as StateListener);

    // Call immediately with current value if exists
    const currentValue = this.state.store[key] as T;
    if (currentValue !== undefined) {
      listener(currentValue, {
        key,
        value: currentValue,
        previousValue: currentValue,
        source: 'initial',
        timestamp: Date.now(),
      });
    }

    // Return unsubscribe function
    return () => {
      const keyListenerSet = this.keyListeners.get(key);
      if (keyListenerSet) {
        keyListenerSet.delete(listener as StateListener);
        if (keyListenerSet.size === 0) {
          this.keyListeners.delete(key);
        }
      }
    };
  }

  subscribeAll(listener: (event: StateChangeEvent) => void): Unsubscribe {
    this.globalListeners.add(listener);

    return () => {
      this.globalListeners.delete(listener);
    };
  }

  registerMFE(mfeId: string, metadata: any = {}): void {
    const mfeData: MFEMetadata = {
      id: mfeId,
      framework: metadata.framework || 'unknown',
      version: metadata.version || '0.0.0',
      registeredAt: Date.now(),
    };

    this.state.mfeRegistry[mfeId] = mfeData;
    this.set(`mfe:${mfeId}:registered`, true, 'system');

    this.logToDevtools('MFE_REGISTERED', mfeData);
  }

  unregisterMFE(mfeId: string): void {
    delete this.state.mfeRegistry[mfeId];

    // Clean up MFE-specific state
    const keysToRemove: string[] = [];
    Object.keys(this.state.store).forEach((key) => {
      if (key.startsWith(`mfe:${mfeId}:`)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => this.delete(key));

    this.logToDevtools('MFE_UNREGISTERED', { mfeId });
  }

  getSnapshot(): Record<string, any> {
    return snapshot(this.state.store);
  }

  restoreSnapshot(snapshot: Record<string, any>): void {
    this.clear();
    Object.entries(snapshot).forEach(([key, value]) => {
      this.set(key, value, 'snapshot');
    });
  }

  getAdapter(framework: string): any {
    // Note: This method is kept for backward compatibility but
    // it's recommended to import adapters directly from their modules
    console.warn(
      `getAdapter() is deprecated. Import adapters directly from '@mfe-toolkit/state' instead.`
    );
    
    switch (framework) {
      case 'react':
      case 'vue':
        throw new Error(
          `Please import ${framework} adapters directly: import { createValtio${
            framework.charAt(0).toUpperCase() + framework.slice(1)
          }Adapter } from '@mfe-toolkit/state'`
        );
      case 'vanilla':
      default:
        return this;
    }
  }

  // Public method to get the proxy store for direct Valtio usage
  getProxyStore(): Record<string, any> {
    return this.state.store;
  }
  
  // Batch multiple updates (useful for performance)
  batchUpdate(updates: Record<string, any>, source: string = 'batch'): void {
    // Update metadata once
    this.state._meta.source = source;
    this.state._meta.lastUpdate = Date.now();
    this.state._meta.updateCount++;
    
    // Apply all updates at once
    Object.entries(updates).forEach(([key, value]) => {
      const previousValue = this.state.store[key];
      this.state.store[key] = value;
      
      // Notify listeners for each key
      const event: StateChangeEvent = {
        key,
        value,
        previousValue,
        source,
        timestamp: Date.now(),
      };
      
      const keyListenerSet = this.keyListeners.get(key);
      if (keyListenerSet && keyListenerSet.size > 0) {
        keyListenerSet.forEach((listener) => {
          try {
            listener(value, event);
          } catch (error) {
            console.error(`[UniversalStateManager] Error in listener for key "${key}":`, error);
          }
        });
      }
      
      this.notifyGlobalListeners(event);
    });
    
    // Persist all at once if enabled
    if (this.config.persistent && !this.isProcessingBroadcast) {
      Object.entries(updates).forEach(([key, value]) => {
        this.saveToStorage(key, value);
      });
    }
  }
  
  // Check if a key exists in the store
  has(key: string): boolean {
    return key in this.state.store;
  }
  
  // Get all keys in the store
  keys(): string[] {
    return Object.keys(this.state.store);
  }
  
  // Get the size of the store
  size(): number {
    return Object.keys(this.state.store).length;
  }

  // Private methods

  private setupInternalSubscriptions(): void {
    // We're using direct synchronous notifications in set/delete/clear methods
    // No need for Valtio subscriptions at this level
  }

  private notifyGlobalListeners(event: StateChangeEvent): void {
    this.globalListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Global state listener error:', error);
      }
    });
    
    // Key-specific listeners are notified separately in set/delete/clear methods
    // Don't notify them here to avoid double notifications
  }

  private runMiddleware(event: StateChangeEvent, next: () => void): void {
    const middlewares = [...this.config.middleware];

    const runNext = (index: number) => {
      if (index >= middlewares.length) {
        next();
        return;
      }

      const middleware = middlewares[index];
      middleware(event, () => runNext(index + 1));
    };

    runNext(0);
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;

    const prefix = `${this.config.storagePrefix}:`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const stateKey = key.slice(prefix.length);
        try {
          const value = JSON.parse(localStorage.getItem(key)!);
          this.state.store[stateKey] = value;
        } catch (error) {
          console.warn(`Failed to parse stored value for ${stateKey}:`, error);
        }
      }
    }
  }

  private saveToStorage(key: string, value: any): void {
    if (typeof localStorage === 'undefined') return;

    const storageKey = `${this.config.storagePrefix}:${key}`;

    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to save ${key} to storage:`, error);
    }
  }

  private setupCrossTabSync(): void {
    this.broadcastChannel = new BroadcastChannel('mfe-state-sync');

    this.broadcastChannel.onmessage = (event) => {
      // Ignore our own messages
      if (event.data.instanceId === this.instanceId) return;

      this.isProcessingBroadcast = true;

      try {
        switch (event.data.type) {
          case 'STATE_UPDATE': {
            const stateEvent = event.data.event as StateChangeEvent;
            // Use ref to avoid triggering subscriptions during sync
            ref(this.state.store)[stateEvent.key] = stateEvent.value;
            
            // Notify key-specific listeners
            const keyListenerSet = this.keyListeners.get(stateEvent.key);
            if (keyListenerSet && keyListenerSet.size > 0) {
              const crossTabEvent = {
                ...stateEvent,
                source: `${stateEvent.source} (cross-tab)`,
              };
              keyListenerSet.forEach((listener) => {
                try {
                  listener(stateEvent.value, crossTabEvent);
                } catch (error) {
                  console.error(`[UniversalStateManager] Error in listener for key "${stateEvent.key}":`, error);
                }
              });
            }
            
            // Then trigger global subscriptions
            this.notifyGlobalListeners({
              ...stateEvent,
              source: `${stateEvent.source} (cross-tab)`,
            });
            break;
          }
          case 'STATE_DELETE': {
            const stateEvent = event.data.event as StateChangeEvent;
            delete ref(this.state.store)[stateEvent.key];
            this.notifyGlobalListeners({
              ...stateEvent,
              source: `${stateEvent.source} (cross-tab)`,
            });
            break;
          }
          case 'STATE_CLEAR': {
            Object.keys(ref(this.state.store)).forEach(key => {
              delete ref(this.state.store)[key];
            });
            break;
          }
        }
      } finally {
        this.isProcessingBroadcast = false;
      }
    };
  }

  private setupDevtools(): void {
    // Log state manager initialization for debugging
    if (this.config.devtools) {
      console.log('[UniversalStateManager] Initialized with Valtio implementation', {
        config: this.config,
        mfeCount: Object.keys(this.state.mfeRegistry).length,
        stateKeys: Object.keys(this.state.store).length
      });
    }
  }

  private logToDevtools(action: string, data: any): void {
    if (!this.config.devtools || typeof window === 'undefined') return;

    // Console logging for debugging
    console.log(`[UniversalStateManager] ${action}`, data);
  }

  private toSerializable(value: any): any {
    // Handle primitive values
    if (value === null || value === undefined) return value;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    // Handle dates
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => this.toSerializable(item));
    }

    // Handle plain objects
    if (typeof value === 'object' && value.constructor === Object) {
      const serialized: Record<string, any> = {};
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          try {
            serialized[key] = this.toSerializable(value[key]);
          } catch (e) {
            // Skip non-serializable properties
          }
        }
      }
      return serialized;
    }

    // For other types (functions, symbols, etc.), try JSON.stringify
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      // If all else fails, return a string representation
      return String(value);
    }
  }
}