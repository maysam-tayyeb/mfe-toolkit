import React from 'react';
import ReactDOM from 'react-dom/client';
import { MarketWatch } from './MarketWatch';
import type { MFEModule, MFEServiceContainer, MFEServices } from '@mfe-toolkit/core';

let root: ReactDOM.Root | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-market-watch',
    version: '1.0.0',
    requiredServices: ['eventBus'],
    capabilities: ['real-time-prices', 'market-data-display', 'stock-monitoring', 'price-alerts']
  },

  mount: async (element: HTMLElement, containerOrServices: MFEServiceContainer | MFEServices) => {
    // Handle both V1 (services) and V2 (container) interfaces
    const services = 'getAllServices' in containerOrServices 
      ? containerOrServices.getAllServices() 
      : containerOrServices as MFEServices;
    
    root = ReactDOM.createRoot(element);
    root.render(<MarketWatch services={services} />);
  },
  
  unmount: async (_container: MFEServiceContainer) => {
    if (root) {
      root.unmount();
      root = null;
    }
  }
};

export default module;