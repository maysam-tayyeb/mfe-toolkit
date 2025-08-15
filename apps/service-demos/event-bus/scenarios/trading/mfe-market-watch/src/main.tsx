import React from 'react';
import ReactDOM from 'react-dom/client';
import { MarketWatch } from './MarketWatch';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';

let root: ReactDOM.Root | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-market-watch',
    version: '1.0.0',
    requiredServices: ['eventBus', 'logger'],
    capabilities: ['real-time-updates', 'stock-monitoring']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    root = ReactDOM.createRoot(element);
    root.render(<MarketWatch services={services} />);
    
    if (services.logger) {
      services.logger.info('[mfe-market-watch] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (root) {
      root.unmount();
      root = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-market-watch] Unmounted successfully');
    }
  }
};

export default module;