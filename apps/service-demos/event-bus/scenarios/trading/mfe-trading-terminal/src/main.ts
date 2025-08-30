import { createApp } from 'vue';
import TradingTerminal from './TradingTerminal.vue';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';

let app: any = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-trading-terminal',
    version: '1.0.0',
    requiredServices: ['eventBus', 'logger'],
    optionalServices: ['notification'],
    capabilities: ['order-placement', 'portfolio-management']
  },

  mount: async (element: HTMLElement, container: ServiceContainer) => {
    const eventBus = container.require('eventBus');
    const logger = container.require('logger');
    const notification = container.get('notification');
    
    app = createApp(TradingTerminal, { 
      eventBus,
      logger,
      notification
    });
    app.mount(element);
    
    logger.info('[mfe-trading-terminal] Mounted successfully');
  },
  
  unmount: async (container: ServiceContainer) => {
    if (app) {
      app.unmount();
      app = null;
    }
    
    const logger = container.get('logger');
    logger?.info('[mfe-trading-terminal] Unmounted successfully');
  }
};

export default module;