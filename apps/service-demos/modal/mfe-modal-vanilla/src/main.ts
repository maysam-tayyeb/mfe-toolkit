import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';

const module: MFEModule = {
  metadata: {
    name: 'mfe-modal-vanilla',
    version: '1.0.0',
    requiredServices: ["logger"],
    capabilities: ["demo"]
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    element.innerHTML = `
      <div class="ds-card ds-p-6 ds-m-4">
        <h1 class="ds-text-2xl ds-font-bold ds-text-center ds-mb-4">
          📦 mfe-modal-vanilla
        </h1>
        <p class="ds-text-center">Vanilla TypeScript MFE</p>
      </div>
    `;
    
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