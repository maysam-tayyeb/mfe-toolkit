/**
 * Unified Service Container
 * Provides all services to both React components and MFEs with minimal abstraction
 */

import {
  ServiceContainer,
  ServiceMap,
  ServiceInfo,
  createLogger,
  createErrorReporter,
  type Logger,
  type ModalService,
  type BaseModalConfig,
  type NotificationService,
  type NotificationConfig,
  type AuthService,
  type AuthzService,
  type ResourceAccess,
} from '@mfe-toolkit/core';
import { createPlatformEventBus } from './platform-event-bus';
import { getThemeService } from './theme-service';
import { createPinoLogger } from './pino-logger';

// All service types are now in core - no need for separate type augmentation imports

// Context values that will be injected by React
export interface ReactContextValues {
  auth: {
    session: {
      userId: string;
      username: string;
      email: string;
      roles: string[];
      permissions: string[];
      isAuthenticated: boolean;
    } | null;
  };
  ui: {
    openModal: (config: BaseModalConfig) => void;
    closeModal: () => void;
    addNotification: (config: NotificationConfig) => void;
  };
}

/**
 * Creates authentication service that reads from React context values
 */
function createAuthService(getContextValues: () => ReactContextValues): AuthService {
  return {
    getSession: () => {
      const { auth } = getContextValues();
      return auth.session;
    },
    isAuthenticated: () => {
      const { auth } = getContextValues();
      return auth.session?.isAuthenticated ?? false;
    },
  };
}

/**
 * Creates authorization service that reads from React context values
 */
function createAuthzService(getContextValues: () => ReactContextValues): AuthzService {
  return {
    hasPermission: (permission: string) => {
      const { auth } = getContextValues();
      return auth.session?.permissions?.includes(permission) ?? false;
    },
    hasAnyPermission: (permissions: string[]) => {
      const { auth } = getContextValues();
      return permissions.some((p) => auth.session?.permissions?.includes(p)) ?? false;
    },
    hasAllPermissions: (permissions: string[]) => {
      const { auth } = getContextValues();
      return permissions.every((p) => auth.session?.permissions?.includes(p)) ?? false;
    },
    hasRole: (role: string) => {
      const { auth } = getContextValues();
      return auth.session?.roles?.includes(role) ?? false;
    },
    hasAnyRole: (roles: string[]) => {
      const { auth } = getContextValues();
      return roles.some((r) => auth.session?.roles?.includes(r)) ?? false;
    },
    hasAllRoles: (roles: string[]) => {
      const { auth } = getContextValues();
      return roles.every((r) => auth.session?.roles?.includes(r)) ?? false;
    },
    canAccess: (resource: string, action: string) => {
      const { auth } = getContextValues();
      const permission = `${resource}:${action}`;
      return auth.session?.permissions?.includes(permission) ?? false;
    },
    canAccessAny: (resources: ResourceAccess[]) => {
      const { auth } = getContextValues();
      return (
        resources.some((r) =>
          r.actions.some((action) => {
            const permission = `${r.resource}:${action}`;
            return auth.session?.permissions?.includes(permission);
          })
        ) ?? false
      );
    },
    canAccessAll: (resources: ResourceAccess[]) => {
      const { auth } = getContextValues();
      return (
        resources.every((r) =>
          r.actions.every((action) => {
            const permission = `${r.resource}:${action}`;
            return auth.session?.permissions?.includes(permission);
          })
        ) ?? false
      );
    },
    getPermissions: () => {
      const { auth } = getContextValues();
      return auth.session?.permissions ?? [];
    },
    getRoles: () => {
      const { auth } = getContextValues();
      return auth.session?.roles ?? [];
    },
  };
}

/**
 * Creates modal service that calls React context methods
 */
function createModalService(getContextValues: () => ReactContextValues): ModalService {
  return {
    open: (config: BaseModalConfig) => {
      const { ui } = getContextValues();
      ui.openModal(config);
      return `modal-${Date.now()}`;
    },
    close: () => {
      const { ui } = getContextValues();
      ui.closeModal();
    },
  };
}

// Singleton logger for notification service
const notificationLogger = createLogger('NotificationService');

/**
 * Creates notification service that calls React context methods
 */
function createNotificationService(
  getContextValues: () => ReactContextValues
): NotificationService {
  const show = (config: NotificationConfig) => {
    const { ui } = getContextValues();
    ui.addNotification(config);
    return `notification-${Date.now()}`;
  };

  return {
    show,
    success: (title: string, message?: string) => show({ type: 'success', title, message }),
    error: (title: string, message?: string) => show({ type: 'error', title, message }),
    warning: (title: string, message?: string) => show({ type: 'warning', title, message }),
    info: (title: string, message?: string) => show({ type: 'info', title, message }),
    dismiss: (_id: string) => {
      // TODO: Implement dismiss functionality in UIContext
      notificationLogger.warn('NotificationService.dismiss not yet implemented');
    },
    dismissAll: () => {
      // TODO: Implement dismissAll functionality in UIContext
      notificationLogger.warn('NotificationService.dismissAll not yet implemented');
    },
  };
}

