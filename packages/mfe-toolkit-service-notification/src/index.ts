/**
 * Notification Service Package
 * 
 * This package provides the Notification service for MFE Toolkit.
 * It extends the ServiceMap interface via TypeScript module augmentation.
 */

import type { NotificationService } from './types';

// Module augmentation to extend ServiceMap
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    notification: NotificationService;
  }
}

// Export types
export type { 
  NotificationService, 
  NotificationConfig, 
  NotificationType,
  NotificationServiceConfig 
} from './types';

// Export implementation (tree-shakable)
export { NotificationServiceImpl, createNotificationService } from './implementation';

// Export provider
export { notificationServiceProvider } from './provider';

// Export service key constant
export const NOTIFICATION_SERVICE_KEY = 'notification';