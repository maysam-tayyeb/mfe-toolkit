import React from 'react';
import ReactDOM from 'react-dom';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let rootElement: HTMLElement | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-notification-react17',
    version: '1.0.0',
    requiredServices: ['notification'],
    capabilities: ['notification-demo']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    rootElement = element;
    
    ReactDOM.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>,
      element
    );
    
    if (services.logger) {
      services.logger.info('[mfe-notification-react17] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (rootElement) {
      ReactDOM.unmountComponentAtNode(rootElement);
      rootElement = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-notification-react17] Unmounted successfully');
    }
  }
};

export default module;