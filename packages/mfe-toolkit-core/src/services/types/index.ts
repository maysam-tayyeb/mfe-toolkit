/**
 * Service Type Definitions
 *
 * Central location for all service interface definitions.
 * These interfaces define the contracts that service implementations must follow.
 */

// Core services
export type { Logger } from './logger';
export { LOGGER_SERVICE_KEY } from './logger';

export type { EventBus, EventHandler, TypedEventHandler } from './event-bus';
export {
  EVENT_BUS_SERVICE_KEY,
  isEventPayload,
  EventBusAdapter,
  TypedEventEmitter,
  EventValidators,
} from './event-bus';

export type { ErrorReporter, ErrorReport } from './error-reporter';

// UI services
export type { ModalService, BaseModalConfig, ModalStackEntry } from './modal';
export { MODAL_SERVICE_KEY } from './modal';
export type { NotificationType, NotificationService, NotificationConfig } from './notification';
export { NOTIFICATION_SERVICE_KEY } from './notification';

// Auth services
export type {
  AuthService,
  AuthSession,
  AuthConfig,
  LoginCredentials,
} from './authentication';
export { AUTH_SERVICE_KEY } from './authentication';
export type {
  AuthzService,
  AuthorizationConfig,
  AuthorizationContext,
  Policy,
  ResourceAccess,
} from './authorization';
export { AUTHZ_SERVICE_KEY } from './authorization';

// Platform services
export type { Theme, ThemeService } from './theme';
export { THEME_SERVICE_KEY } from './theme';
export type { AnalyticsService, AnalyticsEvent, AnalyticsConfig } from './analytics';
export { ANALYTICS_SERVICE_KEY } from './analytics';
