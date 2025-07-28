import React, { useState, useEffect } from 'react';
import { MFEServices } from '@mfe/dev-kit';
import { EVENTS } from '@mfe/shared';

interface AppProps {
  services: MFEServices;
  instanceId?: string;
}

interface EventLogEntry {
  id: string;
  timestamp: Date;
  type: 'sent' | 'received';
  event: string;
  data?: any;
}

export const App: React.FC<AppProps> = ({ services, instanceId = '1' }) => {
  const mfeName = `event-demo-${instanceId}`;
  
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [customEventName, setCustomEventName] = useState(`${mfeName}.action`);
  const [customEventData, setCustomEventData] = useState(
    `{"message": "Hello from Event Demo MFE instance ${instanceId}"}` 
  );

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
      ].slice(-10) // Keep last 10 events
    );
  };

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

  useEffect(() => {
    // Initial load event
    services.logger.info(`Event Demo MFE instance ${instanceId} mounted successfully`);
    services.eventBus.emit(EVENTS.MFE_LOADED, { name: mfeName, version: '1.0.0' });
    addToEventLog('sent', EVENTS.MFE_LOADED, { name: mfeName, version: '1.0.0' });

    // Subscribe to container events
    const unsubscribeContainer = services.eventBus.on('container.broadcast', (payload) => {
      addToEventLog('received', 'container.broadcast', payload.data);
      services.logger.info('Received container broadcast', payload);
    });

    // Subscribe to other instance events
    const otherInstanceId = instanceId === '1' ? '2' : '1';
    const unsubscribeOther = services.eventBus.on(`event-demo-${otherInstanceId}.action`, (payload) => {
      addToEventLog('received', `event-demo-${otherInstanceId}.action`, payload.data);
    });

    return () => {
      unsubscribeContainer();
      unsubscribeOther();
      services.logger.info(`Event Demo MFE instance ${instanceId} unmounting`);
      services.eventBus.emit(EVENTS.MFE_UNLOADED, { name: mfeName });
    };
  }, [services, instanceId, mfeName]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Event Demo MFE - Instance {instanceId}</h2>
        <p className="text-muted-foreground">Demonstrating event communication with the container</p>
      </div>

      {/* Send Events */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Send Event</h3>
        <input
          type="text"
          value={customEventName}
          onChange={(e) => setCustomEventName(e.target.value)}
          placeholder="Event name"
          className="w-full px-3 py-2 border rounded-md"
        />
        <textarea
          value={customEventData}
          onChange={(e) => setCustomEventData(e.target.value)}
          placeholder="Event data (JSON)"
          className="w-full px-3 py-2 border rounded-md font-mono text-sm"
          rows={3}
        />
        <button
          onClick={sendCustomEvent}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Emit Event
        </button>
      </div>

      {/* Event Log */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Event Log</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {eventLog.length === 0 ? (
            <p className="text-muted-foreground">No events yet...</p>
          ) : (
            eventLog.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded border ${
                  entry.type === 'sent' 
                    ? 'border-l-4 border-l-primary' 
                    : 'border-l-4 border-l-muted-foreground'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold">
                      {entry.type === 'sent' ? '→ Sent' : '← Received'}
                    </span>
                    <code className="ml-2 text-sm">{entry.event}</code>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {entry.data && (
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(entry.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};