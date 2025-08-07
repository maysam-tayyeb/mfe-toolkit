/**
 * Development Notification Service
 * Provides notification/toast functionality for MFE development
 */

import type { NotificationService, NotificationOptions } from '@mfe-toolkit/core';

export class DevNotificationService implements NotificationService {
  private notificationContainer: HTMLElement | null = null;
  private notifications: Map<string, HTMLElement> = new Map();

  constructor() {
    this.ensureNotificationContainer();
  }

  private ensureNotificationContainer(): void {
    if (typeof document === 'undefined') return;
    
    if (!this.notificationContainer) {
      this.notificationContainer = document.getElementById('dev-notification-container');
      if (!this.notificationContainer) {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'dev-notification-container';
        this.notificationContainer.style.cssText = `
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 10000;
          pointer-events: none;
        `;
        document.body.appendChild(this.notificationContainer);
      }
    }
  }

  private show(
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message?: string,
    options?: NotificationOptions
  ): string {
    const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.style.cssText = `
      pointer-events: auto;
      margin-bottom: 0.5rem;
      animation: slideIn 0.3s ease-out;
    `;
    
    const bgColors = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    };
    
    notification.className = `${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 max-w-sm`;
    notification.innerHTML = `
      <span class="text-xl">${icons[type]}</span>
      <div class="flex-1">
        <div class="font-semibold">${title}</div>
        ${message ? `<div class="text-sm opacity-90">${message}</div>` : ''}
      </div>
      <button class="text-white hover:text-gray-200" id="${notificationId}-close">✕</button>
    `;
    
    this.notificationContainer?.appendChild(notification);
    this.notifications.set(notificationId, notification);
    
    // Add close button handler
    const closeBtn = notification.querySelector(`#${notificationId}-close`);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.dismiss(notificationId));
    }
    
    // Auto dismiss
    const duration = options?.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => this.dismiss(notificationId), duration);
    }
    
    console.log(`[DevNotificationService] ${type}:`, title, message);
    
    return notificationId;
  }

  info(title: string, message?: string, options?: NotificationOptions): string {
    return this.show('info', title, message, options);
  }

  success(title: string, message?: string, options?: NotificationOptions): string {
    return this.show('success', title, message, options);
  }

  warning(title: string, message?: string, options?: NotificationOptions): string {
    return this.show('warning', title, message, options);
  }

  error(title: string, message?: string, options?: NotificationOptions): string {
    return this.show('error', title, message, options);
  }

  dismiss(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
        this.notifications.delete(notificationId);
      }, 300);
    }
  }

  dismissAll(): void {
    this.notifications.forEach((_, id) => this.dismiss(id));
  }
}