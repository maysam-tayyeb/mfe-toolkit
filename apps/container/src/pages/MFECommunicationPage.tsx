import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/store/notificationSlice';
import { EventPayload } from '@mfe/dev-kit';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';
import { MFELoader } from '@mfe/dev-kit';
import { useMFEUrlsFromContext } from '@/hooks/useMFEUrlsFromContext';
import { EVENTS } from '@mfe/shared';

interface EventLogEntry {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  data: any;
  direction: 'sent' | 'received';
}

interface MFEStatus {
  name: string;
  version: string;
  loadTime: number;
  status: 'loaded' | 'loading' | 'error';
  lastEvent?: string;
}

export const MFECommunicationPage: React.FC = () => {
  const dispatch = useDispatch();
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [mfeStatuses, setMfeStatuses] = useState<Record<string, MFEStatus>>({});
  const [customEventType, setCustomEventType] = useState('custom.test');
  const [customEventData, setCustomEventData] = useState('{"message": "Hello from container!"}');

  // Use the custom hook to get MFE URLs from context (prevents multiple registry instances)
  const { urls: mfeUrls, isLoading: registryLoading } = useMFEUrlsFromContext([
    'example',
    'react17',
  ]);

  // Get singleton MFE services
  const mfeServices = useMemo(() => {
    return getMFEServicesSingleton();
  }, []);

  // Get the shared event bus from services
  const eventBus = mfeServices.eventBus;

  useEffect(() => {
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
      EVENTS.MFE_LOADED,
      EVENTS.MFE_UNLOADED,
    ];

    const unsubscribes = allEventTypes.map((eventType) =>
      eventBus.on(eventType, (payload: EventPayload<any>) => {
        // Track MFE status
        if (eventType === EVENTS.MFE_LOADED || eventType === 'mfe.loaded') {
          const { name, version } = payload.data;
          setMfeStatuses((prev) => ({
            ...prev,
            [name]: {
              name,
              version,
              loadTime: Date.now(),
              status: 'loaded',
              lastEvent: 'loaded',
            },
          }));
        } else if (eventType === EVENTS.MFE_UNLOADED || eventType === 'mfe.unloaded') {
          const { name } = payload.data;
          setMfeStatuses((prev) => {
            const newStatuses = { ...prev };
            delete newStatuses[name];
            return newStatuses;
          });
        }

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

      // Manually add to event log since the container doesn't listen to its own events
      const logEntry: EventLogEntry = {
        id: Date.now() + Math.random().toString(),
        timestamp: new Date(),
        type: customEventType,
        source: 'container',
        data: data,
        direction: 'sent',
      };
      setEventLog((prev) => [logEntry, ...prev].slice(0, 50));

      dispatch(
        addNotification({
          type: 'success',
          title: 'Event Published',
          message: `Published "${customEventType}" event to both MFEs`,
        })
      );
    } catch {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Invalid JSON',
          message: 'Please check your event data format',
        })
      );
    }
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Active MFEs</p>
          <p className="text-2xl font-bold">{Object.keys(mfeStatuses).length}</p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Total Events</p>
          <p className="text-2xl font-bold">{eventLog.length}</p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">From Container</p>
          <p className="text-2xl font-bold">{eventLog.filter((e) => e.direction === 'sent').length}</p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">From MFEs</p>
          <p className="text-2xl font-bold">{eventLog.filter((e) => e.direction === 'received').length}</p>
        </div>
      </div>

      {/* Event Bus Controls and Event Log */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Event Bus Controls */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Event Bus Controls</h2>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <input
                type="text"
                value={customEventType}
                onChange={(e) => setCustomEventType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="custom.test"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Data (JSON)</label>
              <textarea
                value={customEventData}
                onChange={(e) => setCustomEventData(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm font-mono"
                rows={3}
                placeholder='{"message": "Hello from container!"}'
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePublishEvent} size="sm">
                Publish Event
              </Button>
              <Button onClick={clearEventLog} variant="outline" size="sm">
                Clear Event Log
              </Button>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Real-time Event Log</h2>
            <div className="text-sm text-muted-foreground">{eventLog.length} events</div>
          </div>
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '300px' }}>
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
      </div>

      {/* Two-Column MFE Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Service Explorer</h3>
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
              Port 3001
            </span>
          </div>
          <div className="border rounded-md overflow-hidden">
            {!registryLoading && mfeUrls.example ? (
              <MFELoader
                name="example"
                url={mfeUrls.example}
                services={mfeServices}
                fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading Service Explorer...</p>
                    </div>
                  </div>
                }
                onError={(error) => {
                  dispatch(
                    addNotification({
                      type: 'error',
                      title: 'MFE Load Error',
                      message: `Failed to load Service Explorer: ${error.message}`,
                    })
                  );
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-muted-foreground">Loading registry...</p>
              </div>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Legacy Demo</h3>
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
              Port 3002
            </span>
          </div>
          <div className="border rounded-md overflow-hidden">
            {!registryLoading && mfeUrls.react17 ? (
              <MFELoader
                name="react17"
                url={mfeUrls.react17}
                services={mfeServices}
                fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading Legacy Demo...</p>
                    </div>
                  </div>
                }
                onError={(error) => {
                  dispatch(
                    addNotification({
                      type: 'error',
                      title: 'MFE Load Error',
                      message: `Failed to load Legacy Demo: ${error.message}`,
                    })
                  );
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-sm text-muted-foreground">Loading registry...</p>
              </div>
            )}
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
            <span className="text-muted-foreground">From Container:</span>
            <p className="font-medium">{eventLog.filter((e) => e.direction === 'sent').length}</p>
          </div>
          <div>
            <span className="text-muted-foreground">From MFEs:</span>
            <p className="font-medium">
              {eventLog.filter((e) => e.direction === 'received').length}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Active MFEs:</span>
            <p className="font-medium">{Object.keys(mfeStatuses).length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
