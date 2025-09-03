import type { ServiceProvider, ServiceContainer } from '@mfe-toolkit/core';
import type { NotificationService } from './types';
import { createNotificationService } from './implementation';

/**
 * Service provider for lazy initialization of Notification service
 */
export const notificationServiceProvider: ServiceProvider<NotificationService> = {
  name: 'notification',
  version: '1.0.0',
  
  create(container: ServiceContainer): NotificationService {
    const logger = container.require('logger');
    return createNotificationService({
      maxNotifications: 5,
      defaultDuration: 3000,
      defaultPosition: 'top-right',
      debug: process.env.NODE_ENV === 'development'
    }, logger);
  },
  
  dispose(): void {
    // Notification service doesn't need explicit cleanup
  }
};