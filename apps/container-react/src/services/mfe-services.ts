import {
  MFEServices,
  AuthService,
  ModalService,
  NotificationService,
  ThemeService,
  createLogger,
  getErrorReporter,
} from '@mfe-toolkit/core';
import { ContextBridgeRef } from './context-bridge';
import { createPlatformEventBus } from './platform-event-bus';

// Context bridge will be set by the App component
let contextBridge: ContextBridgeRef | null = null;
let bridgeReadyResolve: ((value: void) => void) | null = null;
let bridgeReadyPromise: Promise<void>;

const resetBridgePromise = () => {
  bridgeReadyPromise = new Promise<void>((resolve) => {
    bridgeReadyResolve = resolve;
  });
};

// Initialize the promise
resetBridgePromise();

export const setContextBridge = (bridge: ContextBridgeRef | null) => {
  contextBridge = bridge;
  if (bridge && bridgeReadyResolve) {
    bridgeReadyResolve();
    bridgeReadyResolve = null;
  } else if (!bridge) {
    // Reset for testing
    resetBridgePromise();
  }
};

/**
 * Creates a proxied service that automatically handles context bridge checks
 * and provides consistent error handling across all service methods
 */
const createProxiedService = <T extends object>(
  serviceName: string,
  getService: () => T,
  defaultReturnValues: Partial<Record<keyof T, any>> = {}
): T => {
  return new Proxy({} as T, {
    get(_, prop: string | symbol) {
      return (...args: any[]) => {
        if (!contextBridge) {
          const message = `${serviceName}.${String(prop)} called before context bridge initialization`;
          console.warn(message);
          
          // Return default value if specified
          if (prop in defaultReturnValues) {
            return defaultReturnValues[prop as keyof T];
          }
          
          // For void methods, return undefined
          return undefined;
        }
        
        const service = getService();
        const method = (service as any)[prop];
        
        if (typeof method !== 'function') {
          throw new Error(`${serviceName}.${String(prop)} is not a function`);
        }
        
        return method(...args);
      };
    }
  });
};

const createAuthService = (): AuthService => {
  return createProxiedService<AuthService>(
    'AuthService',
    () => contextBridge!.getAuthService(),
    {
      getSession: null,
      isAuthenticated: false,
      hasPermission: false,
      hasRole: false,
    }
  );
};

const createModalServiceImpl = (): ModalService => {
  return createProxiedService<ModalService>(
    'ModalService',
    () => contextBridge!.getModalService()
  );
};

const createNotificationServiceImpl = (): NotificationService => {
  return createProxiedService<NotificationService>(
    'NotificationService',
    () => contextBridge!.getNotificationService()
  );
};

const createThemeServiceImpl = (): ThemeService => {
  return createProxiedService<ThemeService>(
    'ThemeService',
    () => contextBridge!.getThemeService(),
    {
      getTheme: 'light',
      toggleTheme: undefined,
      setTheme: undefined,
      subscribe: () => () => {}, // Return empty unsubscribe function
    }
  );
};

export const createMFEServices = (): MFEServices => {
  const eventBus = createPlatformEventBus();
  const services: MFEServices = {
    logger: createLogger('MFE'),
    auth: createAuthService(),
    eventBus,
    modal: createModalServiceImpl(),
    notification: createNotificationServiceImpl(),
    theme: createThemeServiceImpl(),
  };

  // Create error reporter with services
  services.errorReporter = getErrorReporter({
    enableConsoleLog: true,
    maxErrorsPerSession: 100,
  }, services);

  return services;
};

// Container-specific utilities (not part of MFE contract)
export const isContextBridgeReady = () => contextBridge !== null;
export const waitForContextBridge = () => bridgeReadyPromise;

// Export for testing purposes
export const resetContextBridge = () => {
  setContextBridge(null);
};