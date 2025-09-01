/**
 * State Management Domain Types
 * 
 * Defines the interface for state management across MFEs.
 * This is a domain type (data/behavior), not a service interface.
 */

/**
 * StateManager interface for cross-MFE state management
 * Matches the interface from @mfe-toolkit/state package
 */
export interface StateManager {
  // Core API
  get<T = any>(key: string): T | undefined;
  set<T = any>(key: string, value: T, source?: string): void;
  delete(key: string): void;
  clear(): void;

  // Subscription
  subscribe<T = any>(key: string, listener: (value: T | undefined) => void): () => void;
  subscribeAll(listener: (event: any) => void): () => void;

  // MFE management
  registerMFE(mfeId: string, metadata?: any): void;
  unregisterMFE(mfeId: string): void;

  // State snapshots
  getSnapshot(): Record<string, any>;
  restoreSnapshot(snapshot: Record<string, any>): void;
}