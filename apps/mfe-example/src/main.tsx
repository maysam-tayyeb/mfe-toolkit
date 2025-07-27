import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { MFEModule, MFEServices, getMFEServices } from '@mfe/dev-kit';

// Development mode - render directly (only when accessing the page directly, not when loaded as ES module)
const isDev =
  typeof document !== 'undefined' &&
  document.getElementById('root') !== null &&
  typeof window !== 'undefined' &&
  window.location.port === '3001';
if (isDev) {
  const mockServices = getMFEServices() || {
    logger: {
      debug: (message: string, ...args: any[]) => console.debug(`[MFE-DEV] ${message}`, ...args),
      info: (message: string, ...args: any[]) => console.info(`[MFE-DEV] ${message}`, ...args),
      warn: (message: string, ...args: any[]) => console.warn(`[MFE-DEV] ${message}`, ...args),
      error: (message: string, ...args: any[]) => console.error(`[MFE-DEV] ${message}`, ...args),
    },
    auth: {
      getSession: () => ({
        userId: 'dev-user',
        username: 'developer',
        email: 'dev@example.com',
        roles: ['user'],
        permissions: ['read', 'write'],
        isAuthenticated: true,
      }),
      isAuthenticated: () => true,
      hasPermission: () => true,
      hasRole: () => true,
    },
    eventBus: {
      emit: () => {},
      on: () => () => {},
      off: () => {},
      once: () => {},
    },
    modal: {
      open: () => alert('Modal service not available in dev mode'),
      close: () => {},
    },
    notification: {
      show: (config) => console.log('Notification:', config),
      success: (title, message) => console.log('Success:', title, message),
      error: (title, message) => console.log('Error:', title, message),
      warning: (title, message) => console.log('Warning:', title, message),
      info: (title, message) => console.log('Info:', title, message),
    },
  };

  const root = document.getElementById('root');
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <div style={{ padding: '2rem' }}>
          <App services={mockServices as MFEServices} />
        </div>
      </React.StrictMode>
    );
  }
}

// ES Module export - the MFE interface for dynamic imports
let reactRoot: any = null;
let mountPoint: HTMLDivElement | null = null;

const ExampleMFE: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    services.logger.info('MFE mounting to element');

    try {
      // Check if already mounted
      if (reactRoot && mountPoint && element.contains(mountPoint)) {
        services.logger.info('MFE already mounted, skipping duplicate mount');
        return;
      }

      // Clean up any existing mount
      if (reactRoot) {
        try {
          reactRoot.unmount();
          reactRoot = null;
        } catch (e) {
          services.logger.warn('Error cleaning up previous mount', e);
        }
      }

      if (mountPoint && mountPoint.parentNode) {
        mountPoint.parentNode.removeChild(mountPoint);
      }

      // Use the bundled React directly - no window dependency
      mountPoint = document.createElement('div');
      mountPoint.setAttribute('data-mfe', 'example');
      element.appendChild(mountPoint);

      // Use createRoot with the child element
      reactRoot = ReactDOM.createRoot(mountPoint);
      reactRoot.render(React.createElement(App, { services }));

      services.logger.info('MFE mounted successfully');
    } catch (error) {
      services.logger.error('Error during MFE mount', error);
      throw error;
    }
  },
  unmount: () => {
    if (reactRoot) {
      // Note: services not available in unmount, using console for now
      try {
        reactRoot.unmount();
        reactRoot = null;

        if (mountPoint && mountPoint.parentNode) {
          mountPoint.parentNode.removeChild(mountPoint);
        }
        mountPoint = null;

        console.log('MFE unmounted successfully');
      } catch (error) {
        console.error('Error during MFE unmount:', error);
      }
    }
  },
};

export default ExampleMFE;
