/**
 * Service Implementations
 * 
 * Only includes the core Logger implementation.
 * All other service implementations have been extracted to their own packages.
 * 
 * Other service implementations are available via:
 * - @mfe-toolkit/service-event-bus
 * - @mfe-toolkit/service-modal
 * - @mfe-toolkit/service-notification
 * - @mfe-toolkit/service-auth
 * - @mfe-toolkit/service-authz
 * - @mfe-toolkit/service-theme
 * - @mfe-toolkit/service-analytics
 * - @mfe-toolkit/service-error-reporter
 */

// Core Logger Implementation (always included)
export { createConsoleLogger as createLogger } from './base/logger/console-logger';
export { ConsoleLogger } from './base/logger/console-logger';