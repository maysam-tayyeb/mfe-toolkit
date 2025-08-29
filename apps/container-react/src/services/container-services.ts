/**
 * Container Services using new Service Registry
 * Provides services to React contexts and MFEs
 */

import type { ServiceContainer } from '@mfe-toolkit/core';
import type { AuthService } from '@mfe-toolkit/service-auth';
import type { ModalService } from '@mfe-toolkit/service-modal';
import type { NotificationService } from '@mfe-toolkit/service-notification';
import type { ThemeService } from '@mfe-toolkit/service-theme';
import { getServiceContainer } from './service-setup';

// Service container instance
let containerInstance: ServiceContainer | null = null;

/**
 * Initialize the container services
 */
export async function initializeServices(): Promise<ServiceContainer> {
  if (!containerInstance) {
    containerInstance = await getServiceContainer();
  }
  return containerInstance;
}

/**
 * Get the service container
 */
export function getServices(): ServiceContainer | null {
  return containerInstance;
}

/**
 * Service accessor functions for React contexts
 */
export function getAuthService(): AuthService | undefined {
  return containerInstance?.get('@mfe-toolkit/auth');
}

export function getModalService(): ModalService | undefined {
  return containerInstance?.get('@mfe-toolkit/modal');
}

export function getNotificationService(): NotificationService | undefined {
  return containerInstance?.get('@mfe-toolkit/notification');
}

export function getThemeService(): ThemeService | undefined {
  return containerInstance?.get('@mfe-toolkit/theme');
}

export function getLogger() {
  return containerInstance?.get('logger');
}

export function getEventBus() {
  return containerInstance?.get('eventBus');
}