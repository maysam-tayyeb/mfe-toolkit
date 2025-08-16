import React from 'react';
import ReactDOM from 'react-dom/client';
import type { MFEModule, MFEServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let root: ReactDOM.Root | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-modal-react18',
    version: '1.0.0',
    requiredServices: ['logger'],
    capabilities: ['demo']
  },

  mount: async (element: HTMLElement, container: MFEServiceContainer) => {
    const services = container.getAllServices();
    root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>
    );
    
    if (services.logger) {
      services.logger.info('[mfe-modal-react18] Mounted successfully');
    }
  },
  
  unmount: async (container: MFEServiceContainer) => {
    if (root) {
      root.unmount();
      root = null;
    }
    
    const services = container.getAllServices();
    if (services.logger) {
      services.logger.info('[mfe-modal-react18] Unmounted successfully');
    }
  }
};

export default module;