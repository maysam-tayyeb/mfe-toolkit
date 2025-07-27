import React, { Component, useEffect, useState } from 'react';
import { MFEServices } from '@mfe/dev-kit';
import { EVENTS } from '@mfe/shared';

interface AppProps {
  services: MFEServices;
}

interface CounterState {
  count: number;
}

// Class component to demonstrate React 17 compatibility
class Counter extends Component<{ onIncrement: () => void }, CounterState> {
  constructor(props: any) {
    super(props);
    this.state = { count: 0 };
  }

  componentDidMount() {
    console.log('Counter component mounted (legacy lifecycle)');
  }

  componentWillUnmount() {
    console.log('Counter component will unmount (legacy lifecycle)');
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 });
    this.props.onIncrement();
  };

  render() {
    return (
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Class Component Counter</h3>
        <p className="mb-2">Count: {this.state.count}</p>
        <button
          onClick={this.increment}
          className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Increment
        </button>
      </div>
    );
  }
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [notifications, setNotifications] = useState(0);
  const [events, setEvents] = useState(0);

  useEffect(() => {
    services.logger.info('React 17 MFE initialized');
    services.logger.info('React 17 MFE mounted');

    // Emit MFE loaded event
    services.eventBus.emit(EVENTS.MFE_LOADED, { name: 'react17', version: '1.0.0' });

    // Subscribe to events
    const handler = (payload: any) => {
      services.logger.info('Received container update', payload);
      setEvents((prev) => prev + 1);
    };
    services.eventBus.on('container:update', handler);

    // Demonstrate componentDidMount pattern
    services.logger.info('App component mounted with useEffect');

    return () => {
      services.logger.info('React 17 MFE unmounting');
      services.eventBus.off('container:update', handler);
    };
  }, [services]);

  const handleShowUserInfo = () => {
    try {
      const session = services.auth.getSession();
      if (session) {
        services.modal.open({
          title: 'User Information',
          content: (
            <div className="space-y-2">
              <p>
                <strong>Username:</strong> {session.username}
              </p>
              <p>
                <strong>Email:</strong> {session.email}
              </p>
              <p>
                <strong>Roles:</strong> {session.roles.join(', ')}
              </p>
              <p>
                <strong>React Version:</strong> {React.version}
              </p>
            </div>
          ),
          size: 'md',
        });
      } else {
        services.notification.warning('No Session', 'User is not logged in');
      }
    } catch (error) {
      services.logger.error('Failed to show user info', error);
    }
  };

  const handleSendNotification = () => {
    try {
      services.notification.success('React 17 MFE', 'Successfully sent from React 17 MFE!');
      setNotifications((prev) => prev + 1);
    } catch (error) {
      services.logger.error('Failed to send notification', error);
    }
  };

  const handleEmitEvent = () => {
    try {
      services.eventBus.emit('react17:action', {
        message: 'Hello from React 17',
        timestamp: new Date().toISOString(),
      });
      setEvents((prev) => prev + 1);
    } catch (error) {
      services.logger.error('Failed to emit event', error);
    }
  };

  const handleCounterIncrement = () => {
    services.logger.debug('Counter incremented in class component');
  };

  return (
    <div className="space-y-6" data-testid="react17-mfe">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">React 17 MFE Demo</h1>
        <p className="text-gray-600 mt-2">
          Demonstrating React 17 compatibility with shared services from React 19 container
        </p>
      </div>

      {/* Version Info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h2 className="font-semibold mb-2">Version Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">React Version:</span>
            <span className="ml-2 font-mono">{React.version}</span>
          </div>
          <div>
            <span className="text-gray-600">MFE Version:</span>
            <span className="ml-2 font-mono">1.0.0</span>
          </div>
        </div>
      </div>

      {/* Compatibility Status */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Compatibility Status</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Services Connected</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Event Bus Active</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Auth Service Available</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span>Using Container's React 19 Services</span>
          </div>
        </div>
      </div>

      {/* Service Integration Demo */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Service Integration</h3>
          <div className="space-y-2">
            <button
              onClick={handleShowUserInfo}
              className="w-full px-3 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-sm"
            >
              Show User Info
            </button>
            <button
              onClick={handleSendNotification}
              className="w-full px-3 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-sm"
            >
              Send Notification
            </button>
            <button
              onClick={handleEmitEvent}
              className="w-full px-3 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 text-sm"
            >
              Emit Event
            </button>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>Notifications sent: {notifications}</p>
            <p>Events emitted: {events}</p>
          </div>
        </div>

        {/* Class Component Demo */}
        <Counter onIncrement={handleCounterIncrement} />
      </div>

      {/* Legacy Features Demo */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Legacy Features Demo</h3>
        <p className="text-sm text-gray-600">
          This MFE uses React 17 features including class components with legacy lifecycle methods.
          Check the console to see lifecycle logs.
        </p>
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm">
        <h3 className="font-semibold mb-2">Technical Details</h3>
        <ul className="space-y-1 text-gray-600">
          <li>• MFE built with React {React.version}</li>
          <li>• Container provides services via React 19</li>
          <li>• Demonstrates version interoperability</li>
          <li>• Uses class components and hooks</li>
          <li>• Shares Redux store from container</li>
        </ul>
      </div>
    </div>
  );
};
