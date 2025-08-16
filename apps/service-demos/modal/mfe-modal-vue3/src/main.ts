import { createApp } from 'vue';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import App from './App.vue';

let app: any = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-modal-vue',
    version: '1.0.0',
    requiredServices: ["modal","logger"],
    capabilities: ["modal-demo","modal-testing"]
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    app = createApp(App, { services });
    app.mount(element);
    
    if (services.logger) {
      services.logger.info('[mfe-modal-vue] Mounted successfully with Vue 3');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (app) {
      app.unmount();
      app = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-modal-vue] Unmounted successfully');
    }
  }
};

export default module;