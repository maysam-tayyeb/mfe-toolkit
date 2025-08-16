import { createApp } from 'vue';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import NotificationDemo from './NotificationDemo.vue';

let app: any = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-notification-vue3',
    version: '1.0.0',
    requiredServices: ['notification'],
    capabilities: ['notification-demo']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    app = createApp(NotificationDemo, { services });
    app.mount(element);
    
    if (services.logger) {
      services.logger.info('[mfe-notification-vue3] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (app) {
      app.unmount();
      app = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-notification-vue3] Unmounted successfully');
    }
  }
};

export default module;