/**
 * Unified Service Container Implementation
 */
export class UnifiedServiceContainer implements ServiceContainer {
  private services = new Map<string, unknown>();
  private contextValues: ReactContextValues | null = null;
  private eventBus = createPlatformEventBus();
  private logger: Logger;
  private themeService = getThemeService();
  
  constructor(options?: { usePinoLogger?: boolean }) {
    // Demonstrate logger override capability
    if (options?.usePinoLogger) {
      // Use Pino logger for structured logging
      this.logger = createPinoLogger('ServiceContainer', {
        level: 'debug',
        transport: process.env.NODE_ENV === 'development' ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname'
          }
        } : undefined
      });
      this.logger.info('Using Pino logger for enhanced logging capabilities');
    } else {
      // Use default console logger
      this.logger = createLogger('ServiceContainer');
    }
  }

  /**
   * Update React context values
   */
  setContextValues(values: ReactContextValues) {
    this.contextValues = values;
  }

  /**
   * Get current context values with fallback
   */
  private getContextValues(): ReactContextValues {
    if (!this.contextValues) {
      this.logger.warn('Service accessed before React contexts are initialized');
      return {
        auth: { session: null },
        ui: {
          openModal: () => this.logger.warn('Modal service not ready'),
          closeModal: () => this.logger.warn('Modal service not ready'),
          addNotification: () => this.logger.warn('Notification service not ready'),
        },
      };
    }
    return this.contextValues;
  }

  /**
   * Get or create a service
   */
  private getOrCreateService(name: string): unknown {
    // Check cache first
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    let service: unknown;

    switch (name) {
      case 'logger':
        service = this.logger;
        break;
      case 'auth':
        service = createAuthService(() => this.getContextValues());
        break;
      case 'authz':
        service = createAuthzService(() => this.getContextValues());
        break;
      case 'eventBus':
        service = this.eventBus;
        break;
      case 'modal':
        service = createModalService(() => this.getContextValues());
        break;
      case 'notification':
        service = createNotificationService(() => this.getContextValues());
        break;
      case 'theme':
        service = this.themeService;
        break;
      case 'errorReporter':
        service = createErrorReporter(
          {
            enableConsoleLog: true,
            maxErrorsPerSession: 100,
          },
          this
        );
        break;
      default:
        return undefined;
    }

    // Cache the service
    if (service !== undefined) {
      this.services.set(name, service);
    }

    return service;
  }

  // ServiceContainer interface implementation
  get<K extends keyof ServiceMap>(name: K): ServiceMap[K] | undefined;
  get(name: string): unknown | undefined;
  get(name: string): unknown | undefined {
    return this.getOrCreateService(name);
  }

  require<K extends keyof ServiceMap>(name: K): ServiceMap[K];
  require(name: string): unknown;
  require(name: string): unknown {
    const service = this.get(name);
    if (!service) {
      throw new Error(`Required service '${name}' not found`);
    }
    return service;
  }

  has(name: string): boolean {
    const knownServices = [
      'logger',
      'auth',
      'authz',
      'eventBus',
      'modal',
      'notification',
      'theme',
      'errorReporter',
    ];
    return knownServices.includes(name);
  }

  listAvailable(): ServiceInfo[] {
    return [
      { name: 'logger', version: '1.0.0', status: 'ready' },
      { name: 'auth', version: '1.0.0', status: 'ready' },
      { name: 'authz', version: '1.0.0', status: 'ready' },
      { name: 'eventBus', version: '1.0.0', status: 'ready' },
      { name: 'modal', version: '1.0.0', status: 'ready' },
      { name: 'notification', version: '1.0.0', status: 'ready' },
      { name: 'theme', version: '1.0.0', status: 'ready' },
      { name: 'errorReporter', version: '1.0.0', status: 'ready' },
    ];
  }

  getAllServices(): ServiceMap {
    const services: Partial<ServiceMap> = {};
    const serviceNames: (keyof ServiceMap)[] = [
      'logger',
      'auth',
      'authz',
      'eventBus',
      'modal',
      'notification',
      'theme',
    ];

    for (const name of serviceNames) {
      const service = this.get(name);
      if (service) {
        services[name] = service as any;
      }
    }

    return services as ServiceMap;
  }

  createScoped(overrides: Record<string, unknown>): ServiceContainer {
    const scopedContainer = new UnifiedServiceContainer();

    // Copy context values
    if (this.contextValues) {
      scopedContainer.setContextValues(this.contextValues);
    }

    // Apply overrides
    for (const [name, service] of Object.entries(overrides)) {
      scopedContainer.services.set(name, service);
    }

    return scopedContainer;
  }

  async dispose(): Promise<void> {
    this.services.clear();
    this.contextValues = null;
  }
}

/**
 * Create and initialize the service container
 * @param options Configuration options including logger override
 */
export function createServiceContainer(options?: { usePinoLogger?: boolean }): UnifiedServiceContainer {
  return new UnifiedServiceContainer(options);
}
