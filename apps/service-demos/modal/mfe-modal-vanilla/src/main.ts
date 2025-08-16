import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';

const module: MFEModule = {
  metadata: {
    name: 'mfe-modal-vanilla',
    version: '1.0.0',
    requiredServices: ['logger'],
    capabilities: ['demo']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    element.innerHTML = '<div>Hello from mfe-modal-vanilla!</div>';
    
    if (services.logger) {
      services.logger.info('[mfe-modal-vanilla] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-modal-vanilla] Unmounted successfully');
    }
  }
};

export default module;