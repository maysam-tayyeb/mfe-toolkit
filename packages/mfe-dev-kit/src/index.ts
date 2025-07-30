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

// State Management
export * from './state/mfe-store-factory';
export * from './state/mfe-store-hooks';

// Components
export { MFELoader } from './components/MFELoader';
export { MFEPage } from './components/MFEPage';
export { MFEErrorBoundary, withMFEErrorBoundary } from './components/MFEErrorBoundary';

// Utility function to get services from window
import { MFEServices, MFEWindow } from './types';

export const getMFEServices = (): MFEServices | undefined => {
  return (window as MFEWindow).__MFE_SERVICES__;
};
