import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { MFEModule, MFEServices, getMFEServices } from '@mfe/dev-kit';

// Development mode - render directly
const isDev =
  typeof document !== 'undefined' &&
  document.getElementById('root') !== null &&
  typeof window !== 'undefined' &&
  window.location.port === '3003';

if (isDev) {
  const mockServices = getMFEServices() || {
    logger: {
      debug: (message: string, ...args: any[]) =>
        console.debug(`[EventDemo1-Dev] ${message}`, ...args),
      info: (message: string, ...args: any[]) =>
        console.info(`[EventDemo1-Dev] ${message}`, ...args),
      warn: (message: string, ...args: any[]) =>
        console.warn(`[EventDemo1-Dev] ${message}`, ...args),
      error: (message: string, ...args: any[]) =>
        console.error(`[EventDemo1-Dev] ${message}`, ...args),
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
      emit: (event: string, data: any) => console.log('[Dev EventBus] Emit:', event, data),
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

  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <React.StrictMode>
      <App services={mockServices} instanceId="1" />
    </React.StrictMode>
  );
}

// ES Module export for dynamic imports
let rootElement: ReactDOM.Root | null = null;

const EventDemoMFE: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    // Get instance ID from parent element's data attribute
    const parentWithId = element.closest('[data-instance-id]');
    const instanceId = parentWithId?.getAttribute('data-instance-id') || '1';

    rootElement = ReactDOM.createRoot(element);
    rootElement.render(<App services={services} instanceId={instanceId} />);
  },
  unmount: () => {
    if (rootElement) {
      rootElement.unmount();
      rootElement = null;
    }
  },
};

export default EventDemoMFE;
