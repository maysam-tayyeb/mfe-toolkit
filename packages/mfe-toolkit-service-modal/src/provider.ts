import type { ServiceProvider, ServiceContainer } from '@mfe-toolkit/core';
import type { ModalService, BaseModalConfig } from './types';
import { createModalService } from './implementation';

/**
 * Service provider for lazy initialization of Modal service
 */
export const modalServiceProvider: ServiceProvider<ModalService> = {
  name: 'modal',
  version: '1.0.0',
  
  create(container: ServiceContainer): ModalService<BaseModalConfig> {
    const logger = container.require('logger');
    return createModalService({
      maxModals: 5,
      defaultZIndex: 1000,
      debug: process.env.NODE_ENV === 'development'
    }, logger);
  },
  
  dispose(): void {
    // Modal service doesn't need explicit cleanup
  }
};