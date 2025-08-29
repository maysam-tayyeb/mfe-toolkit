import React from 'react';
import ReactDOM from 'react-dom/client';
import { NotificationDemo } from './NotificationDemo';
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';

let root: ReactDOM.Root | null = null;

const module: MFEModule = {
  metadata: {
    name: 'mfe-notification-react18',
    version: '1.0.0',
    requiredServices: ['logger', '@mfe-toolkit/notification'],
    capabilities: ['notification-testing', 'react18-hooks', 'custom-notifications']
  },

  mount: async (element: HTMLElement, container: ServiceContainer) => {
    const logger = container.require('logger');
    const notification = container.require('@mfe-toolkit/notification');
    
    // React 18 uses createRoot API
    root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <NotificationDemo notification={notification} logger={logger} />
      </React.StrictMode>
    );
    
    logger.info('React 18 Notification MFE mounted');
  },

  unmount: async (_container: ServiceContainer) => {
    if (root) {
      root.unmount();
      root = null;
    }
  }
};

export default module;