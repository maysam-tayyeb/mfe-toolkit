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
    
    // The key fix: use legacy ReactDOM.render instead of createRoot
    // This avoids conflicts with React 19's stricter root management
    const React = (window as any).React;
    const ReactDOM = (window as any).ReactDOM;
    
    if (ReactDOM.render) {
      // Use legacy render method
      ReactDOM.render(
        React.createElement(App, { services }),
        element
      );
    } else {
      // Fallback to createRoot but on a child element
      const mountPoint = document.createElement('div');
      element.appendChild(mountPoint);
      
      reactRoot = ReactDOM.createRoot(mountPoint);
      reactRoot.render(
        React.createElement(App, { services })
      );
    }
    
    console.log('MFE mounted successfully');
  },
  unmount: () => {
    if (reactRoot) {
      reactRoot.unmount();
      reactRoot = null;
    }
  },
};

export default ExampleMFE;
