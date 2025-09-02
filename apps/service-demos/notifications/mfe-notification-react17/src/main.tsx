import React from 'react';
import ReactDOM from 'react-dom';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';
import { App } from './App';

let rootElement: HTMLElement | null = null;

const module: MFEModule = {
  mount: async (element: HTMLElement, serviceContainer: ServiceContainer) => {
    const logger = serviceContainer.require('logger');
    const notification = serviceContainer.require('notification');
    rootElement = element;
    
    ReactDOM.render(
      <React.StrictMode>
        <App notification={notification} logger={logger} />
      </React.StrictMode>,
      element
    );
    
    logger.info('[mfe-notification-react17] Mounted successfully');
  },
  
  unmount: async (serviceContainer: ServiceContainer) => {
    if (rootElement) {
      ReactDOM.unmountComponentAtNode(rootElement);
      rootElement = null;
    }
    
    const logger = serviceContainer.get('logger');
    if (logger) {
      logger.info('[mfe-notification-react17] Unmounted successfully');
    }
  }
};

export default module;