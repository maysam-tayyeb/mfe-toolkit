import type { ServiceProvider, ServiceContainer } from '@mfe-toolkit/core';
import type { EventBus } from './types';
import { createEventBus } from './implementation';

/**
 * Service provider for lazy initialization of EventBus
 */
export const eventBusServiceProvider: ServiceProvider<EventBus> = {
  name: 'eventBus',
  version: '1.0.0',

  create(container: ServiceContainer): EventBus {
    const logger = container.require('logger');
    return createEventBus('container', {
      debug: false,
      maxHistorySize: 100,
      enableValidation: process.env.NODE_ENV === 'development',
      logger: logger,
    });
  },

  dispose(): void {
    // EventBus doesn't need explicit cleanup
  },
};
