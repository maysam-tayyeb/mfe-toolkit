// Service Registry (New Architecture)
export * from './services/registry';

// Types
export * from './types/events';
export * from './types';
export * from './types/error-reporter';

// Service Implementations (DEPRECATED - Will be removed in v2.0.0)
// These implementations should be provided by containers, not packages
/**
 * @deprecated Use container-provided logger implementation instead
 * Will be removed in @mfe-toolkit/core v2.0.0
 */
export { createLogger } from './services/logger';

/**
 * @deprecated Use container-provided event bus implementation instead
 * Will be removed in @mfe-toolkit/core v2.0.0
 */
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

// MFE Registry (Not deprecated - this is configuration, not a service)
export {
  createMFERegistry,
  MFERegistryService,
  type RegistryConfig,
  type RegistryOptions,
} from './services/mfe-registry';

/**
 * @deprecated Use container-provided error reporter implementation instead
 * Will be removed in @mfe-toolkit/core v2.0.0
 */
export {
  ErrorReporter,
  getErrorReporter,
  type ErrorReporterConfig,
} from './services/error-reporter';
export {
  ManifestValidator,
  manifestValidator,
  type ValidationResult,
} from './services/manifest-validator';

// Utilities
export * from './utils';
