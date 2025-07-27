import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/store/notificationSlice';
import { EventBusImpl, EventPayload } from '@mfe/dev-kit';
import { createMFEServices } from '@/services/mfe-services';
import { MFELoader } from '@mfe/dev-kit';

interface EventLogEntry {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  data: any;
  direction: 'sent' | 'received';
}

export const MFECommunicationPage: React.FC = () => {
  const dispatch = useDispatch();
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [customEventType, setCustomEventType] = useState('custom.test');
  const [customEventData, setCustomEventData] = useState('{"message": "Hello from container!"}');
  const [eventBus] = useState(() => new EventBusImpl());

  // Create MFE services with shared event bus
  const mfeServices = useMemo(() => {
    const services = createMFEServices();
    // Use our shared event bus instead of the service's one
    services.eventBus = eventBus;
    return services;
  }, [eventBus]);

  useEffect(() => {
    // Store event bus on window for MFEs to access
    (window as any).__EVENT_BUS__ = eventBus;
    (window as any).__MFE_SERVICES__ = mfeServices;

    // Listen to all events and log them
    const allEventTypes = [
      'mfe.loaded',
      'mfe.unloaded',
      'mfe.error',
      'user.action',
      'data.updated',
      'navigation.changed',
      'custom.test',
      'inter-mfe.message',
      'demo.event',
    ];

    const unsubscribes = allEventTypes.map((eventType) =>
      eventBus.on(eventType, (payload: EventPayload<any>) => {
        const logEntry: EventLogEntry = {
          id: Date.now() + Math.random().toString(),
          timestamp: new Date(payload.timestamp),
          type: payload.type,
          source: payload.source || 'unknown',
          data: payload.data,
          direction: payload.source === 'container' ? 'sent' : 'received',
        };

        setEventLog((prev) => [logEntry, ...prev].slice(0, 50)); // Keep last 50 events
      })
    );

    // Add initial log entry
    const initialEntry: EventLogEntry = {
      id: 'init',
      timestamp: new Date(),
      type: 'system.initialized',
      source: 'container',
      data: { message: 'MFE Communication page loaded' },
      direction: 'sent',
    };
    setEventLog([initialEntry]);

    return () => {
      unsubscribes.forEach((fn) => fn());
    };
  }, [eventBus, mfeServices]);

  const handlePublishEvent = () => {
    try {
      const data = JSON.parse(customEventData);
      eventBus.emit(customEventType, data);

      dispatch(
        addNotification({
          type: 'success',
          title: 'Event Published',
          message: `Published "${customEventType}" event to both MFEs`,
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Invalid JSON',
          message: 'Please check your event data format',
        })
      );
    }
  };

  const handleSendInterMFEMessage = () => {
    const message = {
      from: 'container',
      to: 'all-mfes',
      content: 'This is a message from the container to demonstrate inter-MFE communication',
      timestamp: new Date().toISOString(),
    };

    eventBus.emit('inter-mfe.message', message);

    dispatch(
      addNotification({
        type: 'info',
        title: 'Inter-MFE Message Sent',
        message: 'Message broadcast to all MFEs via event bus',
      })
    );
  };

  const clearEventLog = () => {
    setEventLog([]);
    dispatch(
      addNotification({
        type: 'info',
        title: 'Event Log Cleared',
        message: 'All event log entries have been cleared',
      })
    );
  };

  const formatEventData = (data: any) => {
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">MFE Communication Center</h1>
        <p className="text-muted-foreground mt-2">
          Test inter-MFE communication with real-time event monitoring
        </p>
      </div>

      {/* Event Bus Controls */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Event Bus Controls</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-medium">Custom Event Publisher</h3>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium">Event Type</label>
                <input
                  type="text"
                  value={customEventType}
                  onChange={(e) => setCustomEventType(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  placeholder="custom.test"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Event Data (JSON)</label>
                <textarea
                  value={customEventData}
                  onChange={(e) => setCustomEventData(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm font-mono"
                  rows={3}
                  placeholder='{"message": "Hello from container!"}'
                />
              </div>
              <Button onClick={handlePublishEvent} size="sm">
                Publish Event
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                onClick={handleSendInterMFEMessage}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Send Inter-MFE Message
              </Button>
              <Button
                onClick={() =>
                  eventBus.emit('demo.event', {
                    type: 'demo',
                    message: 'Demo event from container',
                  })
                }
                variant="secondary"
                size="sm"
                className="w-full"
              >
                Send Demo Event
              </Button>
              <Button onClick={clearEventLog} variant="outline" size="sm" className="w-full">
                Clear Event Log
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Real-time Event Log</h2>
          <div className="text-sm text-muted-foreground">{eventLog.length} events logged</div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {eventLog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events logged yet. Interact with the MFEs below to see events.
            </div>
          ) : (
            eventLog.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded border-l-4 ${
                  entry.direction === 'sent'
                    ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{entry.type}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        entry.direction === 'sent'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {entry.direction === 'sent' ? '→ OUT' : '← IN'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  <span>
                    From: <strong>{entry.source}</strong>
                  </span>
                </div>
                <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded border overflow-x-auto">
                  {formatEventData(entry.data)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Two-Column MFE Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Example MFE (React 19)</h3>
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
              Port 3001
            </span>
          </div>
          <div className="border rounded-md overflow-hidden">
            <MFELoader
              name="example"
              url="http://localhost:3001/mfe-example.js"
              services={mfeServices}
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading Example MFE...</p>
                  </div>
                </div>
              }
              onError={(error) => {
                dispatch(
                  addNotification({
                    type: 'error',
                    title: 'MFE Load Error',
                    message: `Failed to load Example MFE: ${error.message}`,
                  })
                );
              }}
            />
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">React 17 MFE</h3>
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
              Port 3002
            </span>
          </div>
          <div className="border rounded-md overflow-hidden">
            <MFELoader
              name="react17"
              url="http://localhost:3002/react17-mfe.js"
              services={mfeServices}
              fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading React 17 MFE...</p>
                  </div>
                </div>
              }
              onError={(error) => {
                dispatch(
                  addNotification({
                    type: 'error',
                    title: 'MFE Load Error',
                    message: `Failed to load React 17 MFE: ${error.message}`,
                  })
                );
              }}
            />
          </div>
        </div>
      </div>

      {/* Communication Statistics */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Communication Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Events:</span>
            <p className="font-medium">{eventLog.length}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Events Sent:</span>
            <p className="font-medium">{eventLog.filter((e) => e.direction === 'sent').length}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Events Received:</span>
            <p className="font-medium">
              {eventLog.filter((e) => e.direction === 'received').length}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Active MFEs:</span>
            <p className="font-medium">2</p>
          </div>
        </div>
      </div>
    </div>
  );
};
