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
 * Service key for registration
 */
export const NOTIFICATION_SERVICE_KEY = 'notification';