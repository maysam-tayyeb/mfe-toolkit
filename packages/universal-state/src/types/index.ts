export interface StateChangeEvent {
  key: string;
  value: any;
  previousValue: any;
  source: string;
  timestamp: number;
}

export type StateListener = (value: any, event: StateChangeEvent) => void;
export type Unsubscribe = () => void;

export interface StateManager {
  // Core API
  get(key: string): any;
  set(key: string, value: any, source?: string): void;
  delete(key: string): void;
  clear(): void;

  // Subscription
  subscribe(key: string, listener: StateListener): Unsubscribe;
  subscribeAll(listener: (event: StateChangeEvent) => void): Unsubscribe;

  // MFE management
  registerMFE(mfeId: string, metadata?: any): void;
  unregisterMFE(mfeId: string): void;

  // State snapshots
  getSnapshot(): Record<string, any>;
  restoreSnapshot(snapshot: Record<string, any>): void;

  // Framework adapters
  getAdapter(framework: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla'): any;
}

export interface MFEMetadata {
  id: string;
  framework: string;
  version: string;
  registeredAt: number;
}

export interface StateManagerConfig {
  // Enable localStorage persistence
  persistent?: boolean;

  // Storage key prefix
  storagePrefix?: string;

  // Enable cross-tab synchronization
  crossTab?: boolean;

  // Enable devtools
  devtools?: boolean;

  // Initial state
  initialState?: Record<string, any>;

  // State change middleware
  middleware?: StateMiddleware[];
}

export type StateMiddleware = (event: StateChangeEvent, next: () => void) => void;
