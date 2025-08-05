import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from 'react';
import { BaseModalConfig, NotificationConfig } from '@mfe-toolkit/core';

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
  const [modal, setModal] = useState<{ isOpen: boolean; config: ModalConfig | null }>({
    isOpen: false,
    config: null,
  });
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Modal functions
  const openModal = useCallback((config: ModalConfig) => {
    setModal({ isOpen: true, config });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, config: null });
  }, []);

  // Notification functions
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // Clear any pending timeout
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const addNotification = useCallback((notification: NotificationConfig) => {
    const id = notification.id || `notification-${Date.now()}-${Math.random()}`;
    const newNotification = { ...notification, id };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after duration
    if (notification.duration !== 0) {
      const duration = notification.duration || 5000;
      const timeout = setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        timeoutsRef.current.delete(id);
      }, duration);
      timeoutsRef.current.set(id, timeout);
    }
  }, []);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

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
