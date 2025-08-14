import React from 'react';
import ReactDOM from 'react-dom/client';
import { MarketWatch } from './MarketWatch';
import type { MFEModuleV2, MFEServiceContainer } from '@mfe-toolkit/core';

let root: ReactDOM.Root | null = null;

const module: MFEModuleV2 = {
  metadata: {
    name: 'mfe-market-watch',
    version: '1.0.0',
    requiredServices: ['eventBus'],
    capabilities: ['real-time-prices', 'market-data-display', 'stock-monitoring', 'price-alerts']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
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