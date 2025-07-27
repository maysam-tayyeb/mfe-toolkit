import {
  MFEServices,
  AuthService,
  ModalService,
  NotificationService,
  createLogger,
  createEventBus,
} from '@mfe/dev-kit';
import { store } from '@/store';
import { openModal, closeModal } from '@/store/modalSlice';
import { addNotification } from '@/store/notificationSlice';

const createAuthService = (): AuthService => {
  return {
    getSession: () => {
      const state = store.getState();
      return state.auth.session;
    },
    isAuthenticated: () => {
      const state = store.getState();
      return state.auth.session?.isAuthenticated || false;
    },
    hasPermission: (permission: string) => {
      const state = store.getState();
      return state.auth.session?.permissions.includes(permission) || false;
    },
    hasRole: (role: string) => {
      const state = store.getState();
      return state.auth.session?.roles.includes(role) || false;
    },
  };
};

const createModalServiceImpl = (): ModalService => {
  return {
    open: (config) => {
      store.dispatch(openModal(config));
    },
    close: () => {
      store.dispatch(closeModal());
    },
  };
};

const createNotificationServiceImpl = (): NotificationService => {
  const show = (config) => {
    store.dispatch(addNotification(config));
  };

  return {
    show,
    success: (title, message) => {
      show({ type: 'success', title, message });
    },
    error: (title, message) => {
      show({ type: 'error', title, message });
    },
    warning: (title, message) => {
      show({ type: 'warning', title, message });
    },
    info: (title, message) => {
      show({ type: 'info', title, message });
    },
  };
};

export const createMFEServices = (): MFEServices => {
  return {
    logger: createLogger('MFE'),
    auth: createAuthService(),
    eventBus: createEventBus(),
    modal: createModalServiceImpl(),
    notification: createNotificationServiceImpl(),
  };
};
