import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { EVENTS } from '@mfe/shared';
import { EventBusImpl } from '@mfe/dev-kit';
import type { MFEServices } from '@mfe/dev-kit';
import './index.css';

// React 17 MFE Entry Point
if (process.env.NODE_ENV === 'development') {
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
    ReactDOM.render(<App services={mockServices} />, root);
  }
} else {
  // Production mode - expose for container to mount
  (window as any).React17MFE = {
    mount: (containerId: string) => {
      const services = (window as any).__MFE_SERVICES__;
      if (!services) {
        console.error('React 17 MFE: Services not available');
        return;
      }

      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`React 17 MFE: Container element '${containerId}' not found`);
        return;
      }

      try {
        // React 17 uses ReactDOM.render instead of createRoot
        ReactDOM.render(<App services={services} />, container);

        services.logger.info('React 17 MFE mounted successfully');
        services.eventBus.emit(EVENTS.MFE_LOADED, {
          name: 'react17',
          version: '1.0.0',
          reactVersion: React.version,
        });
      } catch (error) {
        services.logger.error('Failed to render React 17 MFE', error);
      }
    },

    unmount: () => {
      const services = (window as any).__MFE_SERVICES__;
      const container = document.querySelector('[data-testid="react17-mfe"]')?.parentElement;

      if (container) {
        // React 17 unmount
        ReactDOM.unmountComponentAtNode(container);

        if (services) {
          services.eventBus.emit(EVENTS.MFE_UNLOADED, { name: 'react17' });
          services.logger.info('React 17 MFE unmounted');
        }
      }
    },
  };

  // Log initialization
  const services = (window as any).__MFE_SERVICES__;
  if (services) {
    services.logger.info('React 17 MFE initialized');
  }
}
