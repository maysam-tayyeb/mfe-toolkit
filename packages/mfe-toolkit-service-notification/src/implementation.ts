/**
 * Notification Service Implementation
 */

import type { 
  NotificationService, 
  NotificationConfig, 
  NotificationType,
  NotificationServiceConfig 
} from './types';
import type { Logger } from '@mfe-toolkit/core';

interface NotificationEntry extends NotificationConfig {
  id: string;
  timestamp: number;
  timeoutId?: NodeJS.Timeout;
}

export class NotificationServiceImpl implements NotificationService {
  private notifications: Map<string, NotificationEntry> = new Map();
  private logger?: Logger;
  private config: NotificationServiceConfig;
  private idCounter = 0;

  constructor(config: NotificationServiceConfig = {}, logger?: Logger) {
    this.config = {
      maxNotifications: config.maxNotifications || 5,
      defaultDuration: config.defaultDuration ?? 3000,
      defaultPosition: config.defaultPosition || 'top-right',
      debug: config.debug || false
    };
    this.logger = logger;
  }

  /**
   * Show a notification
   */
  show(config: NotificationConfig): string {
    // Check max notifications limit
    if (this.notifications.size >= (this.config.maxNotifications || 5)) {
      if (this.logger && this.config.debug) {
        this.logger.warn('Notification limit reached, removing oldest notification');
      }
      // Remove the oldest notification
      const firstKey = this.notifications.keys().next().value;
      if (firstKey) {
        this.dismiss(firstKey);
      }
    }

    const id = config.id || `notification-${Date.now()}-${++this.idCounter}`;
    
    const entry: NotificationEntry = {
      ...config,
      id,
      position: config.position || this.config.defaultPosition,
      timestamp: Date.now()
    };

    // Set up auto-dismiss if duration is specified
    const duration = config.duration ?? this.config.defaultDuration;
    if (duration && duration > 0) {
      entry.timeoutId = setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    this.notifications.set(id, entry);

    if (this.logger && this.config.debug) {
      this.logger.debug(`Notification shown: ${id}`, { 
        type: config.type, 
        title: config.title 
      });
    }

    return id;
  }

  /**
   * Show a success notification
   */
  success(title: string, message?: string): string {
    return this.show({ type: 'success', title, message });
  }

  /**
   * Show an error notification
   */
  error(title: string, message?: string): string {
    return this.show({ 
      type: 'error', 
      title, 
      message,
      duration: 0 // Errors are persistent by default
    });
  }

  /**
   * Show a warning notification
   */
  warning(title: string, message?: string): string {
    return this.show({ type: 'warning', title, message });
  }

  /**
   * Show an info notification
   */
  info(title: string, message?: string): string {
    return this.show({ type: 'info', title, message });
  }

  /**
   * Dismiss a specific notification
   */
  dismiss(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      // Clear timeout if exists
      if (notification.timeoutId) {
        clearTimeout(notification.timeoutId);
      }

      // Call onClose callback if provided
      if (notification.onClose) {
        try {
          notification.onClose();
        } catch (error) {
          if (this.logger) {
            this.logger.error('Error in notification onClose callback', error);
          }
        }
      }

      this.notifications.delete(id);
      
      if (this.logger && this.config.debug) {
        this.logger.debug(`Notification dismissed: ${id}`);
      }
    }
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    const notificationIds = Array.from(this.notifications.keys());
    notificationIds.forEach(id => this.dismiss(id));
    
    if (this.logger && this.config.debug) {
      this.logger.debug('All notifications dismissed');
    }
  }

  /**
   * Get all active notifications
   */
  getActiveNotifications(): NotificationConfig[] {
    return Array.from(this.notifications.values()).map(({ 
      id, type, title, message, actions, position 
    }) => ({
      id, type, title, message, actions, position
    }));
  }

  /**
   * Update notification configuration
   */
  update(id: string, config: Partial<NotificationConfig>): void {
    const notification = this.notifications.get(id);
    if (notification) {
      // Clear existing timeout if duration is being updated
      if (config.duration !== undefined && notification.timeoutId) {
        clearTimeout(notification.timeoutId);
        
        // Set new timeout if duration > 0
        if (config.duration > 0) {
          notification.timeoutId = setTimeout(() => {
            this.dismiss(id);
          }, config.duration);
        }
      }

      // Update the notification
      Object.assign(notification, config);
      
      if (this.logger && this.config.debug) {
        this.logger.debug(`Notification updated: ${id}`, config);
      }
    }
  }
}

/**
 * Factory function to create a Notification Service
 */
export function createNotificationService(
  config?: NotificationServiceConfig,
  logger?: Logger
): NotificationService {
  return new NotificationServiceImpl(config, logger);
}