import { createApp } from 'vue';
import TradingTerminal from './TradingTerminal.vue';
import type { MFEModuleV2, MFEServiceContainer, MFEServices } from '@mfe-toolkit/core';

let app: any = null;

const module: MFEModuleV2 = {
  metadata: {
    name: 'mfe-trading-terminal',
    version: '1.0.0',
    requiredServices: ['eventBus'],
    capabilities: ['order-placement', 'portfolio-management', 'real-time-trading', 'order-tracking']
  },

  mount: async (element: HTMLElement, containerOrServices: MFEServiceContainer | MFEServices) => {
    // Handle both V1 (services) and V2 (container) interfaces
    const services = 'getAllServices' in containerOrServices 
      ? containerOrServices.getAllServices() 
      : containerOrServices as MFEServices;
    
    app = createApp(TradingTerminal, { services });
    app.mount(element);
  },
  
  unmount: async (_container: MFEServiceContainer) => {
    if (app) {
      app.unmount();
      app = null;
    }
  }
};

export default module;