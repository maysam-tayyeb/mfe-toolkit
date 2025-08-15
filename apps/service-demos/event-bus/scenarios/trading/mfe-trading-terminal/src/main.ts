import { createApp } from 'vue';
import TradingTerminal from './TradingTerminal.vue';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';

let app: any = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-trading-terminal',
    version: '1.0.0',
    requiredServices: ['eventBus', 'logger', 'notification'],
    capabilities: ['order-placement', 'portfolio-management']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    app = createApp(TradingTerminal, { services });
    app.mount(element);
    
    if (services.logger) {
      services.logger.info('[mfe-trading-terminal] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (app) {
      app.unmount();
      app = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-trading-terminal] Unmounted successfully');
    }
  }
};

export default module;