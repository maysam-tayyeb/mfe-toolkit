import { createApp } from 'vue';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import App from './App.vue';

let app: any = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-modal-vue3',
    version: '1.0.0',
    requiredServices: ['logger'],
    capabilities: ['demo']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    app = createApp(App, { services });
    app.mount(element);
    
    if (services.logger) {
      services.logger.info('[mfe-modal-vue3] Mounted successfully');
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