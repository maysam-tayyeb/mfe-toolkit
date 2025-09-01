/**
 * Service Implementations
 * Tree-shakable reference implementations for all services
 */

// Core Service Implementations
export { createConsoleLogger as createLogger } from './core/logger/console-logger';
export { ConsoleLogger } from './core/logger/console-logger';

export { createSimpleEventBus as createEventBus } from './core/event-bus/simple-event-bus';
export { SimpleEventBus } from './core/event-bus/simple-event-bus';

export { 
  DefaultErrorReporter,
  createErrorReporter,
  getErrorReporter 
} from './core/error-reporter/default-error-reporter';

// UI Service Implementations
export { modalServiceProvider } from './ui/modal/modal-provider';
export { ModalServiceImpl } from './ui/modal/modal-service';

export { notificationServiceProvider } from './ui/notification/notification-provider';
export { NotificationServiceImpl } from './ui/notification/notification-service';

// Auth Service Implementations  
export { authServiceProvider } from './auth/authentication/authentication-provider';
export { AuthServiceImpl } from './auth/authentication/authentication-service';

export { authorizationServiceProvider } from './auth/authorization/authorization-provider';
export { AuthorizationServiceImpl } from './auth/authorization/authorization-service';

// Platform Service Implementations
export { themeServiceProvider } from './platform/theme/theme-provider';
export { ThemeServiceImpl } from './platform/theme/theme-service';

export { analyticsServiceProvider } from './platform/analytics/analytics-provider';
export { AnalyticsServiceImpl } from './platform/analytics/analytics-service';