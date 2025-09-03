/**
 * Service Type Definitions
 *
 * Only includes the core Logger service.
 * All other services have been extracted to their own packages.
 * 
 * Other services are available via:
 * - @mfe-toolkit/service-event-bus
 * - @mfe-toolkit/service-modal
 * - @mfe-toolkit/service-notification
 * - @mfe-toolkit/service-auth
 * - @mfe-toolkit/service-authz
 * - @mfe-toolkit/service-theme
 * - @mfe-toolkit/service-analytics
 * - @mfe-toolkit/service-error-reporter
 */

// Core service - always included
export type { Logger } from './logger';
export { LOGGER_SERVICE_KEY } from './logger';
