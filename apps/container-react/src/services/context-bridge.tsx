/**
 * Context Bridge - Syncs React contexts with core service implementations
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useServices } from '@/contexts/ServiceContext';
import type { UnifiedServiceContainer } from './service-container';
import type { BaseModalConfig, NotificationConfig } from '@mfe-toolkit/core';

interface ContextBridgeProps {
  children: React.ReactNode;
}

/**
 * Bridges React contexts with the core service implementations
 * Provides bidirectional sync between React state and service state
 */
export function ContextBridge({ children }: ContextBridgeProps) {
  const auth = useAuth();
  const ui = useUI();
  const serviceContainer = useServices() as UnifiedServiceContainer;
  
  // State to track modal and notification updates from services
  const [modals, setModals] = useState<Array<{ id: string; config: BaseModalConfig }>>([]);
  const [notifications, setNotifications] = useState<NotificationConfig[]>([]);

  // Update service container with React context callbacks and state setters
  useEffect(() => {
    serviceContainer.setContextValues({
      auth: {
        session: auth.session,
        setSession: auth.setSession,
      },
      ui: {
        modals,
        setModals,
        notifications,
        setNotifications,
      },
    });
  }, [auth.session, auth.setSession, modals, notifications, serviceContainer]);

  // Sync modal state to UI context
  useEffect(() => {
    const currentModal = modals[modals.length - 1];
    if (currentModal && !ui.modal.isOpen) {
      ui.openModal(currentModal.config);
    } else if (!currentModal && ui.modal.isOpen) {
      ui.closeModal();
    }
  }, [modals, ui]);

  // Sync notification state to UI context
  useEffect(() => {
    // Add new notifications that aren't already in UI context
    notifications.forEach(notification => {
      if (!ui.notifications.find(n => n.id === notification.id)) {
        ui.addNotification(notification);
      }
    });
    
    // Remove notifications that were dismissed from service
    ui.notifications.forEach(uiNotification => {
      if (uiNotification.id && !notifications.find(n => n.id === uiNotification.id)) {
        ui.removeNotification(uiNotification.id);
      }
    });
  }, [notifications, ui]);

  return <>{children}</>;
}
