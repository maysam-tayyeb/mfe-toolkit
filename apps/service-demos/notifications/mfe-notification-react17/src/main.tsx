import React from 'react';
import ReactDOM from 'react-dom';
import type { MFEServices } from '@mfe-toolkit/core';
import { NotificationDemo } from './NotificationDemo';

export default function ({ eventBus, logger, modal, notification, auth, errorReporter }: MFEServices) {
  let root: HTMLElement | null = null;

  return {
    mount: (element: HTMLElement) => {
      // Using React 17 API
      root = element;
      ReactDOM.render(
        <React.StrictMode>
          <NotificationDemo services={{ eventBus, logger, modal, notification, auth, errorReporter }} />
        </React.StrictMode>,
        element
      );
      
      if (logger) {
        logger.info('[mfe-notification-react17] Mounted successfully');
      }
    },
    unmount: () => {
      if (root) {
        // React 17 unmount
        ReactDOM.unmountComponentAtNode(root);
        root = null;
      }
      
      if (logger) {
        logger.info('[mfe-notification-react17] Unmounted successfully');
      }
    }
  };
}