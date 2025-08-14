import React from 'react';
import ReactDOM from 'react-dom/client';
import { NotificationDemo } from './NotificationDemo';
import type { MFEModuleV2, MFEServiceContainer } from '@mfe-toolkit/core';

let root: ReactDOM.Root | null = null;

const module: MFEModuleV2 = {
  metadata: {
    name: 'mfe-notification-react19',
    version: '1.0.0',
    requiredServices: ['notification'],
    capabilities: ['notification-testing', 'custom-notifications']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    root = ReactDOM.createRoot(element);
    root.render(<NotificationDemo services={services} />);
  },

  unmount: async (_container: MFEServiceContainer) => {
    if (root) {
      root.unmount();
      root = null;
    }
  }
};

export default module;