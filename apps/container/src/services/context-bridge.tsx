import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import { 
  AuthService, 
  ModalService, 
  NotificationService,
  NotificationConfig 
} from '@mfe/dev-kit';

export interface ContextBridgeRef {
  getAuthService: () => AuthService;
  getModalService: () => ModalService;
  getNotificationService: () => NotificationService;
}

// This component bridges React contexts to imperative services for MFEs
export const ContextBridge = forwardRef<ContextBridgeRef, { children: React.ReactNode }>(
  ({ children }, ref) => {
    const auth = useAuth();
    const ui = useUI();

    // Create stable service instances
    const authServiceRef = useRef<AuthService | null>(null);
    const modalServiceRef = useRef<ModalService | null>(null);
    const notificationServiceRef = useRef<NotificationService | null>(null);

    // Update auth service with current values
    authServiceRef.current = {
      getSession: () => auth.session,
      isAuthenticated: () => auth.session?.isAuthenticated || false,
      hasPermission: (permission: string) => 
        auth.session?.permissions.includes(permission) || false,
      hasRole: (role: string) => 
        auth.session?.roles.includes(role) || false,
    };

    // Update modal service with current values
    modalServiceRef.current = {
      open: (config) => ui.openModal(config),
      close: () => ui.closeModal(),
    };

    // Update notification service with current values
    const show = (config: NotificationConfig) => ui.addNotification(config);
    
    notificationServiceRef.current = {
      show,
      success: (title, message) => show({ type: 'success', title, message }),
      error: (title, message) => show({ type: 'error', title, message }),
      warning: (title, message) => show({ type: 'warning', title, message }),
      info: (title, message) => show({ type: 'info', title, message }),
    };

    // Expose methods to get services
    useImperativeHandle(ref, () => ({
      getAuthService: () => authServiceRef.current!,
      getModalService: () => modalServiceRef.current!,
      getNotificationService: () => notificationServiceRef.current!,
    }), []);

    return <>{children}</>;
  }
);