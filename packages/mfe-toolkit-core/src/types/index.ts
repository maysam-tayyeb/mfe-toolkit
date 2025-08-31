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

// Re-export authentication types
export type {
  AuthService,
  AuthSession,
  AuthConfig,
  LoginCredentials,
} from './authentication';
export { AUTH_SERVICE_KEY } from './authentication';

// Re-export authorization types
export type {
  AuthorizationService,
  AuthorizationConfig,
  AuthorizationContext,
  Policy,
  ResourceAccess,
} from './authorization';
export { AUTHZ_SERVICE_KEY } from './authorization';

// Re-export theme types
export type {
  Theme,
  ThemeService,
} from './theme';
export { THEME_SERVICE_KEY } from './theme';

// Re-export analytics types
export type {
  AnalyticsService,
  AnalyticsEvent,
  AnalyticsConfig,
} from './analytics';
export { ANALYTICS_SERVICE_KEY } from './analytics';

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
