import React from 'react';
import ReactDOM from 'react-dom';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { NotificationDemo } from './NotificationDemo';

let root: HTMLElement | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-notification-react17',
    version: '1.0.0',
    requiredServices: ['notification', 'logger'],
    capabilities: ['notification-display', 'react17-demo']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    
    // Using React 17 API
    root = element;
    ReactDOM.render(
      <React.StrictMode>
        <NotificationDemo services={services} />
      </React.StrictMode>,
      element
    );
    
    if (services.logger) {
      services.logger.info('[mfe-notification-react17] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (root) {
      // React 17 unmount
      ReactDOM.unmountComponentAtNode(root);
      root = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-notification-react17] Unmounted successfully');
    }
  }
};

export default module;