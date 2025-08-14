import React from 'react';
import ReactDOM from 'react-dom/client';
import { NotificationDemo } from './NotificationDemo';
import type { MFEModuleV2, MFEServiceContainer, MFEServices } from '@mfe-toolkit/core';

let root: ReactDOM.Root | null = null;

const module: MFEModuleV2 = {
  metadata: {
    name: 'mfe-notification-react19',
    version: '1.0.0',
    requiredServices: ['notification'],
    capabilities: ['notification-testing', 'custom-notifications']
  },

  mount: async (element: HTMLElement, containerOrServices: MFEServiceContainer | MFEServices) => {
    // Handle both V1 (services) and V2 (container) interfaces
    const services = 'getAllServices' in containerOrServices 
      ? containerOrServices.getAllServices() 
      : containerOrServices as MFEServices;
    
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