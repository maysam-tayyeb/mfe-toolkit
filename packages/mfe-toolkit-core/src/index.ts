// Service Registry (New Architecture)
export * from './services/registry';

// Types (Legacy - to be removed)
export * from './types/events';
export type { MFEModule } from './types/mfe-module';

// Services
export { createLogger } from './services/logger';
export {
  createEventBus,
  createCustomEventBus,
  EventBusImpl,
  type EventBusExtended,
  type EventHandler,
  type AnyEventHandler,
  type EventInterceptor,
  type EventBusOptions,
  type EventBusStats,
} from './services/event-bus';
export {
  createMFERegistry,
  MFERegistryService,
  type RegistryConfig,
  type RegistryOptions,
} from './services/mfe-registry';
export {
  ErrorReporter,
  getErrorReporter,
  type ErrorReport,
  type ErrorReporterConfig,
} from './services/error-reporter';
export {
  ManifestValidator,
  manifestValidator,
  type ValidationResult,
} from './services/manifest-validator';

// Utilities
export * from './utils';
