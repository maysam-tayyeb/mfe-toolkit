/**
 * Service Type Definitions
 * 
 * Central location for all service interface definitions.
 * These interfaces define the contracts that service implementations must follow.
 */

// Core services
export type { Logger } from './logger';
export { LOGGER_SERVICE_KEY } from './logger';

export type { EventBus, EventPayload } from './event-bus';
export { EVENT_BUS_SERVICE_KEY } from './event-bus';

// Import and re-export other service types from the main types directory
// These will be moved here in Phase 3
export type { ErrorReporter, ErrorReport, ErrorSeverity } from '../../types/error-reporter';
export type { ModalService, ModalConfig } from '../../types/modal';
export type { NotificationService, NotificationConfig } from '../../types/notification';
export type { AuthService, AuthSession, AuthConfig, LoginCredentials } from '../../types/authentication';
export { AUTH_SERVICE_KEY } from '../../types/authentication';
export type { AuthorizationService, AuthorizationConfig, AuthorizationContext, Policy, ResourceAccess } from '../../types/authorization';
export { AUTHZ_SERVICE_KEY } from '../../types/authorization';
export type { Theme, ThemeService } from '../../types/theme';
export { THEME_SERVICE_KEY } from '../../types/theme';
export type { AnalyticsService, AnalyticsEvent, AnalyticsConfig } from '../../types/analytics';
export { ANALYTICS_SERVICE_KEY } from '../../types/analytics';