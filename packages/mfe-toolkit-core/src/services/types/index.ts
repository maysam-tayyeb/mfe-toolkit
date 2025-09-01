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

export type { ErrorReporter, ErrorReport, ErrorSeverity } from './error-reporter';

// UI services
export type { ModalService, ModalConfig } from './modal';
export type { NotificationService, NotificationConfig } from './notification';

// Auth services
export type { AuthService, AuthSession, AuthConfig, LoginCredentials } from './authentication';
export { AUTH_SERVICE_KEY } from './authentication';
export type { AuthorizationService, AuthorizationConfig, AuthorizationContext, Policy, ResourceAccess } from './authorization';
export { AUTHZ_SERVICE_KEY } from './authorization';

// Platform services
export type { Theme, ThemeService } from './theme';
export { THEME_SERVICE_KEY } from './theme';
export type { AnalyticsService, AnalyticsEvent, AnalyticsConfig } from './analytics';
export { ANALYTICS_SERVICE_KEY } from './analytics';