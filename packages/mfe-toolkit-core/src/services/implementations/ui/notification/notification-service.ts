/**
 * Notification Service Implementation
 */

import type { NotificationService, NotificationConfig } from "../../../../services/types";

export class NotificationServiceImpl implements NotificationService {
  private notifications = new Map<string, NotificationConfig>();
  private listeners = new Set<(notifications: NotificationConfig[]) => void>();
  private idCounter = 0;

  show(config: NotificationConfig): string {
    const id = config.id || `notification-${++this.idCounter}`;
    const notification = { ...config, id };

    this.notifications.set(id, notification);
    this.notifyListeners();

    // Auto-dismiss after duration
    if (config.duration !== 0) {
      setTimeout(() => this.dismiss(id), config.duration || 5000);
    }

    return id;
  }

  success(title: string, message?: string): string {
    return this.show({ type: 'success', title, message });
  }

  error(title: string, message?: string): string {
    return this.show({ type: 'error', title, message, duration: 0 });
  }

  warning(title: string, message?: string): string {
    return this.show({ type: 'warning', title, message });
  }

  info(title: string, message?: string): string {
    return this.show({ type: 'info', title, message });
  }

  dismiss(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.onClose?.();
      this.notifications.delete(id);
      this.notifyListeners();
    }
  }

  dismissAll(): void {
    for (const id of this.notifications.keys()) {
      this.dismiss(id);
    }
  }

  subscribe(callback: (notifications: NotificationConfig[]) => void): () => void {
    this.listeners.add(callback);
    callback(Array.from(this.notifications.values()));
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const notifications = Array.from(this.notifications.values());
    this.listeners.forEach((callback) => callback(notifications));
  }
}

/**
 * Create a notification service instance
 */
export function createNotificationService(): NotificationService {
  return new NotificationServiceImpl();
}