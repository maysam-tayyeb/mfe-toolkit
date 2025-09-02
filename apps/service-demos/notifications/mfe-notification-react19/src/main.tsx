import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';

let root: ReactDOM.Root | null = null;

const module: MFEModule = {
  mount: async (element: HTMLElement, serviceContainer: ServiceContainer) => {
    root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <App serviceContainer={serviceContainer} />
      </React.StrictMode>
    );

    serviceContainer.require('logger').info('React 19 Notification MFE mounted');
  },

  unmount: async (serviceContainer: ServiceContainer) => {
    if (root) {
      root.unmount();
      root = null;
    }

    serviceContainer.require('logger').info('React 19 Notification MFE unmounted');
  },
};

export default module;
