import {
  MFEServices,
  AuthService,
  ModalService,
  NotificationService,
  createLogger,
  getErrorReporter,
} from '@mfe-toolkit/core';
import { ContextBridgeRef } from './context-bridge';
import { createPlatformEventBus } from './platform-event-bus';

// Context bridge will be set by the App component
let contextBridge: ContextBridgeRef | null = null;

export const setContextBridge = (bridge: ContextBridgeRef) => {
  contextBridge = bridge;
};

const createAuthService = (): AuthService => {
  // Return a proxy that defers to the context bridge when available
  return {
    getSession: () => {
      if (!contextBridge) {
        return null;
      }
      return contextBridge.getAuthService().getSession();
    },
    isAuthenticated: () => {
      if (!contextBridge) {
        return false;
      }
      return contextBridge.getAuthService().isAuthenticated();
    },
    hasPermission: (permission: string) => {
      if (!contextBridge) {
        return false;
      }
      return contextBridge.getAuthService().hasPermission(permission);
    },
    hasRole: (role: string) => {
      if (!contextBridge) {
        return false;
      }
      return contextBridge.getAuthService().hasRole(role);
    },
  };
};

const createModalServiceImpl = (): ModalService => {
  return {
    open: (config) => {
      if (!contextBridge) {
        console.warn('Modal service called before context bridge initialization');
        return;
      }
      contextBridge.getModalService().open(config);
    },
    close: () => {
      if (!contextBridge) {
        console.warn('Modal service called before context bridge initialization');
        return;
      }
      contextBridge.getModalService().close();
    },
  };
};

const createNotificationServiceImpl = (): NotificationService => {
  return {
    show: (config) => {
      if (!contextBridge) {
        console.warn('Notification service called before context bridge initialization');
        return;
      }
      contextBridge.getNotificationService().show(config);
    },
    success: (title, message) => {
      if (!contextBridge) {
        console.warn('Notification service called before context bridge initialization');
        return;
      }
      contextBridge.getNotificationService().success(title, message);
    },
    error: (title, message) => {
      if (!contextBridge) {
        console.warn('Notification service called before context bridge initialization');
        return;
      }
      contextBridge.getNotificationService().error(title, message);
    },
    warning: (title, message) => {
      if (!contextBridge) {
        console.warn('Notification service called before context bridge initialization');
        return;
      }
      contextBridge.getNotificationService().warning(title, message);
    },
    info: (title, message) => {
      if (!contextBridge) {
        console.warn('Notification service called before context bridge initialization');
        return;
      }
      contextBridge.getNotificationService().info(title, message);
    },
  };
};

export const createMFEServices = (): MFEServices => {
  const eventBus = createPlatformEventBus();
  const services: MFEServices = {
    logger: createLogger('MFE'),
    auth: createAuthService(),
    eventBus,
    modal: createModalServiceImpl(),
    notification: createNotificationServiceImpl(),
  };

  // Create error reporter with services
  services.errorReporter = getErrorReporter({
    enableConsoleLog: true,
    maxErrorsPerSession: 100,
  }, services);

  return services;
};
