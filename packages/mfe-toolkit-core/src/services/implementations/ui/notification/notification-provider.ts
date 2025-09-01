/**
 * Notification Service Provider
 */

import type { ServiceProvider, ServiceContainer } from '../../services/registry/types';
import type { NotificationService } from '../../types/notification';
import { NOTIFICATION_SERVICE_KEY } from '../../types/notification';
import { createNotificationService } from './notification-service';

/**
 * Create a notification service provider
 */
export function createNotificationProvider(): ServiceProvider<NotificationService> {
  return {
    name: NOTIFICATION_SERVICE_KEY,
    version: '1.0.0',
    dependencies: ['logger'],

    create(container: ServiceContainer): NotificationService {
      const logger = container.get('logger');
      const service = createNotificationService();

      if (logger) {
        const originalShow = service.show.bind(service);
        service.show = (config) => {
          logger.debug(`Showing ${config.type} notification: ${config.title}`);
          return originalShow(config);
        };
      }

      return service;
    },
  };
}

export const notificationServiceProvider = createNotificationProvider();