// Re-export manifest types
export type {
  MFEManifest,
  MFERegistry,
  MFEDependencies,
  MFECompatibility,
  MFECapabilities,
  MFERequirements,
  MFEMetadata,
  MFEConfig,
  MFESecurity,
  MFELifecycle,
} from './manifest';

// Error reporter types are now exported from ./types/error-reporter
// No need to re-export here to avoid conflicts

// Define StateManager interface (matches @mfe-toolkit/state)
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
