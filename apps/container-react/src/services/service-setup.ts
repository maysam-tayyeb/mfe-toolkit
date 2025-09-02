/**
 * Service Setup using the new Service Registry Architecture
 */

import {
  createServiceRegistry,
  type ServiceRegistry,
  type ServiceContainer,
  // Import reference implementations from core (tree-shakable)
  createLogger,
  createEventBus,
  createErrorReporter,
  modalServiceProvider,
  notificationServiceProvider,
  authServiceProvider,
  authzServiceProvider,
  themeServiceProvider,
  analyticsServiceProvider,
} from '@mfe-toolkit/core';

let registryInstance: ServiceRegistry | null = null;
let containerInstance: ServiceContainer | null = null;

/**
 * Setup and initialize all services
 */
export async function setupServices(): Promise<ServiceRegistry> {
  // Create registry
  const registry = createServiceRegistry();

  // Register core services using reference implementations
  registry.register('logger', createLogger('Container'));
  registry.register('eventBus', createEventBus('Container'));

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
  registry.registerProvider(authzServiceProvider); // Depends on auth
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
