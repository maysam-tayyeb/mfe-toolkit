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
          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-2">
            <div className="text-[10px] font-semibold text-muted-foreground mb-1.5">MFE EVENT STREAM</div>
            <div className="border border-border rounded bg-card/80 max-h-56 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center mb-1.5">
                    <svg className="w-4 h-4 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-medium">No events yet</p>
                  <p className="text-[9px] text-muted-foreground/60">Emit or receive events</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {messages.map((msg, index) => {
                    const [category, ...actionParts] = msg.event.split(':');
                    const action = actionParts.join(':');
                    const isLatest = index === 0;
                    const getCategoryStyle = () => {
                      switch(category) {
                        case 'user': return 'text-blue-500 bg-blue-500/10';
                        case 'container': return 'text-purple-500 bg-purple-500/10';
                        case 'theme': return 'text-green-500 bg-green-500/10';
                        case 'data': return 'text-orange-500 bg-orange-500/10';
                        case 'navigation': return 'text-indigo-500 bg-indigo-500/10';
                        case 'modal': return 'text-violet-500 bg-violet-500/10';
                        case 'notification': return 'text-yellow-500 bg-yellow-500/10';
                        case 'settings': return 'text-emerald-500 bg-emerald-500/10';
                        case 'config': return 'text-pink-500 bg-pink-500/10';
                        case 'system': return 'text-cyan-500 bg-cyan-500/10';
                        case 'mfe': return 'text-fuchsia-500 bg-fuchsia-500/10';
                        default: return 'text-gray-500 bg-gray-500/10';
                      }
                    };
                    
                    return (
                      <div 
                        key={msg.id} 
                        className={`group transition-all duration-200 hover:bg-muted/20 ${
                          isLatest ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="p-1.5">
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-semibold ${getCategoryStyle()}`}>
                                <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                                {category?.toUpperCase()}
                              </span>
                              {action && (
                                <span className="text-[10px] font-mono text-foreground/80 truncate">
                                  {action}
                                </span>
                              )}
                              {msg.source !== 'React 19' && msg.source !== 'React 19 (Self)' && (
                                <span className="px-1 py-0.5 rounded bg-muted text-[9px] font-medium text-muted-foreground">
                                  {msg.source}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-muted-foreground/60 tabular-nums whitespace-nowrap">
                              {msg.timestamp}
                            </span>
                          </div>
                          {msg.data && (
                            <div className="mt-1 ml-3">
                              {typeof msg.data === 'object' ? (
                                <div className="bg-muted/20 rounded p-1 border border-border/50">
                                  <pre className="text-[9px] font-mono text-muted-foreground overflow-x-auto">
                                    {JSON.stringify(msg.data, null, 2)}
                                  </pre>
                                </div>
                              ) : (
                                <span className="text-[9px] text-muted-foreground">
                                  = {String(msg.data)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {messages.length > 0 && (
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[9px] text-muted-foreground">
                  {messages.length} {messages.length === 1 ? 'event' : 'events'} captured
                </span>
                <button
                  onClick={() => setMessages([])}
                  className="px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                  Clear Log
                </button>
              </div>
            )}
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
