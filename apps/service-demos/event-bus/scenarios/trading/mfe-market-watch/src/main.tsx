import React from 'react';
import ReactDOM from 'react-dom/client';
import { MarketWatch } from './MarketWatch';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';

let root: ReactDOM.Root | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-market-watch',
    version: '1.0.0',
    requiredServices: ['eventBus', 'logger'],
    capabilities: ['real-time-updates', 'stock-monitoring']
  },

  mount: async (element: HTMLElement, container: ServiceContainer) => {
    const eventBus = container.require('eventBus');
    const logger = container.require('logger');
    
    root = ReactDOM.createRoot(element);
    root.render(<MarketWatch eventBus={eventBus} logger={logger} />);
    
    logger.info('[mfe-market-watch] Mounted successfully');
  },
  
  unmount: async (container: ServiceContainer) => {
    if (root) {
      root.unmount();
      root = null;
    }
    
    const logger = container.get('logger');
    logger?.info('[mfe-market-watch] Unmounted successfully');
  }
};

export default module;