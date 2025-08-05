import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { EVENTS, MFE_CONFIG } from '@mfe-toolkit/shared';
import { createEventBus, MFEModule, MFEServices } from '@mfe-toolkit/core';
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
    eventBus: createEventBus({ source: 'react17-mfe-dev' }),
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
    services.logger.info(`${MFE_CONFIG.legacyServiceExplorer.displayName} mounting to element`);

    try {
      // Check if already mounted
      if (mountPoint && element.contains(mountPoint)) {
        services.logger.info(
          `${MFE_CONFIG.legacyServiceExplorer.displayName} already mounted, skipping duplicate mount`
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
      mountPoint.setAttribute('data-mfe', MFE_CONFIG.legacyServiceExplorer.id);
      element.appendChild(mountPoint);

      // React 17 uses ReactDOM.render instead of createRoot
      console.log('React version in MFE:', React.version);
      console.log('ReactDOM available:', !!ReactDOM);
      console.log('Creating React element...');
      const reactElement = React.createElement(App, { services });
      console.log('Rendering to mount point...');
      ReactDOM.render(reactElement, mountPoint);

      services.logger.info(`${MFE_CONFIG.legacyServiceExplorer.displayName} mounted successfully`);
      services.eventBus.emit(EVENTS.MFE_LOADED, {
        name: MFE_CONFIG.legacyServiceExplorer.id,
        version: MFE_CONFIG.legacyServiceExplorer.version,
        reactVersion: React.version,
      });
    } catch (error) {
      services.logger.error(
        `Error during ${MFE_CONFIG.legacyServiceExplorer.displayName} mount`,
        error
      );
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

        console.log(`${MFE_CONFIG.legacyServiceExplorer.displayName} unmounted successfully`);
      } catch (error) {
        console.error(
          `Error during ${MFE_CONFIG.legacyServiceExplorer.displayName} unmount:`,
          error
        );
      }
    }
  },
};

export default React17MFE;
