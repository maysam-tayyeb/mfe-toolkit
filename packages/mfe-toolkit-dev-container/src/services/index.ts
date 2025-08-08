/**
 * MFE Development Container Services
 * Provides all container services for MFE development
 */

import {
  EventBus,
  Logger,
  ErrorReporter,
  ServiceContainer,
  createTypedEventBus,
} from '@mfe-toolkit/core';
import type { MFEServices, AuthService, ThemeService } from '@mfe-toolkit/core';

// Import individual service implementations
import { DevModalService } from './modal-service';
import { DevNotificationService } from './notification-service';
import { DevAuthService } from './auth-service';
import { DevThemeService } from './theme-service';
import { DevStateManager } from './state-service';

export interface DevContainerConfig {
  framework?: string;
  mockAuth?: boolean | AuthMockConfig;
  theme?: 'light' | 'dark' | 'auto';
  enableLogger?: boolean;
  enableErrorReporter?: boolean;
}

export interface AuthMockConfig {
  isAuthenticated: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  roles?: string[];
  permissions?: string[];
}

/**
 * Create all services for the dev container
 */
export function createDevServices(config: DevContainerConfig = {}): MFEServices {
  // Core services
  const logger = new Logger({
    prefix: '[MFE-DEV]',
    level: config.enableLogger !== false ? 'debug' : 'warn',
  });

  const eventBus = createTypedEventBus();
  const errorReporter = new ErrorReporter();

  // UI Services
  const modal = new DevModalService();
  const notification = new DevNotificationService();

  // Auth Service with mocking
  const auth = new DevAuthService(config.mockAuth);

  // Theme Service
  const theme = new DevThemeService(config.theme || 'light');

  // State Manager
  const stateManager = new DevStateManager();

  // Create service container
  const serviceContainer = new ServiceContainer();

  // Register all services
  serviceContainer.register('logger', logger);
  serviceContainer.register('eventBus', eventBus);
  serviceContainer.register('errorReporter', errorReporter);
  serviceContainer.register('modal', modal);
  serviceContainer.register('notification', notification);
  serviceContainer.register('auth', auth);
  serviceContainer.register('theme', theme);
  serviceContainer.register('stateManager', stateManager);

  // Return services object for MFE injection
  return {
    logger,
    eventBus,
    errorReporter,
    modal,
    notification,
    auth,
    theme,
    stateManager,
    // Utility function to get all services
    getService: (name: string) => serviceContainer.get(name),
  } as MFEServices;
}

/**
 * Initialize dev container services and attach to window for debugging
 * Note: This is ONLY for dev container debugging, not for production!
 */
export function initializeDevContainer(config: DevContainerConfig = {}): MFEServices {
  const services = createDevServices(config);

  // Attach to window ONLY in dev mode for debugging
  if (process.env.NODE_ENV === 'development') {
    (window as any).__DEV_SERVICES__ = services;
    (window as any).__DEV_CONFIG__ = config;
  }

  return services;
}

// Re-export individual services
export { DevModalService } from './modal-service';
export { DevNotificationService } from './notification-service';
export { DevAuthService } from './auth-service';
export { DevThemeService } from './theme-service';
export { DevStateManager } from './state-service';
