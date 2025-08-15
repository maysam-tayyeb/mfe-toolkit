import React from 'react';
import ReactDOM from 'react-dom/client';
import { NotificationDemo } from './NotificationDemo';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';

let root: ReactDOM.Root | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-notification-react18',
    version: '1.0.0',
    requiredServices: ['notification'],
    capabilities: ['notification-testing', 'react18-hooks', 'custom-notifications']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    // React 18 uses createRoot API
    root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <NotificationDemo services={services} />
      </React.StrictMode>
    );
    
    services.logger?.info('React 18 Notification MFE mounted');
  },

  unmount: async (_container: MFEServiceContainer) => {
    if (root) {
      root.unmount();
      root = null;
    }
  }
};

export default module;