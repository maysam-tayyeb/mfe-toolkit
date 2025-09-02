/**
 * Context Bridge - Simplified component that syncs React contexts to service container
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { useServices } from '@/contexts/ServiceContext';
import type { UnifiedServiceContainer } from './service-container';

interface ContextBridgeProps {
  children: React.ReactNode;
}

/**
 * Bridges React contexts to the service container
 * Much simpler than before - no refs, no imperative handles, just syncing values
 */
export function ContextBridge({ children }: ContextBridgeProps) {
  const auth = useAuth();
  const ui = useUI();
  const serviceContainer = useServices() as UnifiedServiceContainer;

  // Update service container with latest React context values
  useEffect(() => {
    serviceContainer.setContextValues({
      auth: {
        session: auth.session,
      },
      ui: {
        openModal: ui.openModal,
        closeModal: ui.closeModal,
        addNotification: ui.addNotification,
      },
    });
  }, [auth.session, ui.openModal, ui.closeModal, ui.addNotification, serviceContainer]);

  return <>{children}</>;
}
