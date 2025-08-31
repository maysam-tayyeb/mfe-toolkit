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

// Modal Service implementations
export {
  ModalServiceImpl,
  createModalService,
  createModalService as createModal,
} from './modal/modal-service';

export {
  createModalProvider,
  modalServiceProvider,
  type ModalProviderOptions,
} from './modal/modal-provider';

// Notification Service implementations
export {
  NotificationServiceImpl,
  createNotificationService,
  createNotificationService as createNotification,
} from './notification/notification-service';

export {
  createNotificationProvider,
  notificationServiceProvider,
} from './notification/notification-provider';

// Authentication Service implementations
export {
  AuthServiceImpl,
  createAuthService,
  createAuthService as createAuth,
} from './authentication/auth-service';

export {
  createAuthProvider,
  authServiceProvider,
  type AuthProviderOptions,
} from './authentication/auth-provider';

// Authorization Service implementations
export {
  AuthorizationServiceImpl,
  createAuthorizationService,
  createAuthorizationService as createAuthz,
} from './authorization/authorization-service';

export {
  createAuthorizationProvider,
  authorizationServiceProvider,
  type AuthorizationProviderOptions,
} from './authorization/authorization-provider';

// Theme Service implementations
export {
  ThemeServiceImpl,
  createThemeService,
  createThemeService as createTheme,
} from './theme/theme-service';

export {
  createThemeProvider,
  themeServiceProvider,
  type ThemeProviderOptions,
} from './theme/theme-provider';

// Analytics Service implementations
export {
  AnalyticsServiceImpl,
  createAnalyticsService,
  createAnalyticsService as createAnalytics,
} from './analytics/analytics-service';

export {
  createAnalyticsProvider,
  analyticsServiceProvider,
  type AnalyticsProviderOptions,
} from './analytics/analytics-provider';
