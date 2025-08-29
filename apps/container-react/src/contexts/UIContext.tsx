import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { useModalService, useNotificationService } from './ServiceContext';
import type { BaseModalConfig } from '@mfe-toolkit/service-modal';
import type { NotificationConfig } from '@mfe-toolkit/service-notification';

type ModalConfig = BaseModalConfig<React.ReactNode>;

interface UIContextType {
  // Modal state
  modal: {
    isOpen: boolean;
    config: ModalConfig | null;
  };
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;

  // Notification state
  notifications: NotificationConfig[];
  addNotification: (notification: NotificationConfig) => void;
  removeNotification: (id: string) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const modalService = useModalService();
  const notificationService = useNotificationService();
  
  const [modal, setModal] = useState<{ isOpen: boolean; config: ModalConfig | null }>({
    isOpen: false,
    config: null,
  });
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);

  // Subscribe to modal service changes
  useEffect(() => {
    if (!modalService) return;
    
    const unsubscribe = (modalService as any).subscribe?.((modals: any[]) => {
      if (modals.length > 0) {
        const topModal = modals[modals.length - 1];
        setModal({ isOpen: true, config: topModal.config });
      } else {
        setModal({ isOpen: false, config: null });
      }
    });
    
    return unsubscribe;
  }, [modalService]);

  // Subscribe to notification service changes
  useEffect(() => {
    if (!notificationService) return;
    
    const unsubscribe = (notificationService as any).subscribe?.((notifs: NotificationConfig[]) => {
      setNotifications(notifs);
    });
    
    return unsubscribe;
  }, [notificationService]);

  // Modal functions
  const openModal = useCallback((config: ModalConfig) => {
    if (modalService) {
      modalService.open(config);
    } else {
      setModal({ isOpen: true, config });
    }
  }, [modalService]);

  const closeModal = useCallback(() => {
    if (modalService) {
      modalService.close();
    } else {
      setModal({ isOpen: false, config: null });
    }
  }, [modalService]);

  // Notification functions
  const addNotification = useCallback((notification: NotificationConfig) => {
    if (notificationService) {
      notificationService.show(notification);
    } else {
      const id = notification.id || `notification-${Date.now()}`;
      setNotifications(prev => [...prev, { ...notification, id }]);
    }
  }, [notificationService]);

  const removeNotification = useCallback((id: string) => {
    if (notificationService) {
      notificationService.dismiss(id);
    } else {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  }, [notificationService]);

  const value: UIContextType = {
    modal,
    openModal,
    closeModal,
    notifications,
    addNotification,
    removeNotification,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};