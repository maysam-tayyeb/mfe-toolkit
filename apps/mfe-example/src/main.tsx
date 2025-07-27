import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { MFEModule, MFEServices, getMFEServices } from '@mfe/dev-kit';

// Development mode - render directly (only when accessing the page directly)
const isDev = typeof document !== 'undefined' && document.getElementById('root') !== null;
if (isDev) {
  const mockServices = getMFEServices() || {
    logger: console,
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
const ExampleMFE: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    const root = ReactDOM.createRoot(element);
    root.render(
      <React.StrictMode>
        <App services={services} />
      </React.StrictMode>
    );
  },
  unmount: () => {
    // Unmounting is handled by React
  },
};

// Export as default for ES module dynamic imports
export default ExampleMFE;
