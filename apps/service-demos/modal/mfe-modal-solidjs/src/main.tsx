import { render } from 'solid-js/web';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let cleanup: (() => void) | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-notification-solidjs',
    version: '1.0.0',
    requiredServices: ['notification'],
    capabilities: ['notification-demo']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    cleanup = render(() => <App services={services} />, element);
    
    if (services.logger) {
      services.logger.info('[mfe-notification-solidjs] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-notification-solidjs] Unmounted successfully');
    }
  }
};

export default module;