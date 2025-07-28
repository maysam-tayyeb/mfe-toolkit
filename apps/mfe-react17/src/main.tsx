import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { EVENTS } from '@mfe/shared';
import { EventBusImpl, MFEModule, MFEServices } from '@mfe/dev-kit';
import './index.css';

// Development mode - render directly (only when accessing the page directly, not when loaded as ES module)
const isDev =
  typeof document !== 'undefined' &&
  document.getElementById('react17-mfe-root') !== null &&
  typeof window !== 'undefined' &&
  window.location.port === '3002';

if (isDev) {
  // Development mode - render directly with mock services
  const mockServices: MFEServices = {
    logger: {
      debug: (message: string, ...args: any[]) =>
        console.debug(`[React17-Dev] ${message}`, ...args),
      info: (message: string, ...args: any[]) => console.info(`[React17-Dev] ${message}`, ...args),
      warn: (message: string, ...args: any[]) => console.warn(`[React17-Dev] ${message}`, ...args),
      error: (message: string, ...args: any[]) =>
        console.error(`[React17-Dev] ${message}`, ...args),
    },
    auth: {
      getSession: () => ({
        userId: 'dev-user',
        username: 'developer',
        email: 'dev@example.com',
        isAuthenticated: true,
        roles: ['user', 'developer'],
        permissions: ['read', 'write'],
        token: 'dev-token',
      }),
      isAuthenticated: () => true,
      hasPermission: () => true,
      hasRole: () => true,
    },
    eventBus: new EventBusImpl(),
    modal: {
      open: (config) => {
        console.log('[Dev Modal]', config);
        alert(
          `Modal: ${config.title}\n\n${typeof config.content === 'string' ? config.content : 'React Content'}`
        );
      },
      close: () => console.log('[Dev Modal] Closed'),
    },
    notification: {
      show: (config) => console.log('[Dev Notification]', config),
      success: (title, message) => console.log('[Dev Success]', title, message),
      error: (title, message) => console.log('[Dev Error]', title, message),
      warning: (title, message) => console.log('[Dev Warning]', title, message),
      info: (title, message) => console.log('[Dev Info]', title, message),
    },
  };

  const root = document.getElementById('react17-mfe-root');
  if (root) {
    ReactDOM.render(
      <React.StrictMode>
        <div style={{ padding: '2rem' }}>
          <App services={mockServices} />
        </div>
      </React.StrictMode>,
      root
    );
  }
}

// ES Module export - the MFE interface for dynamic imports
let mountPoint: HTMLDivElement | null = null;

const React17MFE: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    services.logger.info('Legacy Service Explorer MFE mounting to element');

    try {
      // Check if already mounted
      if (mountPoint && element.contains(mountPoint)) {
        services.logger.info(
          'Legacy Service Explorer MFE already mounted, skipping duplicate mount'
        );
        return;
      }

      // Clean up any existing mount
      if (mountPoint && mountPoint.parentNode) {
        ReactDOM.unmountComponentAtNode(mountPoint);
        mountPoint.parentNode.removeChild(mountPoint);
      }

      // Create mount point
      mountPoint = document.createElement('div');
      mountPoint.setAttribute('data-mfe', 'react17');
      element.appendChild(mountPoint);

      // React 17 uses ReactDOM.render instead of createRoot
      ReactDOM.render(React.createElement(App, { services }), mountPoint);

      services.logger.info('Legacy Service Explorer MFE mounted successfully');
      services.eventBus.emit(EVENTS.MFE_LOADED, {
        name: 'react17',
        version: '1.0.0',
        reactVersion: React.version,
      });
    } catch (error) {
      services.logger.error('Error during Legacy Service Explorer MFE mount', error);
      throw error;
    }
  },
  unmount: () => {
    if (mountPoint) {
      try {
        // React 17 unmount
        ReactDOM.unmountComponentAtNode(mountPoint);

        if (mountPoint.parentNode) {
          mountPoint.parentNode.removeChild(mountPoint);
        }
        mountPoint = null;

        console.log('Legacy Service Explorer MFE unmounted successfully');
      } catch (error) {
        console.error('Error during Legacy Service Explorer MFE unmount:', error);
      }
    }
  },
};

export default React17MFE;
