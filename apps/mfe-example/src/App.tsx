import React, { useState } from 'react';
import { MFEServices } from '@mfe/dev-kit';
import { EVENTS } from '@mfe/shared';

interface AppProps {
  services: MFEServices;
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [eventLog, setEventLog] = useState<string[]>([]);

  const handleTestModal = () => {
    services.modal.open({
      title: 'MFE Modal Example',
      content: (
        <div>
          <p>This modal was triggered from the Example MFE!</p>
          <p className="text-sm text-gray-600 mt-2">
            It demonstrates cross-app communication using the modal service.
          </p>
        </div>
      ),
      size: 'md',
      onConfirm: () => {
        services.notification.success('Modal Confirmed', 'Action completed from MFE');
      },
    });
  };

  const handleTestNotifications = () => {
    services.notification.info('MFE Notification', 'This is from the Example MFE');

    setTimeout(() => {
      services.notification.success('Success!', 'MFE loaded successfully');
    }, 1000);
  };

  const handleTestEventBus = () => {
    const message = `Event from MFE at ${new Date().toLocaleTimeString()}`;
    services.eventBus.emit(EVENTS.MFE_LOADED, { message });
    setEventLog([...eventLog, `Sent: ${message}`]);
  };

  const handleTestAuth = () => {
    const session = services.auth.getSession();
    if (session) {
      services.notification.info(
        'Auth Info',
        `Logged in as ${session.username} (${session.email})`
      );
    } else {
      services.notification.warning('Not Authenticated', 'No active session');
    }
  };

  const handleTestLogger = () => {
    services.logger.debug('Debug message from MFE');
    services.logger.info('Info message from MFE');
    services.logger.warn('Warning message from MFE');
    services.logger.error('Error message from MFE');
    services.notification.info('Logger Test', 'Check the console for log messages');
  };

  React.useEffect(() => {
    // Subscribe to events
    const unsubscribe = services.eventBus.on(EVENTS.AUTH_CHANGED, (payload) => {
      setEventLog((prev) => [...prev, `Received: Auth changed - ${JSON.stringify(payload.data)}`]);
    });

    // Log MFE loaded
    services.logger.info('Example MFE mounted successfully');
    services.eventBus.emit(EVENTS.MFE_LOADED, { name: 'example', version: '1.0.0' });

    return () => {
      unsubscribe();
      services.logger.info('Example MFE unmounting');
    };
  }, [services]);

  return (
    <div className="space-y-6" data-testid="mfe-content">
      <div>
        <h1 className="text-3xl font-bold">Example Microfrontend</h1>
        <p className="text-gray-600 mt-2">
          This MFE demonstrates integration with container services.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Modal Service</h3>
          <p className="text-sm text-gray-600 mb-3">Trigger modals in the container app</p>
          <button
            onClick={handleTestModal}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Open Modal
          </button>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Notification Service</h3>
          <p className="text-sm text-gray-600 mb-3">Show notifications in the container</p>
          <button
            onClick={handleTestNotifications}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Show Notifications
          </button>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Event Bus</h3>
          <p className="text-sm text-gray-600 mb-3">Send events to other components</p>
          <button
            onClick={handleTestEventBus}
            className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Send Event
          </button>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Auth Service</h3>
          <p className="text-sm text-gray-600 mb-3">Check authentication status</p>
          <button
            onClick={handleTestAuth}
            className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
          >
            Check Auth
          </button>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Logger Service</h3>
          <p className="text-sm text-gray-600 mb-3">Log messages to console</p>
          <button
            onClick={handleTestLogger}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Test Logger
          </button>
        </div>
      </div>

      {eventLog.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Event Log</h3>
          <div className="space-y-1 text-sm font-mono">
            {eventLog.map((log, index) => (
              <div key={index} className="text-gray-600">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="font-semibold mb-2">MFE Information</h3>
        <dl className="space-y-1 text-sm">
          <div>
            <dt className="inline font-medium">Name:</dt>
            <dd className="inline ml-2 text-gray-600">Example MFE</dd>
          </div>
          <div>
            <dt className="inline font-medium">Version:</dt>
            <dd className="inline ml-2 text-gray-600">1.0.0</dd>
          </div>
          <div>
            <dt className="inline font-medium">Port:</dt>
            <dd className="inline ml-2 text-gray-600">3001</dd>
          </div>
          <div>
            <dt className="inline font-medium">Build Format:</dt>
            <dd className="inline ml-2 text-gray-600">UMD</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
