import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { MFEModule, MFEServices, getMFEServices } from '@mfe/dev-kit';

// Development mode - render directly
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
if (isDev || (typeof window !== 'undefined' && window.location.port === '3001')) {
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

// Production mode - expose as MFE module
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

// Register MFE on window
declare global {
  interface Window {
    example: MFEModule;
  }
}

window.example = ExampleMFE;

// Export for testing
export default ExampleMFE;