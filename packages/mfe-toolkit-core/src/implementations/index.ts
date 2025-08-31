/**
 * Service Implementations
 *
 * Reference implementations for all service interfaces.
 * These are tree-shakable - only what you import gets bundled.
 * Containers can use these as-is or replace with custom implementations.
 */

// Logger implementations
export {
  ConsoleLogger,
  createConsoleLogger,
  createConsoleLogger as createLogger,
} from './logger/console-logger';

// Event Bus implementations
export {
  SimpleEventBus,
  SimpleEventBus as EventBusImpl,
  createSimpleEventBus,
  createSimpleEventBus as createEventBus,
} from './event-bus/simple-event-bus';

// Error Reporter implementations
export {
  DefaultErrorReporter,
  createErrorReporter,
  createErrorReporter as getErrorReporter,
  type ErrorReporterConfig,
} from './error-reporter/default-error-reporter';
