import {
  StateManager,
  StateListener,
  StateChangeEvent,
  Unsubscribe,
  MFEMetadata,
  StateManagerConfig,
} from '../types';

export class UniversalStateManager implements StateManager {
  private state = new Map<string, any>();
  private listeners = new Map<string, Set<StateListener>>();
  private globalListeners = new Set<(event: StateChangeEvent) => void>();
  private mfeRegistry = new Map<string, MFEMetadata>();
  private config: Required<StateManagerConfig>;
  private broadcastChannel?: BroadcastChannel;

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

    // Initialize with provided state
    Object.entries(this.config.initialState).forEach(([key, value]) => {
      this.state.set(key, value);
    });

    // Load from localStorage if persistent
    if (this.config.persistent) {
      this.loadFromStorage();
    }

    // Setup cross-tab synchronization
    if (this.config.crossTab && typeof BroadcastChannel !== 'undefined') {
      this.setupCrossTabSync();
    }

    // Setup devtools
    if (this.config.devtools && typeof window !== 'undefined') {
      this.setupDevtools();
    }
  }

  get(key: string): any {
    return this.state.get(key);
  }

  set(key: string, value: any, source: string = 'unknown'): void {
    const previousValue = this.state.get(key);

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
      // Update state
      this.state.set(key, value);

      // Persist to storage
      if (this.config.persistent) {
        this.saveToStorage(key, value);
      }

      // Notify listeners
      this.notifyListeners(event);

      // Broadcast to other tabs
      if (this.config.crossTab && this.broadcastChannel) {
        this.broadcastChannel.postMessage(event);
      }

      // Log to devtools
      this.logToDevtools('SET', event);
    });
  }

  delete(key: string): void {
    if (!this.state.has(key)) return;

    const previousValue = this.state.get(key);
    this.state.delete(key);

    const event: StateChangeEvent = {
      key,
      value: undefined,
      previousValue,
      source: 'delete',
      timestamp: Date.now(),
    };

    // Remove from storage
    if (this.config.persistent) {
      localStorage.removeItem(`${this.config.storagePrefix}:${key}`);
    }

    // Notify listeners
    this.notifyListeners(event);

    // Broadcast to other tabs
    if (this.config.crossTab && this.broadcastChannel) {
      this.broadcastChannel.postMessage(event);
    }

    this.logToDevtools('DELETE', event);
  }

  clear(): void {
    const keys = Array.from(this.state.keys());
    this.state.clear();

    // Clear storage
    if (this.config.persistent) {
      keys.forEach((key) => {
        localStorage.removeItem(`${this.config.storagePrefix}:${key}`);
      });
    }

    // Notify all listeners
    keys.forEach((key) => {
      const event: StateChangeEvent = {
        key,
        value: undefined,
        previousValue: undefined,
        source: 'clear',
        timestamp: Date.now(),
      };
      this.notifyListeners(event);
    });

    this.logToDevtools('CLEAR', { keys });
  }

  subscribe(key: string, listener: StateListener): Unsubscribe {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    const keyListeners = this.listeners.get(key)!;
    keyListeners.add(listener);

    // Call immediately with current value if exists
    const currentValue = this.state.get(key);
    if (currentValue !== undefined) {
      listener(currentValue, {
        key,
        value: currentValue,
        previousValue: undefined,
        source: 'initial',
        timestamp: Date.now(),
      });
    }

    // Return unsubscribe function
    return () => {
      keyListeners.delete(listener);
      if (keyListeners.size === 0) {
        this.listeners.delete(key);
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

    this.mfeRegistry.set(mfeId, mfeData);
    this.set(`mfe:${mfeId}:registered`, true, 'system');

    this.logToDevtools('MFE_REGISTERED', mfeData);
  }

  unregisterMFE(mfeId: string): void {
    this.mfeRegistry.delete(mfeId);

    // Clean up MFE-specific state
    const keysToRemove: string[] = [];
    this.state.forEach((_, key) => {
      if (key.startsWith(`mfe:${mfeId}:`)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => this.delete(key));

    this.logToDevtools('MFE_UNREGISTERED', { mfeId });
  }

  getSnapshot(): Record<string, any> {
    const snapshot: Record<string, any> = {};
    this.state.forEach((value, key) => {
      snapshot[key] = value;
    });
    return snapshot;
  }

  restoreSnapshot(snapshot: Record<string, any>): void {
    this.clear();
    Object.entries(snapshot).forEach(([key, value]) => {
      this.set(key, value, 'snapshot');
    });
  }

  getAdapter(framework: string): any {
    switch (framework) {
      case 'react':
        return import('../adapters/react').then((m) => new m.ReactAdapter(this));
      case 'vue':
        return import('../adapters/vue').then((m) => new m.VueAdapter(this));
      case 'vanilla':
      default:
        return this;
    }
  }

  // Private methods

  private notifyListeners(event: StateChangeEvent): void {
    // Notify key-specific listeners
    const keyListeners = this.listeners.get(event.key);
    if (keyListeners) {
      keyListeners.forEach((listener) => {
        try {
          listener(event.value, event);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    }

    // Notify global listeners
    this.globalListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Global state listener error:', error);
      }
    });
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
          this.state.set(stateKey, value);
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
      const stateEvent = event.data as StateChangeEvent;

      // Update local state without triggering another broadcast
      this.state.set(stateEvent.key, stateEvent.value);

      // Notify local listeners
      this.notifyListeners({
        ...stateEvent,
        source: `${stateEvent.source} (cross-tab)`,
      });
    };
  }

  private setupDevtools(): void {
    // Expose state manager to window for debugging
    (window as any).__MFE_STATE__ = {
      manager: this,
      getState: () => this.getSnapshot(),
      setState: (key: string, value: any) => this.set(key, value, 'devtools'),
      subscribe: (key: string, callback: Function) =>
        this.subscribe(key, callback as StateListener),
      mfes: () => Array.from(this.mfeRegistry.values()),
    };
  }

  private logToDevtools(action: string, data: any): void {
    if (!this.config.devtools || typeof window === 'undefined') return;

    // Send to Redux DevTools if available
    const devtools = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
    if (devtools) {
      devtools.send(
        {
          type: `@@mfe-state/${action}`,
          payload: data,
        },
        this.getSnapshot()
      );
    }

    // Also log to console in development
    if (this.config.devtools) {
      console.log(`[MFE State] ${action}`, data);
    }
  }
}
