import React from 'react';
import ReactDOM from 'react-dom/client';
import { MarketWatch } from './MarketWatch';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';

let root: ReactDOM.Root | null = null;

const module: MFEModule = {
  mount: async (element: HTMLElement, container: ServiceContainer) => {
    root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <MarketWatch serviceContainer={container} />
      </React.StrictMode>
    );

    container.require('logger').info('[mfe-market-watch] Mounted successfully with React 18');
  },

  unmount: async (container: ServiceContainer) => {
    if (root) {
      root.unmount();
      root = null;
    }

    container.require('logger').info('[mfe-market-watch] Unmounted successfully');
  },
};

export default module;
