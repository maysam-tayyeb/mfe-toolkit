import { render } from 'solid-js/web';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let dispose: (() => void) | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-modal-solidjs',
    version: '1.0.0',
    requiredServices: ["modal","logger"],
    capabilities: ["modal-demo","modal-testing"]
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    dispose = render(() => App({ services }), element);
    
    if (services.logger) {
      services.logger.info('[mfe-modal-solidjs] Mounted successfully with Solid.js');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (dispose) {
      dispose();
      dispose = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-modal-solidjs] Unmounted successfully');
    }
  }
};

export default module;