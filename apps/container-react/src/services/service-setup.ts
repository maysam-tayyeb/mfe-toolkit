/**
 * Service Setup using the new Service Registry Architecture
 */

import {
  createServiceRegistry,
  type ServiceRegistry,
  type ServiceContainer,
} from '@mfe-toolkit/core';

import { authServiceProvider } from '@mfe-toolkit/service-authentication';
import { authorizationServiceProvider } from '@mfe-toolkit/service-authorization';
import { modalServiceProvider } from '@mfe-toolkit/service-modal';
import { notificationServiceProvider } from '@mfe-toolkit/service-notification';
import { themeServiceProvider } from '@mfe-toolkit/service-theme';
import { analyticsServiceProvider } from '@mfe-toolkit/service-analytics';

// Import container implementations
import { createConsoleLogger } from './implementations/logger/console-logger';
import { createSimpleEventBus } from './implementations/event-bus/simple-event-bus';
import { createErrorReporter } from './implementations/error-reporter/default-error-reporter';

let registryInstance: ServiceRegistry | null = null;
let containerInstance: ServiceContainer | null = null;

/**
 * Setup and initialize all services
 */
export async function setupServices(): Promise<ServiceRegistry> {
  // Create registry
  const registry = createServiceRegistry();
  
  // Register core services using container implementations
  registry.register('logger', createConsoleLogger('Container'));
  registry.register('eventBus', createSimpleEventBus('Container'));
  
  // Register error reporter (new)
  const errorReporter = createErrorReporter(
    {
      maxErrorsPerSession: 100,
      enableConsoleLog: true,
      enableRemoteLogging: false,
    },
    registry.createContainer()
  );
  registry.register('errorReporter', errorReporter);
  
  // Register service packages
  registry.registerProvider(authServiceProvider);
  registry.registerProvider(authorizationServiceProvider); // Depends on auth
  registry.registerProvider(modalServiceProvider);
  registry.registerProvider(notificationServiceProvider);
  registry.registerProvider(themeServiceProvider);
  
  // Register optional services
  if (import.meta.env.VITE_ENABLE_ANALYTICS !== 'false') {
    registry.registerProvider(analyticsServiceProvider);
  }
  
  // Initialize all providers
  await registry.initialize();
  
  registryInstance = registry;
  return registry;
}

/**
 * Get or create the service container
 */
export async function getServiceContainer(): Promise<ServiceContainer> {
  if (containerInstance) {
    return containerInstance;
  }
  
  if (!registryInstance) {
    registryInstance = await setupServices();
  }
  
  containerInstance = registryInstance.createContainer();
  return containerInstance;
}

/**
 * Get the service registry (singleton)
 */
export function getServiceRegistry(): ServiceRegistry | null {
  return registryInstance;
}

/**
 * Reset services (for testing)
 */
export async function resetServices(): Promise<void> {
  if (containerInstance) {
    await containerInstance.dispose();
    containerInstance = null;
  }
  
  if (registryInstance) {
    await registryInstance.dispose();
    registryInstance = null;
  }
}