import { useState, useEffect, useRef } from 'react';
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
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">EMIT EVENTS</h4>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                {presetEvents.map(({ name, data }) => (
                  <button
                    key={name}
                    onClick={() => emitEvent(name, data)}
                    className="px-2 py-1 text-[11px] font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">CUSTOM EVENT</h4>
            <div className="space-y-1.5">
              <input
                type="text"
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
                placeholder="Event name (e.g., custom:event)"
                className="w-full px-2 py-1 text-xs rounded border border-border bg-background"
              />
              <textarea
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                placeholder="Event data (JSON or plain text)"
                rows={2}
                className="w-full px-2 py-1 text-xs rounded border border-border bg-background"
              />
              <button
                onClick={handleEmitCustom}
                className="w-full px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Emit Custom Event
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-muted-foreground">SUBSCRIPTIONS</h4>
              <span className="text-[10px] text-muted-foreground">{subscribedEvents.length} active</span>
            </div>
            
            {/* Active Subscriptions as Pill Badges */}
            <div className="p-2 bg-muted/30 rounded border border-muted-foreground/10 min-h-[60px]">
              {subscribedEvents.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-2">
                  No active subscriptions
                </p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {subscribedEvents.map(event => {
                    const [category] = event.split(':');
                    return (
                      <div
                        key={event}
                        className="group inline-flex items-center gap-1 px-1.5 py-0.5 bg-background border border-border rounded-full hover:border-destructive/50 transition-colors"
                      >
                        <div className={`w-1 h-1 rounded-full ${
                          category === 'user' ? 'bg-blue-500' :
                          category === 'theme' ? 'bg-green-500' :
                          category === 'data' ? 'bg-orange-500' :
                          category === 'navigation' ? 'bg-purple-500' :
                          'bg-gray-500'
                        } animate-pulse`} />
                        <span className="text-[10px] font-mono">{event}</span>
                        <button
                          onClick={() => handleUnsubscribe(event)}
                          className="ml-0.5 text-xs leading-none text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={`Unsubscribe from ${event}`}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-2">
              <p className="text-[10px] text-muted-foreground mb-1">Available events:</p>
              <div className="flex flex-wrap gap-0.5">
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
                  .map((event) => {
                    const [, action] = event.split(':');
                    return (
                      <button
                        key={event}
                        onClick={() => handleSubscribe(event)}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-muted/50 hover:bg-muted rounded-full transition-colors group"
                      >
                        <span className="text-muted-foreground group-hover:text-foreground">+</span>
                        <span className="font-mono">{action}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-semibold text-muted-foreground">EVENT LOG</h4>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="px-1.5 py-0.5 text-[10px] font-medium text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="border border-border rounded p-2 bg-card max-h-64 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No events yet. Emit or receive events to see them here.
                </p>
              ) : (
                <div className="space-y-1">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-1.5 rounded bg-muted/30 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-medium">{msg.event}</span>
                        <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Source: {msg.source}</div>
                      <pre className="text-[10px] font-mono bg-background p-0.5 rounded overflow-x-auto">
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

          <div className="border border-border rounded p-2.5 bg-muted/10">
            <div className="text-xs font-semibold text-muted-foreground mb-1.5">FEATURES</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="text-green-500">●</span>
                <span>Pub/sub pattern</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">●</span>
                <span>Cross-MFE events</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">●</span>
                <span>Type-safe handling</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">●</span>
                <span>Auto cleanup</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">●</span>
                <span>Any data type</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-500">●</span>
                <span>Event history</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
