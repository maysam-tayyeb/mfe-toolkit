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
  getThemeService,
  type AuthService,
  type AuthzService,
  type ModalService,
  type NotificationService,
  type BaseModalConfig,
  type NotificationConfig,
  type AuthSession,
  AuthServiceImpl,
  AuthzServiceImpl,
  ModalServiceImpl,
  NotificationServiceImpl,
} from '@mfe-toolkit/core';
import { createPlatformEventBus } from './platform-event-bus';

// Context values that will be injected by React
export interface ReactContextValues {
  auth: {
    session: AuthSession | null;
    setSession: (session: AuthSession | null) => void;
  };
  ui: {
    modals: Array<{ id: string; config: BaseModalConfig }>;
    setModals: (modals: Array<{ id: string; config: BaseModalConfig }>) => void;
    notifications: NotificationConfig[];
    setNotifications: (notifications: NotificationConfig[]) => void;
  };
}

/**
 * Unified Service Container Implementation
 */
export class UnifiedServiceContainer implements ServiceContainer {
  private services = new Map<string, unknown>();
  private contextValues: ReactContextValues | null = null;
  private eventBus = createPlatformEventBus();
  private logger = createLogger('ServiceContainer');
  private themeService = getThemeService();
  private authService: AuthService | null = null;
  private authzService: AuthzService | null = null;
  private modalService: ModalService | null = null;
  private notificationService: NotificationService | null = null;

  /**
   * Initialize services and set up synchronization with React contexts
   */
  initialize() {
    // Create core service implementations
    this.authService = new AuthServiceImpl({ persist: true, storageKey: 'mfe-auth-session' });
    this.authzService = new AuthzServiceImpl({
      defaultRoles: [],
      defaultPermissions: [],
    });
    this.modalService = new ModalServiceImpl();
    this.notificationService = new NotificationServiceImpl();

    // Set up bidirectional sync with React contexts when they're available
    this.setupContextSync();
  }

  /**
   * Update React context values
   */
  setContextValues(values: ReactContextValues) {
    this.contextValues = values;
    
    // If services are initialized, sync the current state
    if (this.authService && values.auth.session) {
      // Set initial session from context if different
      const currentSession = this.authService.getSession();
      if (JSON.stringify(currentSession) !== JSON.stringify(values.auth.session)) {
        // Use internal method to set session without triggering login flow
        (this.authService as any).session = values.auth.session;
      }
    }
    
    // Sync authz service with session roles and permissions
    if (this.authzService && values.auth.session) {
      const impl = this.authzService as AuthzServiceImpl;
      (impl as any).roles = new Set(values.auth.session.roles || []);
      (impl as any).permissions = new Set(values.auth.session.permissions || []);
    }
  }

  /**
   * Set up synchronization between core services and React contexts
   */
  private setupContextSync() {
    // Sync auth service with React context
    if (this.authService && this.authService.subscribe) {
      this.authService.subscribe((session) => {
        if (this.contextValues?.auth.setSession) {
          this.contextValues.auth.setSession(session);
        }
      });
    }

    // Sync modal service with React context
    if (this.modalService) {
      (this.modalService as ModalServiceImpl).subscribe((modals) => {
        if (this.contextValues?.ui.setModals) {
          const modalArray = modals.map(m => ({ id: m.id, config: m.config }));
          this.contextValues.ui.setModals(modalArray);
        }
      });
    }

    // Sync notification service with React context
    if (this.notificationService) {
      (this.notificationService as NotificationServiceImpl).subscribe((notifications) => {
        if (this.contextValues?.ui.setNotifications) {
          this.contextValues.ui.setNotifications(notifications);
        }
      });
    }
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
        if (!this.authService) {
          this.initialize();
        }
        service = this.authService;
        break;
      case 'authz':
        if (!this.authzService) {
          this.initialize();
        }
        service = this.authzService;
        break;
      case 'eventBus':
        service = this.eventBus;
        break;
      case 'modal':
        if (!this.modalService) {
          this.initialize();
        }
        service = this.modalService;
        break;
      case 'notification':
        if (!this.notificationService) {
          this.initialize();
        }
        service = this.notificationService;
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
    
    // Initialize the scoped container
    scopedContainer.initialize();

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
    // Dispose of services that have cleanup logic
    if (this.authService && 'dispose' in this.authService) {
      (this.authService as any).dispose();
    }
    if (this.modalService && 'dispose' in this.modalService) {
      (this.modalService as any).dispose();
    }
    if (this.notificationService && 'dispose' in this.notificationService) {
      (this.notificationService as any).dispose();
    }
    
    this.services.clear();
    this.contextValues = null;
    this.authService = null;
    this.authzService = null;
    this.modalService = null;
    this.notificationService = null;
  }
}

/**
 * Create and initialize the service container
 */
export function createServiceContainer(): UnifiedServiceContainer {
  const container = new UnifiedServiceContainer();
  container.initialize();
  return container;
}
