import React, { useEffect, useState } from 'react';
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

// Inline component for consistent info blocks
interface InfoBlockProps {
  title: string;
  sections: Array<{
    label: string;
    value: string | React.ReactNode;
    highlight?: boolean;
  }>;
  className?: string;
}

const InfoBlock: React.FC<InfoBlockProps> = ({ title, sections, className = '' }) => (
  <div className={`bg-muted/50 rounded-lg p-6 ${className}`}>
    <h3 className="font-semibold mb-3">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      {sections.map((section, index) => (
        <div key={index}>
          <span className="text-muted-foreground">{section.label}:</span>
          <p className={`font-medium ${section.highlight ? 'text-primary' : ''}`}>
            {section.value}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export const App: React.FC<AppProps> = ({ services }) => {
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [customEventName, setCustomEventName] = useState('react17.status');
  const [customEventData, setCustomEventData] = useState(
    '{"status": "active", "component": "Legacy Service Explorer MFE"}'
  );
  const [listeningEvents, setListeningEvents] = useState<string[]>([]);
  const [newEventToListen, setNewEventToListen] = useState('container.broadcast');
  const [eventUnsubscribes, setEventUnsubscribes] = useState<Map<string, () => void>>(new Map());

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
          content: 'This modal is triggered from a Legacy Service Explorer MFE!',
          size: 'sm',
        });
      },
    },
    {
      title: 'Compatibility Info',
      action: () => {
        services.modal.open({
          title: 'React 17 Compatibility',
          content: `This MFE demonstrates cross-version support:
• React 17.0.2 running inside React 19 container
• ReactDOM.render instead of createRoot
• Full service integration across versions
• Seamless event bus communication`,
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

  // Dynamic event listening functions
  const startListeningToEvent = () => {
    if (!newEventToListen.trim() || listeningEvents.includes(newEventToListen)) {
      services.notification.warning('Invalid Event', 'Event name is empty or already listening');
      return;
    }

    // Subscribe to the new event
    const unsubscribe = services.eventBus.on(newEventToListen as any, (payload) => {
      addToEventLog('received', newEventToListen, payload.data);
      services.notification.info(
        'Custom Event Received',
        `Received "${newEventToListen}" event from ${payload.source || 'unknown'}`
      );
    });

    // Store the unsubscribe function
    setEventUnsubscribes((prev) => new Map(prev).set(newEventToListen, unsubscribe));
    setListeningEvents((prev) => [...prev, newEventToListen]);
    services.notification.success(
      'Listening Started',
      `Now listening to "${newEventToListen}" events`
    );
    setNewEventToListen('');
  };

  const stopListeningToEvent = (eventName: string) => {
    const unsubscribe = eventUnsubscribes.get(eventName);
    if (unsubscribe) {
      unsubscribe();
      setEventUnsubscribes((prev) => {
        const newMap = new Map(prev);
        newMap.delete(eventName);
        return newMap;
      });
      setListeningEvents((prev) => prev.filter((e) => e !== eventName));
      services.notification.info('Listening Stopped', `Stopped listening to "${eventName}" events`);
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
    services.logger.info('Legacy Service Explorer MFE initialized');
    services.logger.info('Legacy Service Explorer MFE mounted');

    // Emit MFE loaded event
    services.eventBus.emit(EVENTS.MFE_LOADED, { name: 'react17', version: '1.0.0' });
    addToEventLog('sent', EVENTS.MFE_LOADED, { name: 'react17', version: '1.0.0' });

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
      services.logger.info('Legacy Service Explorer MFE unmounting');
      unsubscribes.forEach((fn) => fn && typeof fn === 'function' && fn());
      services.eventBus.emit(EVENTS.MFE_UNLOADED, { name: 'react17' });
    };
  }, [services]);

  // Cleanup dynamic event listeners on unmount
  useEffect(() => {
    return () => {
      eventUnsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <div className="space-y-8" data-testid="react17-mfe">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Legacy Service Explorer</h1>
        <p className="text-muted-foreground mt-2">
          Demonstrating React 17 compatibility with React 19 container services
        </p>
      </div>

      {/* Event Bus and Event Log */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Bus */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Event Bus</h2>
          <p className="text-sm text-muted-foreground">
            Send and receive events between MFEs and the container
          </p>

          {/* Dynamic Event Listening */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Listen to Events</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newEventToListen}
                onChange={(e) => setNewEventToListen(e.target.value)}
                placeholder="Event name to listen (e.g., container.broadcast)"
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                onKeyPress={(e) => e.key === 'Enter' && startListeningToEvent()}
              />
              <button
                onClick={startListeningToEvent}
                className="inline-flex items-center justify-center h-9 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Listen
              </button>
            </div>
            {listeningEvents.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Currently listening to:</p>
                <div className="flex flex-wrap gap-1">
                  {listeningEvents.map((event) => (
                    <span
                      key={event}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                    >
                      {event}
                      <button
                        onClick={() => stopListeningToEvent(event)}
                        className="ml-1 hover:text-primary/80"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-3"></div>

          {/* Send Events */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Send Events</h3>
            <input
              type="text"
              value={customEventName}
              onChange={(e) => setCustomEventName(e.target.value)}
              placeholder="Event name to send (e.g., react17.status)"
              className="w-full px-3 py-2 border rounded-md text-sm"
              aria-label="Event Type:"
            />
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
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '300px' }}>
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

      {/* Service Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Modal Service */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Modal Service</h2>
          <p className="text-sm text-muted-foreground">
            Display modals in the React 19 container from Legacy Service Explorer MFE
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
                    `This is a ${type} message from Legacy Service Explorer MFE`
                  )
                }
                className="inline-flex items-center justify-center h-9 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium capitalize"
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Auth Service */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Auth Service</h2>
          <p className="text-sm text-muted-foreground">
            Access authentication state and user information
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
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
                          <span
                            className={session.isAuthenticated ? 'text-green-600' : 'text-red-600'}
                          >
                            {session.isAuthenticated ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Roles:</p>
                          <div className="flex flex-wrap gap-1">
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
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Permissions:</p>
                          <div className="flex flex-wrap gap-1">
                            {session.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ),
                    size: 'md',
                  });
                } else {
                  services.notification.warning('No Session', 'User is not logged in');
                }
              }}
              className="inline-flex items-center justify-center h-9 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
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
              className="inline-flex items-center justify-center h-9 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
            >
              Check Write Permission
            </button>
          </div>
        </div>

        {/* Logger Service */}
        <div className="border rounded-lg p-6 space-y-4 md:col-span-2">
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
                className="inline-flex items-center justify-center h-9 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors text-sm font-medium capitalize"
              >
                {level}
              </button>
            ))}
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
              <li>React 17.0.2 running inside React 19 container</li>
              <li>ReactDOM.render instead of React 18+ createRoot</li>
              <li>Full compatibility with all platform services</li>
              <li>Cross-version event bus communication</li>
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

      {/* MFE Configuration */}
      <InfoBlock
        title="MFE Configuration"
        sections={[
          { label: 'Name', value: 'Legacy Service Explorer' },
          { label: 'Package', value: '@mfe/react17-mfe' },
          { label: 'Version', value: '1.0.0' },
          { label: 'Dev Port', value: '3002' },
          { label: 'Format', value: 'ESM Module', highlight: true },
          { label: 'Bundle Size', value: '~159KB', highlight: true },
        ]}
      />

      {/* Shared Dependencies */}
      <InfoBlock
        title="Shared Dependencies"
        sections={[
          { label: 'Redux Toolkit', value: '2.0.1' },
          { label: 'Tailwind CSS', value: '4.1.11' },
          { label: 'TypeScript', value: '5.3.3' },
          { label: 'React Redux', value: '9.1.0' },
          { label: 'MFE Dev Kit', value: '1.0.0' },
          { label: 'Shared Utils', value: '1.0.0' },
        ]}
        className="mt-6"
      />
    </div>
  );
};
