import React, { Component, useEffect, useState } from 'react';
import { MFEServices } from '@mfe/dev-kit';
import { EVENTS } from '@mfe/shared';

interface AppProps {
  services: MFEServices;
}

interface EventLogEntry {
  id: string;
  timestamp: Date;
  type: 'sent' | 'received';
  event: string;
  data?: any;
}

// Class component to demonstrate React 17 compatibility
class Counter extends Component<{ onIncrement: () => void }, { count: number }> {
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
      <div className="text-center space-y-3">
        <p className="text-2xl font-bold">Count: {this.state.count}</p>
        <button
          onClick={this.increment}
          className="inline-flex items-center justify-center h-9 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Increment
        </button>
      </div>
    );
  }
}

export const App: React.FC<AppProps> = ({ services }) => {
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [isListening, setIsListening] = useState(true);
  const [customEventName, setCustomEventName] = useState('');
  const [customEventData, setCustomEventData] = useState('');

  const addToEventLog = (type: 'sent' | 'received', event: string, data?: any) => {
    setEventLog((prev) =>
      [
        ...prev,
        {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          type,
          event,
          data,
        },
      ].slice(-10)
    ); // Keep last 10 events
  };

  // Modal Examples
  const modalExamples = [
    {
      title: 'Simple Modal',
      action: () => {
        services.modal.open({
          title: 'React 17 Simple Modal',
          content: 'This modal is triggered from a React 17 MFE!',
          size: 'sm',
        });
      },
    },
    {
      title: 'Class Component Modal',
      action: () => {
        services.modal.open({
          title: 'React 17 Class Components',
          content: `This MFE demonstrates React 17 features:
• Class components with lifecycle methods
• Legacy componentDidMount/componentWillUnmount
• ReactDOM.render instead of createRoot
• Compatible with React 19 container`,
          size: 'md',
        });
      },
    },
    {
      title: 'User Info Modal',
      action: () => {
        const session = services.auth.getSession();
        if (session) {
          services.modal.open({
            title: 'User Information',
            content: `Username: ${session.username}
Email: ${session.email}
React Version: ${React.version}
Roles: ${session.roles.join(', ')}
Permissions: ${session.permissions.join(', ')}`,
            size: 'md',
          });
        } else {
          services.notification.warning('No Session', 'User is not logged in');
        }
      },
    },
  ];

  // Notification Types
  const notificationTypes = [
    { type: 'success', method: services.notification.success },
    { type: 'error', method: services.notification.error },
    { type: 'warning', method: services.notification.warning },
    { type: 'info', method: services.notification.info },
  ];

  // Event Bus Functions
  const sendCustomEvent = () => {
    if (customEventName.trim()) {
      try {
        const data = customEventData ? JSON.parse(customEventData) : {};
        services.eventBus.emit(customEventName as any, data);
        addToEventLog('sent', customEventName, data);
        services.notification.success('Event Sent', `Event "${customEventName}" emitted`);
        // Clear form
        setCustomEventName('');
        setCustomEventData('');
      } catch (error) {
        services.notification.error('Invalid JSON', 'Please enter valid JSON data');
      }
    }
  };

  const clearEventLog = () => {
    setEventLog([]);
    services.notification.info('Event Log Cleared', 'All events have been removed');
  };

  // Logger Functions
  const loggerLevels = [
    { level: 'debug' },
    { level: 'info' },
    { level: 'warn' },
    { level: 'error' },
  ];

  const handleCounterIncrement = () => {
    services.logger.debug('Counter incremented in class component');
    services.eventBus.emit('react17:counter:update', { timestamp: new Date().toISOString() });
  };

  useEffect(() => {
    services.logger.info('React 17 MFE initialized');
    services.logger.info('React 17 MFE mounted');

    // Emit MFE loaded event
    services.eventBus.emit(EVENTS.MFE_LOADED, { name: 'react17', version: '1.0.0' });
    addToEventLog('sent', EVENTS.MFE_LOADED, { name: 'react17', version: '1.0.0' });

    if (!isListening) return;

    // Subscribe to events
    const unsubscribes: Array<() => void> = [];
    
    const unsubscribe1 = services.eventBus.on('container:update', (payload: any) => {
      services.logger.info('Received container update', payload);
      addToEventLog('received', 'container:update', payload.data);
    });
    if (unsubscribe1) unsubscribes.push(unsubscribe1);
    
    const unsubscribe2 = services.eventBus.on(EVENTS.AUTH_CHANGED, (payload) => {
      addToEventLog('received', EVENTS.AUTH_CHANGED, payload.data);
    });
    if (unsubscribe2) unsubscribes.push(unsubscribe2);
    
    const unsubscribe3 = services.eventBus.on(EVENTS.MFE_LOADED, (payload) => {
      addToEventLog('received', EVENTS.MFE_LOADED, payload.data);
    });
    if (unsubscribe3) unsubscribes.push(unsubscribe3);
    
    const unsubscribe4 = services.eventBus.on(EVENTS.MFE_UNLOADED, (payload) => {
      addToEventLog('received', EVENTS.MFE_UNLOADED, payload.data);
    });
    if (unsubscribe4) unsubscribes.push(unsubscribe4);

    return () => {
      services.logger.info('React 17 MFE unmounting');
      unsubscribes.forEach(fn => fn && typeof fn === 'function' && fn());
      services.eventBus.emit(EVENTS.MFE_UNLOADED, { name: 'react17' });
    };
  }, [services, isListening]);

  return (
    <div className="space-y-8" data-testid="react17-mfe">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">React 17 MFE Service Explorer</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrating React 17 compatibility with React 19 container services
        </p>
      </div>

      {/* Version Info */}
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
        <h2 className="font-semibold mb-2">Version Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">React Version:</span>
            <p className="font-mono font-medium">{React.version}</p>
          </div>
          <div>
            <span className="text-muted-foreground">MFE Version:</span>
            <p className="font-mono font-medium">1.0.0</p>
          </div>
          <div>
            <span className="text-muted-foreground">Module Format:</span>
            <p className="font-medium">ES Module</p>
          </div>
          <div>
            <span className="text-muted-foreground">Dev Port:</span>
            <p className="font-medium">3002</p>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Modal Service */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Modal Service</h2>
          <p className="text-sm text-muted-foreground">
            Display modals in the React 19 container from React 17 MFE
          </p>
          <div className="flex flex-col gap-2">
            {modalExamples.map((example) => (
              <button
                key={example.title}
                onClick={example.action}
                className="inline-flex items-center justify-center h-9 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
              >
                {example.title}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Service */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Notification Service</h2>
          <p className="text-sm text-muted-foreground">
            Show notifications using the container's notification system
          </p>
          <div className="grid grid-cols-2 gap-2">
            {notificationTypes.map(({ type, method }) => (
              <button
                key={type}
                onClick={() =>
                  method(
                    `React 17 ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                    `This is a ${type} message from React 17 MFE`
                  )
                }
                className="inline-flex items-center justify-center h-9 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium capitalize"
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Class Component Demo */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Class Component Demo</h2>
          <p className="text-sm text-muted-foreground">
            React 17 class component with legacy lifecycle methods
          </p>
          <Counter onIncrement={handleCounterIncrement} />
        </div>

        {/* Logger Service */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Logger Service</h2>
          <p className="text-sm text-muted-foreground">
            Log messages at different levels (check browser console)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {loggerLevels.map(({ level }) => (
              <button
                key={level}
                onClick={() => {
                  services.logger[level as keyof typeof services.logger](
                    `React 17 ${level} message at ${new Date().toLocaleTimeString()}`
                  );
                  services.notification.info('Logged', `Check console for ${level} message`);
                }}
                className="inline-flex items-center justify-center h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors text-sm font-medium capitalize"
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event Bus and Event Log */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Bus */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Event Bus</h2>
          <p className="text-sm text-muted-foreground">
            Send and receive events between MFEs and the container
          </p>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={customEventName}
                onChange={(e) => setCustomEventName(e.target.value)}
                placeholder="Event name"
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                aria-label="Event Type:"
              />
              <button
                onClick={() => setIsListening(!isListening)}
                className={`inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium transition-colors ${
                  isListening
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isListening ? 'Listening' : 'Paused'}
              </button>
            </div>
            <textarea
              value={customEventData}
              onChange={(e) => setCustomEventData(e.target.value)}
              placeholder='Event data (JSON format, e.g., {"key": "value"})'
              className="w-full px-3 py-2 border rounded-md text-sm h-20"
              aria-label="Event Data (JSON):"
            />
            <div className="flex gap-2">
              <button
                onClick={sendCustomEvent}
                className="inline-flex items-center justify-center h-9 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Emit Event
              </button>
              <button
                onClick={clearEventLog}
                className="inline-flex items-center justify-center h-9 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
              >
                Clear Log
              </button>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Event Log</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {eventLog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No events logged yet. Send an event to see it here.
              </p>
            ) : (
              eventLog.map((entry) => (
                <div key={entry.id} className="p-3 bg-muted rounded-md text-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {entry.type === 'sent' ? 'Sent' : 'Received'}
                        </span>
                        <code className="px-2 py-0.5 bg-background rounded text-xs">
                          {entry.event}
                        </code>
                      </div>
                      {entry.data && (
                        <pre className="text-xs text-muted-foreground overflow-x-auto">
                          {JSON.stringify(entry.data, null, 2)}
                        </pre>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Legacy Features Section */}
      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Legacy React 17 Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium">This MFE demonstrates:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Class components with constructor and state</li>
              <li>Legacy lifecycle methods (componentDidMount, componentWillUnmount)</li>
              <li>ReactDOM.render instead of React 18+ createRoot</li>
              <li>React 17.0.2 running inside React 19 container</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Compatibility Status:</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-muted-foreground">Services Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-muted-foreground">Event Bus Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-muted-foreground">Shared Redux Store</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-muted-foreground">Cross-version Communication</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Technical Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">React Version:</span>
            <p className="font-medium">{React.version}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Build Format:</span>
            <p className="font-medium">ES Module</p>
          </div>
          <div>
            <span className="text-muted-foreground">Bundle Size:</span>
            <p className="font-medium">~260KB</p>
          </div>
          <div>
            <span className="text-muted-foreground">Container React:</span>
            <p className="font-medium">19.1.0</p>
          </div>
          <div>
            <span className="text-muted-foreground">Shared Deps:</span>
            <p className="font-medium">Via Import Map</p>
          </div>
          <div>
            <span className="text-muted-foreground">TypeScript:</span>
            <p className="font-medium">^5.3.3</p>
          </div>
        </div>
      </div>
    </div>
  );
};