import { useState, useEffect } from 'react';
import type { MFEServices, EventPayload } from '@mfe/dev-kit';

export function TypedEventDemo({ services }: { services: MFEServices }) {
  const [lastEvent, setLastEvent] = useState<string>('No events received');
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    // Access the typed event bus API
    const typedEventBus = (services.eventBus as any).typed;

    if (!typedEventBus) {
      // Fallback to untyped if not available
      const unsubscribe = services.eventBus.on('user:action', (payload: EventPayload<any>) => {
        setLastEvent(`User action: ${payload.data.action}`);
        setEventCount((prev) => prev + 1);
      });
      return unsubscribe;
    }

    // Use typed event handlers for better type safety
    const unsubscribe = typedEventBus.on('user:action', (event: any) => {
      // TypeScript knows the shape of event.data
      setLastEvent(`User action: ${event.data.action} on ${event.data.target || 'unknown'}`);
      setEventCount((prev) => prev + 1);
    });

    return unsubscribe;
  }, [services.eventBus]);

  const sendTypedEvent = () => {
    const typedEventBus = (services.eventBus as any).typed;

    if (!typedEventBus) {
      // Fallback to untyped
      services.eventBus.emit('user:action', {
        action: 'button-click',
        target: 'typed-demo-button',
        data: { timestamp: Date.now() },
      });
      return;
    }

    // Use typed emit for compile-time safety
    typedEventBus.emit('user:action', {
      action: 'button-click',
      target: 'typed-demo-button',
      data: { timestamp: Date.now() },
    });
  };

  const sendBroadcast = () => {
    const typedEventBus = (services.eventBus as any).typed;

    if (!typedEventBus) {
      // Fallback to untyped
      services.eventBus.emit('broadcast:message', {
        from: 'example-mfe',
        to: 'all',
        message: { text: 'Hello from Example MFE!', timestamp: Date.now() },
        priority: 'normal',
      });
      return;
    }

    // Typed broadcast with all required fields
    typedEventBus.emit('broadcast:message', {
      from: 'example-mfe',
      to: 'all',
      message: { text: 'Hello from Example MFE!', timestamp: Date.now() },
      priority: 'normal',
    });
  };

  const showEventStats = async () => {
    const typedEventBus = (services.eventBus as any).typed;

    if (!typedEventBus || !typedEventBus.getStats) {
      services.notification.show({
        title: 'Stats Not Available',
        message: 'Event statistics are only available with typed event bus',
        type: 'warning',
      });
      return;
    }

    const stats = typedEventBus.getStats();
    services.notification.show({
      title: 'Event Bus Statistics',
      message: `Total events: ${stats.totalEvents}, Handlers: ${Object.keys(stats.handlerCounts).length}`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Typed Event Bus Demo</h3>

      <div className="p-4 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">Last Event: {lastEvent}</p>
        <p className="text-sm text-gray-600">Total Events Received: {eventCount}</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={sendTypedEvent}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send Typed Event
        </button>

        <button
          onClick={sendBroadcast}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
        >
          Send Broadcast
        </button>

        <button
          onClick={showEventStats}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 ml-2"
        >
          Show Stats
        </button>
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p>This demo shows the typed event bus in action with:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Type-safe event emission and handling</li>
          <li>Event statistics tracking</li>
          <li>Backward compatibility with untyped API</li>
        </ul>
      </div>
    </div>
  );
}
