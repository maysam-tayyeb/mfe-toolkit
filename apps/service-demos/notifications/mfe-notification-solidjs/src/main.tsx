import { render } from 'solid-js/web';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let cleanup: (() => void) | null = null;

const module: MFEModule = {
  mount: async (element: HTMLElement, serviceContainer: ServiceContainer) => {
    const logger = serviceContainer.require('logger');
    const notification = serviceContainer.require('notification');
    cleanup = render(() => <App notification={notification} logger={logger} />, element);
    
    logger.info('[mfe-notification-solidjs] Mounted successfully');
  },
  
  unmount: async (serviceContainer: ServiceContainer) => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    
    const logger = serviceContainer.get('logger');
    if (logger) {
      logger.info('[mfe-notification-solidjs] Unmounted successfully');
    }
  }
};

export default module;