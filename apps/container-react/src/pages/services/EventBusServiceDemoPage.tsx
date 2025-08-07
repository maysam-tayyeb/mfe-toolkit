import React, { useState, useEffect, useRef } from 'react';
import { RegistryMFELoader } from '@/components/RegistryMFELoader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Send, X } from 'lucide-react';
import { EventLog, type EventMessage } from '@mfe/design-system';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';
import { useToast } from '@/components/ui/use-toast';


export function EventBusServiceDemoPage() {
  const [containerMessages, setContainerMessages] = useState<EventMessage[]>([]);
  const [subscribedEvents, setSubscribedEvents] = useState<string[]>([
    'user:login',
    'user:logout',
    'theme:change',
    'data:update'
  ]);
  const subscriptionsRef = useRef<Array<() => void>>([]);
  const { eventBus, logger } = getMFEServicesSingleton();
  const { toast } = useToast();

  const addContainerMessage = (event: string, data: any, source: string = 'Container') => {
    const message: EventMessage = {
      id: Date.now().toString(),
      event,
      data,
      timestamp: new Date().toLocaleTimeString(),
      source
    };
    setContainerMessages(prev => [message, ...prev].slice(0, 10));
    logger?.info(`Container EventBus: ${event}`, data);
  };

  useEffect(() => {
    // Clean up old subscriptions first
    subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    
    // Create new subscriptions for container
    subscriptionsRef.current = subscribedEvents.map(event =>
      eventBus.on(event, (data: any) => {
        addContainerMessage(event, data, 'MFE');
      })
    );

    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current = [];
    };
  }, [subscribedEvents, eventBus]);

  const emitFromContainer = (event: string, data: any) => {
    eventBus.emit(event, data);
    addContainerMessage(event, data, 'Container (Self)');
    toast({
      title: 'Event Emitted',
      description: `Container emitted: ${event}`,
    });
  };

  const containerPresetEvents = [
    { name: 'container:init', data: { version: '1.0.0', timestamp: Date.now() } },
    { name: 'container:theme', data: { theme: 'system', mode: 'auto' } },
    { name: 'container:navigate', data: { path: '/services/event-bus', from: 'container' } },
    { name: 'user:profile', data: { userId: 'admin', role: 'administrator' } },
    { name: 'config:update', data: { feature: 'eventbus', enabled: true } },
    { name: 'system:health', data: { status: 'healthy', uptime: 3600 } }
  ];
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Event Bus Service Demo</h1>
        <p className="text-sm text-muted-foreground">
          Explore cross-MFE communication using the Event Bus pub/sub pattern
        </p>
      </div>

      {/* Service Description */}
      <div className="ds-card mb-3">
        <div className="p-3">
          <div className="ds-section-title flex items-center gap-2 mb-2">
            <Radio className="h-4 w-4 text-purple-500" />
            About Event Bus Service
          </div>
          <p className="text-sm text-gray-600 mb-2">
            The Event Bus Service enables decoupled communication between MFEs using a publish-subscribe pattern. 
            MFEs can emit events and listen to events without knowing about each other's existence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h4 className="font-semibold mb-1 text-sm">Key Features:</h4>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-500">
                <li>Pub/sub pattern for loose coupling</li>
                <li>Type-safe event handling</li>
                <li>Event namespacing support</li>
                <li>Automatic cleanup on unmount</li>
                <li>Wildcard event listeners</li>
                <li>Event history and debugging</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1 text-sm">API Methods:</h4>
              <ul className="list-disc list-inside space-y-0.5 text-xs font-mono text-gray-500">
                <li>eventBus.emit(event, data)</li>
                <li>eventBus.on(event, handler)</li>
                <li>eventBus.once(event, handler)</li>
                <li>eventBus.off(event, handler)</li>
                <li>eventBus.offAll(event)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Container Event Controls */}
      <div className="ds-card mb-3">
        <div className="p-3">
          <div className="ds-section-title flex items-center gap-2 mb-1">
            <Send className="h-4 w-4 text-blue-500" />
            Container Event Emitter
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Emit events from the container to demonstrate cross-boundary communication
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Container Event Emitters */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground">EMIT EVENTS</h4>
                <div className="grid grid-cols-3 gap-1">
                  {containerPresetEvents.map(({ name, data }) => (
                    <Button
                      key={name}
                      onClick={() => emitFromContainer(name, data)}
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2"
                    >
                      {name.split(':')[1]}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Container Subscriptions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">SUBSCRIPTIONS</h4>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {subscribedEvents.length} active
                  </Badge>
                </div>
                
                {/* Active Subscriptions as Badges */}
                <div className="p-3 bg-muted/30 rounded-lg border border-muted-foreground/10">
                  {subscribedEvents.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      No active subscriptions. Add events to monitor.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {subscribedEvents.map(event => {
                        const [category] = event.split(':');
                        return (
                          <div
                            key={event}
                            className="group inline-flex items-center gap-1 px-2 py-1 bg-background border border-border rounded-full hover:border-destructive/50 transition-colors"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              category === 'user' ? 'bg-blue-500' :
                              category === 'theme' ? 'bg-green-500' :
                              category === 'data' ? 'bg-orange-500' :
                              category === 'navigation' ? 'bg-purple-500' :
                              'bg-gray-500'
                            } animate-pulse`} />
                            <span className="text-xs font-mono">{event}</span>
                            <button
                              onClick={() => setSubscribedEvents(prev => prev.filter(e => e !== event))}
                              className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                              aria-label={`Remove ${event}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Available Events to Subscribe */}
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1.5">Available events:</p>
                  <div className="flex flex-wrap gap-1">
                    {['user:logout', 'navigation:change', 'modal:open', 'modal:close', 'notification:show', 'settings:update', 'error:boundary', 'cache:clear']
                      .filter(e => !subscribedEvents.includes(e))
                      .slice(0, 6)
                      .map(event => {
                        const [, action] = event.split(':');
                        return (
                          <button
                            key={event}
                            onClick={() => setSubscribedEvents(prev => [...prev, event])}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted/50 hover:bg-muted rounded-full transition-colors group"
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

            {/* Container Event Log */}
            <EventLog
              messages={containerMessages}
              onClear={() => setContainerMessages([])}
              emptyMessage="No events yet"
              emptySubMessage="Emit events to see them here"
            />
          </div>
        </div>
      </div>

      {/* Interactive MFE Demos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">MFE Event Bus Demos</h2>
          <Badge variant="secondary" className="text-xs">Multiple MFEs</Badge>
        </div>
        
        {/* Tabbed MFE Interface */}
        <div className="ds-card relative overflow-hidden">
          <div className="py-2 px-3 border-b border-gray-200">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-purple-50 text-purple-600 border border-purple-200 whitespace-nowrap"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                React 19 Demo
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded hover:bg-slate-50 text-gray-500 border border-transparent whitespace-nowrap"
                disabled
              >
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                Vue 3 Demo
                <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1">Coming Soon</Badge>
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded hover:bg-slate-50 text-gray-500 border border-transparent whitespace-nowrap"
                disabled
              >
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                Vanilla JS Demo
                <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1">Coming Soon</Badge>
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded hover:bg-slate-50 text-gray-500 border border-transparent whitespace-nowrap"
                disabled
              >
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                Angular Demo
                <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1">Coming Soon</Badge>
              </button>
            </div>
          </div>
          <div className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-gray-200">
              {/* MFE Container */}
              <div className="lg:col-span-2 p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="ds-card-title">React 19 MFE</h3>
                    <Badge variant="outline" className="text-[10px]">v{React.version}</Badge>
                  </div>
                  <div className="border border-gray-200 rounded bg-slate-50 min-h-[450px]">
                    <RegistryMFELoader
                      id="mfe-react19-eventbus-demo"
                      fallback={
                        <div className="flex items-center justify-center h-[450px] text-gray-500">
                          <p className="text-sm">Loading React 19 Event Bus Demo...</p>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
              
              {/* MFE Info Panel */}
              <div className="p-3 bg-slate-50">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">MFE Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Framework:</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">React 19</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Bundle Size:</span>
                        <span className="font-mono">~45KB</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Load Time:</span>
                        <span className="font-mono">~120ms</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Status:</span>
                        <span className="text-green-600">● Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Capabilities</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-green-500">✓</span>
                        <span>Event emission</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-green-500">✓</span>
                        <span>Event subscription</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-green-500">✓</span>
                        <span>Custom events</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-green-500">✓</span>
                        <span>Event filtering</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-green-500">✓</span>
                        <span>Auto cleanup</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Quick Actions</h4>
                    <div className="space-y-1.5">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full h-7 text-xs"
                        onClick={() => emitFromContainer('mfe:reload', { id: 'mfe-react19-eventbus-demo' })}
                      >
                        Reload MFE
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full h-7 text-xs"
                        onClick={() => emitFromContainer('mfe:reset', { id: 'mfe-react19-eventbus-demo' })}
                      >
                        Reset State
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full h-7 text-xs"
                        onClick={() => {
                          console.log('MFE Debug Info:', {
                            id: 'mfe-react19-eventbus-demo',
                            framework: 'React 19',
                            events: subscribedEvents
                          });
                          toast({
                            title: 'Debug Info',
                            description: 'Check console for details',
                          });
                        }}
                      >
                        Debug Info
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-[10px] text-gray-500">
                      This MFE demonstrates event bus communication patterns. 
                      Try emitting events from the container above and watch them appear in the MFE's event log.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Common Use Cases */}
      <div className="ds-card mb-3">
        <div className="p-3">
          <h2 className="ds-section-title mb-1">Common Use Cases</h2>
          <p className="text-xs text-gray-600 mb-3">
            Typical scenarios where Event Bus communication is useful
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h4 className="ds-card-title mb-2">User Authentication</h4>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
                <code>{`// Login MFE
eventBus.emit('user:login', { 
  userId: '123', 
  username: 'john' 
});

// Any listening MFE
eventBus.on('user:login', (data) => {
  updateUserState(data);
});`}</code>
              </pre>
            </div>
            <div>
              <h4 className="ds-card-title mb-2">Theme Changes</h4>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
                <code>{`// Settings MFE
eventBus.emit('theme:change', { 
  theme: 'dark' 
});

// All MFEs
eventBus.on('theme:change', (data) => {
  applyTheme(data.theme);
});`}</code>
              </pre>
            </div>
            <div>
              <h4 className="ds-card-title mb-2">Data Updates</h4>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
                <code>{`// Product MFE
eventBus.emit('product:updated', { 
  id: '456', 
  changes: { price: 99.99 } 
});

// Cart MFE
eventBus.on('product:updated', (data) => {
  updateCartItem(data.id, data.changes);
});`}</code>
              </pre>
            </div>
            <div>
              <h4 className="ds-card-title mb-2">Navigation Events</h4>
              <pre className="bg-slate-100 p-3 rounded text-xs overflow-x-auto">
                <code>{`// Navigation MFE
eventBus.emit('nav:goto', { 
  path: '/dashboard' 
});

// Router MFE
eventBus.on('nav:goto', (data) => {
  navigate(data.path);
});`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="ds-card">
        <div className="p-3">
          <h2 className="ds-section-title mb-1">Best Practices</h2>
          <p className="text-xs text-gray-600 mb-3">
            Guidelines for effective Event Bus usage
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="ds-card-title mb-2">Event Naming Convention</h4>
              <p className="text-sm text-gray-600 mb-2">
                Use namespaced events to avoid conflicts:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code className="bg-slate-100 px-1 rounded">domain:action</code> - e.g., user:login, cart:add</li>
                <li><code className="bg-slate-100 px-1 rounded">mfe:domain:action</code> - e.g., checkout:payment:complete</li>
              </ul>
            </div>
            <div>
              <h4 className="ds-card-title mb-2">Cleanup</h4>
              <p className="text-sm text-gray-600 mb-2">
                Always cleanup event listeners to prevent memory leaks:
              </p>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`useEffect(() => {
  const unsubscribe = eventBus.on('event', handler);
  return () => unsubscribe(); // Cleanup
}, []);`}</code>
              </pre>
            </div>
            <div>
              <h4 className="ds-card-title mb-2">Type Safety</h4>
              <p className="text-sm text-gray-600 mb-2">
                Define event types for better type safety:
              </p>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                <code>{`type EventMap = {
  'user:login': { userId: string; username: string };
  'theme:change': { theme: 'light' | 'dark' };
};`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}