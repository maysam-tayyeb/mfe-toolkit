import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUI } from '@/contexts/UIContext';
import type { AuthService } from '@mfe-toolkit/service-auth';
import type { ModalService } from '@mfe-toolkit/service-modal';
import type { NotificationService, NotificationConfig } from '@mfe-toolkit/service-notification';
import type { ThemeService } from '@mfe-toolkit/service-theme';
import { getThemeService } from './theme-service';

export interface ContextBridgeRef {
  getAuthService: () => AuthService;
  getModalService: () => ModalService;
  getNotificationService: () => NotificationService;
  getThemeService: () => ThemeService;
}

// This component bridges React contexts to imperative services for MFEs
export const ContextBridge = forwardRef<ContextBridgeRef, { children: React.ReactNode }>(
  ({ children }, ref) => {
    const auth = useAuth();
    const ui = useUI();

    // Create stable service instances - only update refs, don't recreate objects
    const authServiceRef = useRef<AuthService>({
      getSession: () => null,
      isAuthenticated: () => false,
      hasPermission: () => false,
      hasRole: () => false,
    });

    const modalServiceRef = useRef<ModalService>({
      open: () => '', // Must return modal ID
      close: () => {},
    });

    const notificationServiceRef = useRef<NotificationService>({
      show: () => '', // Must return notification ID
      success: () => '',
      error: () => '',
      warning: () => '',
      info: () => '',
      dismiss: () => {},
      dismissAll: () => {},
    });

    // Update service methods without recreating the objects
    useEffect(() => {
      authServiceRef.current.getSession = () => auth.session;
      authServiceRef.current.isAuthenticated = () => auth.session?.isAuthenticated || false;
      authServiceRef.current.hasPermission = (permission: string) =>
        auth.session?.permissions.includes(permission) || false;
      authServiceRef.current.hasRole = (role: string) =>
        auth.session?.roles.includes(role) || false;
    }, [auth.session]);

    useEffect(() => {
      modalServiceRef.current.open = (config) => {
        ui.openModal(config);
        return 'modal-1'; // Return a modal ID
      };
      modalServiceRef.current.close = () => ui.closeModal();
    }, [ui.openModal, ui.closeModal]);

    useEffect(() => {
      const show = (config: NotificationConfig) => {
        ui.addNotification(config);
        return `notification-${Date.now()}`; // Return a notification ID
      };

      notificationServiceRef.current.show = show;
      notificationServiceRef.current.success = (title, message) =>
        show({ type: 'success', title, message });
      notificationServiceRef.current.error = (title, message) =>
        show({ type: 'error', title, message });
      notificationServiceRef.current.warning = (title, message) =>
        show({ type: 'warning', title, message });
      notificationServiceRef.current.info = (title, message) =>
        show({ type: 'info', title, message });
      notificationServiceRef.current.dismiss = () => {}; // TODO: Implement
      notificationServiceRef.current.dismissAll = () => {}; // TODO: Implement
    }, [ui.addNotification]);

    // Get theme service singleton
    const themeService = getThemeService();

    // Expose methods to get services
    useImperativeHandle(
      ref,
      () => ({
        getAuthService: () => authServiceRef.current,
        getModalService: () => modalServiceRef.current,
        getNotificationService: () => notificationServiceRef.current,
        getThemeService: () => themeService,
      }),
      []
    );

    return <>{children}</>;
  }
);
