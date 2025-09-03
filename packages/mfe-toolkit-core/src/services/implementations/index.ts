/**
 * Service Implementations
 * Tree-shakable reference implementations for all services
 */

// Base Service Implementations (core infrastructure)
export { createConsoleLogger as createLogger } from './base/logger/console-logger';
export { ConsoleLogger } from './base/logger/console-logger';

export { createSimpleEventBus as createEventBus } from './base/event-bus/simple-event-bus';
export { SimpleEventBus } from './base/event-bus/simple-event-bus';
export { defaultEventBus } from './base/event-bus/simple-event-bus';
export { EventFlowDebugger } from './base/event-bus/simple-event-bus';

export { 
  DefaultErrorReporter,
  createErrorReporter,
  defaultErrorReporter 
} from './base/error-reporter/default-error-reporter';

// UI Service Implementations
export { modalServiceProvider } from './ui/modal/modal-provider';
export { ModalServiceImpl } from './ui/modal/modal-service';

export { notificationServiceProvider } from './ui/notification/notification-provider';
export { NotificationServiceImpl } from './ui/notification/notification-service';

// Auth Service Implementations  
export { authServiceProvider } from './auth/authentication/authentication-provider';
export { AuthServiceImpl } from './auth/authentication/authentication-service';

export { authzServiceProvider } from './auth/authorization/authorization-provider';
export { AuthzServiceImpl } from './auth/authorization/authorization-service';

// Platform Service Implementations
export { themeServiceProvider } from './platform/theme/theme-provider';
export { 
  ThemeServiceImpl,
  createThemeService,
  getThemeService,
  configureThemeService,
  createTheme
} from './platform/theme/theme-service';

export { analyticsServiceProvider } from './platform/analytics/analytics-provider';
export { AnalyticsServiceImpl } from './platform/analytics/analytics-service';