import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';

const module: MFEModule = {
  metadata: {
    name: 'mfe-modal-solidjs',
    version: '1.0.0',
    requiredServices: ["logger"],
    capabilities: ["demo"]
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    const { render } = await import('solid-js/web');
    const { default: App } = await import('./App');
    
    const dispose = render(() => App({ services }), element);
    
    // Store dispose function for cleanup
    (element as any).__dispose = dispose;
    
    if (services.logger) {
      services.logger.info('[mfe-modal-solidjs] Mounted successfully with Solid.js');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    const element = document.querySelector('[data-mfe="mfe-modal-solidjs"]') as any;
    if (element && element.__dispose) {
      element.__dispose();
      delete element.__dispose;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-modal-solidjs] Unmounted successfully');
    }
  }
};

export default module;