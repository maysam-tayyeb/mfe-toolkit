import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { MFEModule, MFEServices, getMFEServices } from '@mfe/dev-kit';

// Development mode - render directly (only when accessing the page directly, not when loaded as ES module)
const isDev = typeof document !== 'undefined' && 
             document.getElementById('root') !== null && 
             typeof window !== 'undefined' && 
             window.location.port === '3001';
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
let reactRoot: any = null;

const ExampleMFE: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    console.log('MFE mounting to element:', element);
    
    try {
      // Use the bundled React directly - no window dependency
      const mountPoint = document.createElement('div');
      element.appendChild(mountPoint);
      
      // Use createRoot with the child element
      reactRoot = ReactDOM.createRoot(mountPoint);
      reactRoot.render(
        React.createElement(App, { services })
      );
      
      console.log('MFE mounted successfully');
    } catch (error) {
      console.error('Error during MFE mount:', error);
      throw error;
    }
  },
  unmount: () => {
    if (reactRoot) {
      try {
        reactRoot.unmount();
        reactRoot = null;
        console.log('MFE unmounted successfully');
      } catch (error) {
        console.error('Error during MFE unmount:', error);
      }
    }
  },
};

export default ExampleMFE;
