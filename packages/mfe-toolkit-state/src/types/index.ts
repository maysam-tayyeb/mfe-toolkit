// Generic state value type
export type StateValue = unknown;

// Generic state key type for better type safety
export type StateKey = string;

// State change event with proper typing
export interface StateChangeEvent<T = StateValue> {
  key: StateKey;
  value: T;
  previousValue: T;
  source: string;
  timestamp: number;
  type: 'set' | 'delete' | 'clear';
}

// Listener types with proper generic constraints
export type StateListener<T = StateValue> = (value: T, event: StateChangeEvent<T>) => void;
export type GlobalStateListener = (event: StateChangeEvent) => void;
export type Unsubscribe = () => void;

// State setter function type
export type StateSetter<T = StateValue> = (value: T) => void;

// State hook return type
export type StateHookReturn<T = StateValue> = [T | undefined, StateSetter<T>];

export interface StateManager {
  // Core API
  get<T = StateValue>(key: StateKey): T | undefined;
  set<T = StateValue>(key: StateKey, value: T, source?: string): void;
  delete(key: string): void;
  clear(): void;

  // Subscription
  subscribe<T = StateValue>(key: StateKey, listener: StateListener<T>): Unsubscribe;
  subscribeAll(listener: GlobalStateListener): Unsubscribe;

  // MFE management
  registerMFE(mfeId: string, metadata?: MFERegistrationMetadata): void;
  unregisterMFE(mfeId: string): void;

  // State snapshots
  getSnapshot(): Record<StateKey, StateValue>;
  restoreSnapshot(snapshot: Record<StateKey, StateValue>): void;

  // Framework adapters
  getAdapter(framework: SupportedFramework): FrameworkAdapter;
}

// Framework types
export type SupportedFramework = 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla';

// MFE registration metadata
export interface MFERegistrationMetadata {
  framework?: SupportedFramework;
  version?: string;
  [key: string]: unknown;
}

export interface MFEMetadata {
  id: string;
  framework: SupportedFramework;
  version: string;
  registeredAt: number;
  metadata?: MFERegistrationMetadata;
}

// Framework adapter interface
export interface FrameworkAdapter {
  name: SupportedFramework;
  // Each adapter will have its own specific methods
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
  initialState?: Record<StateKey, StateValue>;

  // State change middleware
  middleware?: StateMiddleware[];
}

export type StateMiddleware = (event: StateChangeEvent, next: () => void) => void;
