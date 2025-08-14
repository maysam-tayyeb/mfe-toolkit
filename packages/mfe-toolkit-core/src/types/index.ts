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

// Re-export error reporter types
export type { ErrorReport } from '../services/error-reporter';
export { ErrorReporter } from '../services/error-reporter';
import type { ErrorReporter as ErrorReporterType } from '../services/error-reporter';

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

export interface AuthSession {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
}

export interface EventPayload<T = any> {
  type: string;
  data: T;
  timestamp: number;
  source: string;
}

// Generic modal config that can be extended by framework-specific implementations
export interface BaseModalConfig<TContent = any> {
  title: string;
  content: TContent;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClose?: () => void;
  onConfirm?: () => void;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export interface NotificationConfig {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

export interface MFEServices<TModalConfig = BaseModalConfig> {
  logger: Logger;
  auth: AuthService;
  eventBus: EventBus;
  modal: ModalService<TModalConfig>;
  notification: NotificationService;
  stateManager?: StateManager;
  errorReporter?: ErrorReporterType;
  theme?: ThemeService;
}

export interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

export interface AuthService {
  getSession: () => AuthSession | null;
  isAuthenticated: () => boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

export interface EventBus {
  emit: <T = any>(event: string, payload: T) => void;
  on: <T = any>(event: string, handler: (payload: EventPayload<T>) => void) => () => void;
  off: (event: string, handler: (payload: EventPayload<any>) => void) => void;
  once: <T = any>(event: string, handler: (payload: EventPayload<T>) => void) => void;
}

export interface ModalService<TModalConfig = BaseModalConfig> {
  open: (config: TModalConfig) => void;
  close: () => void;
}

export interface NotificationService {
  show: (config: NotificationConfig) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

export type Theme = string; // Allow any string for flexibility

export interface ThemeService {
  getTheme: () => Theme;
  setTheme: (theme: Theme) => void;
  subscribe: (callback: (theme: Theme) => void) => () => void;
  getAvailableThemes?: () => Theme[]; // Optional: List available themes
  cycleTheme?: () => void; // Optional: Cycle to next theme
}

// Legacy MFEModule replaced by MFEModuleV2 - see types/mfe-module.ts
