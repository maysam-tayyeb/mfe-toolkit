import React, { useState, useEffect, useRef } from 'react';
import type { MFEServices } from '@mfe-toolkit/core';

type AppProps = {
  services: MFEServices;
};

type EventMessage = {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  source: string;
};

export default function App({ services }: AppProps) {
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [customEvent, setCustomEvent] = useState('');
  const [customData, setCustomData] = useState('');
  const [subscribedEvents, setSubscribedEvents] = useState<string[]>([
    'user:login',
    'user:logout',
    'theme:change',
    'data:update',
  ]);
  const subscriptionsRef = useRef<Array<() => void>>([]);

  const { eventBus, logger, notification } = services;

  const addMessage = (event: string, data: any, source: string = 'React 19') => {
    const message: EventMessage = {
      id: Date.now().toString(),
      event,
      data,
      timestamp: new Date().toLocaleTimeString(),
      source,
    };
    setMessages((prev) => [message, ...prev].slice(0, 10));
    logger?.info(`EventBus Demo: ${event}`, data);
  };

  useEffect(() => {
    // Clean up old subscriptions first
    subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
    
    // Create new subscriptions
    subscriptionsRef.current = subscribedEvents.map((event) =>
      eventBus.on(event, (data: any) => {
        addMessage(event, data, 'External');
      })
    );

    return () => {
      subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [subscribedEvents, eventBus]);

  const emitEvent = (event: string, data: any) => {
    eventBus.emit(event, data);
    addMessage(event, data, 'React 19 (Self)');
    notification.success(`Event emitted: ${event}`);
  };

  const handleEmitCustom = () => {
    if (!customEvent) {
      notification.error('Please enter an event name');
      return;
    }

    let data: any = customData;
    try {
      if (customData && (customData.startsWith('{') || customData.startsWith('['))) {
        data = JSON.parse(customData);
      }
    } catch {
      data = customData;
    }

    emitEvent(customEvent, data);
    setCustomEvent('');
    setCustomData('');
  };

  const handleSubscribe = (event: string) => {
    if (!subscribedEvents.includes(event)) {
      setSubscribedEvents((prev) => [...prev, event]);
      notification.info(`Subscribed to: ${event}`);
    }
  };

  const handleUnsubscribe = (event: string) => {
    setSubscribedEvents((prev) => prev.filter((e) => e !== event));
    notification.info(`Unsubscribed from: ${event}`);
  };

  const presetEvents = [
    { name: 'user:login', data: { userId: '123', username: 'john_doe' } },
    { name: 'user:logout', data: { userId: '123' } },
    { name: 'theme:change', data: { theme: 'dark' } },
    { name: 'data:update', data: { type: 'product', id: '456', changes: { price: 99.99 } } },
    { name: 'navigation:change', data: { path: '/dashboard' } },
    { name: 'modal:open', data: { modalId: 'confirm-dialog' } },
    { name: 'notification:show', data: { type: 'info', message: 'Hello from EventBus!' } },
    { name: 'settings:update', data: { autoSave: true, language: 'en' } },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Event Bus Demo</h3>
        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">React {React.version}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Emit Events</h4>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {presetEvents.map(({ name, data }) => (
                  <button
                    key={name}
                    onClick={() => emitEvent(name, data)}
                    className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Custom Event</h4>
            <div className="space-y-2">
              <input
                type="text"
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
                placeholder="Event name (e.g., custom:event)"
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background"
              />
              <textarea
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                placeholder="Event data (JSON or plain text)"
                rows={3}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background"
              />
              <button
                onClick={handleEmitCustom}
                className="w-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Emit Custom Event
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Subscriptions</h4>
            <div className="space-y-2">
              {subscribedEvents.map((event) => (
                <div
                  key={event}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-sm font-mono">{event}</span>
                  <button
                    onClick={() => handleUnsubscribe(event)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Unsubscribe
                  </button>
                </div>
              ))}
              {subscribedEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">No active subscriptions</p>
              )}
            </div>

            <div className="mt-2 space-y-2">
              <h5 className="text-xs font-medium text-muted-foreground">Quick Subscribe:</h5>
              <div className="flex flex-wrap gap-1">
                {[
                  'user:login',
                  'user:logout',
                  'theme:change',
                  'data:update',
                  'navigation:change',
                  'modal:open',
                  'notification:show',
                  'settings:update'
                ]
                  .filter((e) => !subscribedEvents.includes(e))
                  .map((event) => (
                    <button
                      key={event}
                      onClick={() => handleSubscribe(event)}
                      className="px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80"
                    >
                      + {event}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Event Log</h4>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="border border-border rounded-lg p-3 bg-card max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No events yet. Emit or receive events to see them here.
                </p>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-2 rounded bg-muted/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-medium">{msg.event}</span>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Source: {msg.source}</div>
                      <pre className="text-xs font-mono bg-background p-1 rounded overflow-x-auto">
                        {typeof msg.data === 'object'
                          ? JSON.stringify(msg.data, null, 2)
                          : msg.data}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 bg-muted/10">
            <div className="text-sm font-medium mb-2">React 19 Event Bus Features:</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✅ Pub/sub pattern for decoupled communication</li>
              <li>✅ Cross-MFE event broadcasting</li>
              <li>✅ Type-safe event handling</li>
              <li>✅ Automatic cleanup on unmount</li>
              <li>✅ Support for any data type</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
