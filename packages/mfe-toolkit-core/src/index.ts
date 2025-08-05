// Types
export * from './types';
export * from './types/events';

// Services
export { createLogger } from './services/logger';
export { createEventBus } from './services/event-bus';
export {
  createTypedEventBus,
  createCustomEventBus,
  TypedEventBusImpl,
  type TypedEventBus,
  type TypedEventHandler,
  type AnyEventHandler,
  type EventInterceptor,
  type TypedEventBusOptions,
  type EventBusStats,
} from './services/typed-event-bus';
export {
  createMigrationEventBus,
  EventBusMigrationAdapter,
  EventUsageAnalyzer,
  createAnalyzingEventBus,
  generateMigrationGuide,
} from './services/event-bus-migration';
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
export {
  ManifestMigrator,
  manifestMigrator,
  type MigrationResult,
  type RegistryMigrationResult,
} from './services/manifest-migrator';

// Utilities
export * from './utils';

// Note: React-specific exports have been moved to @mfe-toolkit/react
// This package now only contains framework-agnostic code

// Deprecated: Services are now injected directly into MFE mount functions
// No longer accessed via global window object
import type { MFEServices } from './types';

export const getMFEServices = (): MFEServices | undefined => {
  console.warn('getMFEServices() is deprecated. Services are now injected into mount functions.');
  return undefined;
};
