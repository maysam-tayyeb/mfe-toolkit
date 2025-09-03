/**
 * Notification Service Types
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationConfig {
  id?: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  pauseOnHover?: boolean;
}

export interface NotificationService {
  show(config: NotificationConfig): string;
  success(title: string, message?: string): string;
  error(title: string, message?: string): string;
  warning(title: string, message?: string): string;
  info(title: string, message?: string): string;
  dismiss(id: string): void;
  dismissAll(): void;
}

/**
 * Configuration for Notification Service
 */
export interface NotificationServiceConfig {
  /**
   * Maximum number of notifications to show at once
   */
  maxNotifications?: number;
  
  /**
   * Default duration in milliseconds (0 for persistent)
   */
  defaultDuration?: number;
  
  /**
   * Default position for notifications
   */
  defaultPosition?: NotificationConfig['position'];
  
  /**
   * Enable debug logging
   */
  debug?: boolean;
}