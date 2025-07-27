import React, { useState, useEffect } from 'react';
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
          title: 'Simple Modal Example',
          content: <p>This is a basic modal with text content.</p>,
          size: 'sm',
        });
      },
    },
    {
      title: 'Confirmation Modal',
      action: () => {
        services.modal.open({
          title: 'Confirm Action',
          content: (
            <div className="space-y-2">
              <p>Are you sure you want to proceed?</p>
              <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            </div>
          ),
          size: 'md',
          onConfirm: () => {
            services.notification.success('Confirmed', 'Action completed successfully');
          },
        });
      },
    },
    {
      title: 'Form Modal',
      action: () => {
        services.modal.open({
          title: 'User Input',
          content: (
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter your email"
                />
              </div>
            </form>
          ),
          size: 'lg',
          onConfirm: () => {
            services.notification.success('Form Submitted', 'Data saved successfully');
          },
        });
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
      } catch {
        services.notification.error('Invalid JSON', 'Please enter valid JSON data');
      }
    }
  };

  const clearEventLog = () => {
    setEventLog([]);
    services.notification.info('Event Log Cleared', 'All events have been removed');
  };

  // Auth & Session
  const checkSession = () => {
    const session = services.auth.getSession();
    if (session) {
      services.modal.open({
        title: 'Session Information',
        content: (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="font-medium">User ID:</span>
              <span>{session.userId}</span>
              <span className="font-medium">Username:</span>
              <span>{session.username}</span>
              <span className="font-medium">Email:</span>
              <span>{session.email}</span>
              <span className="font-medium">Authenticated:</span>
              <span className={session.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                {session.isAuthenticated ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm font-medium mb-1">Roles:</p>
              <div className="flex gap-2">
                {session.roles.map((role) => (
                  <span
                    key={role}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <p className="text-sm font-medium mb-1">Permissions:</p>
              <div className="flex gap-2 flex-wrap">
                {session.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ),
        size: 'lg',
      });
    } else {
      services.notification.warning('No Session', 'No active session found');
    }
  };

  // Logger Functions
  const loggerLevels = [
    { level: 'debug' },
    { level: 'info' },
    { level: 'warn' },
    { level: 'error' },
  ];

  useEffect(() => {
    if (!isListening) return;

    // Subscribe to common events
    const unsubscribes = [
      services.eventBus.on(EVENTS.AUTH_CHANGED, (payload) => {
        addToEventLog('received', EVENTS.AUTH_CHANGED, payload.data);
      }),
      services.eventBus.on(EVENTS.MFE_LOADED, (payload) => {
        addToEventLog('received', EVENTS.MFE_LOADED, payload.data);
      }),
      services.eventBus.on(EVENTS.MFE_UNLOADED, (payload) => {
        addToEventLog('received', EVENTS.MFE_UNLOADED, payload.data);
      }),
    ];

    // Initial load event
    services.logger.info('Example MFE mounted successfully');
    services.eventBus.emit(EVENTS.MFE_LOADED, { name: 'example', version: '1.0.0' });
    addToEventLog('sent', EVENTS.MFE_LOADED, { name: 'example', version: '1.0.0' });

    return () => {
      unsubscribes.forEach((fn) => fn());
      services.logger.info('Example MFE unmounting');
      services.eventBus.emit(EVENTS.MFE_UNLOADED, { name: 'example' });
    };
  }, [services, isListening]);

  return (
    <div className="space-y-8" data-testid="mfe-content">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">MFE Service Explorer</h1>
        <p className="text-muted-foreground mt-2">
          Interactive demonstration of all available MFE services and capabilities
        </p>
      </div>

      {/* Service Cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Modal Service */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Modal Service</h2>
          <p className="text-sm text-muted-foreground">
            Display modals in the container application with different configurations
          </p>
          <div className="flex flex-col gap-2">
            {modalExamples.map((example) => (
              <button
                key={example.title}
                onClick={example.action}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
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
            Show different types of notifications in the container
          </p>
          <div className="grid grid-cols-2 gap-2">
            {notificationTypes.map(({ type, method }) => (
              <button
                key={type}
                onClick={() =>
                  method(
                    `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
                    `This is a ${type} message from the MFE`
                  )
                }
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm capitalize"
              >
                {type}
              </button>
            ))}
          </div>
        </div>

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
              />
              <button
                onClick={() => setIsListening(!isListening)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
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
            />
            <div className="flex gap-2">
              <button
                onClick={sendCustomEvent}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
              >
                Send Event
              </button>
              <button
                onClick={clearEventLog}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
              >
                Clear Log
              </button>
            </div>
          </div>
        </div>

        {/* Auth Service */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Auth Service</h2>
          <p className="text-sm text-muted-foreground">
            Access authentication state and user information
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={checkSession}
              className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
            >
              View Session Details
            </button>
            <button
              onClick={() => {
                const hasPermission = services.auth.hasPermission('write');
                services.notification.info(
                  'Permission Check',
                  `Has "write" permission: ${hasPermission ? 'Yes' : 'No'}`
                );
              }}
              className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
            >
              Check Write Permission
            </button>
          </div>
        </div>

        {/* Logger Service */}
        <div className="border rounded-lg p-6 space-y-4 lg:col-span-3">
          <h2 className="text-xl font-semibold">Logger Service</h2>
          <p className="text-sm text-muted-foreground">
            Log messages at different levels (check browser console)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {loggerLevels.map(({ level }) => (
              <button
                key={level}
                onClick={() => {
                  services.logger[level as keyof typeof services.logger](
                    `Test ${level} message from MFE at ${new Date().toLocaleTimeString()}`
                  );
                  services.notification.info('Logged', `Check console for ${level} message`);
                }}
                className="px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors text-sm capitalize"
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Event Log */}
      {eventLog.length > 0 && (
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Event Log</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {eventLog.map((entry) => (
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
            ))}
          </div>
        </div>
      )}

      {/* MFE Info */}
      <div className="space-y-6">
        {/* MFE Details */}
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">MFE Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">Example MFE</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Version</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dev Port</p>
              <p className="font-medium">3001</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Format</p>
              <p className="font-medium">ESM Module</p>
            </div>
          </div>
        </div>

        {/* Shared Dependencies */}
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Shared Dependencies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-semibold">R</span>
              </div>
              <div>
                <p className="font-medium">React</p>
                <p className="text-sm text-muted-foreground">{React.version || '19.1.0'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-semibold">R</span>
              </div>
              <div>
                <p className="font-medium">Redux Toolkit</p>
                <p className="text-sm text-muted-foreground">^2.0.1</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-semibold">T</span>
              </div>
              <div>
                <p className="font-medium">Tailwind CSS</p>
                <p className="text-sm text-muted-foreground">^4.1.11</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-semibold">T</span>
              </div>
              <div>
                <p className="font-medium">TypeScript</p>
                <p className="text-sm text-muted-foreground">^5.3.3</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-semibold">R</span>
              </div>
              <div>
                <p className="font-medium">React Redux</p>
                <p className="text-sm text-muted-foreground">^9.1.0</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-semibold">E</span>
              </div>
              <div>
                <p className="font-medium">Import Map</p>
                <p className="text-sm text-muted-foreground">ESM CDN</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
