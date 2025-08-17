import { createApp, h } from 'vue';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let app: any = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-modal-vue3',
    version: '1.0.0',
    requiredServices: ["modal","logger"],
    capabilities: ["modal-demo","modal-testing"]
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    app = createApp({
      render() {
        return h(App, { services });
      }
    });
    app.mount(element);
    
    if (services.logger) {
      services.logger.info('[mfe-modal-vue3] Mounted successfully with Vue 3');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (app) {
      app.unmount();
      app = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-modal-vue3] Unmounted successfully');
    }
  }
};

export default module;