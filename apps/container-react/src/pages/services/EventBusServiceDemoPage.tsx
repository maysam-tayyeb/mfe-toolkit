import React, { useState, useEffect, useRef } from 'react';
import { RegistryMFELoader } from '@/components/RegistryMFELoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Send, Trash2, X } from 'lucide-react';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';
import { useToast } from '@/components/ui/use-toast';

type EventMessage = {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  source: string;
};

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
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Radio className="h-4 w-4" />
            About Event Bus Service
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="text-muted-foreground">
            The Event Bus Service enables decoupled communication between MFEs using a publish-subscribe pattern. 
            MFEs can emit events and listen to events without knowing about each other's existence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <h4 className="font-semibold mb-1.5 text-sm">Key Features:</h4>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-muted-foreground">
                <li>Pub/sub pattern for loose coupling</li>
                <li>Type-safe event handling</li>
                <li>Event namespacing support</li>
                <li>Automatic cleanup on unmount</li>
                <li>Wildcard event listeners</li>
                <li>Event history and debugging</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1.5 text-sm">API Methods:</h4>
              <ul className="list-disc list-inside space-y-0.5 text-xs font-mono text-muted-foreground">
                <li>eventBus.emit(event, data)</li>
                <li>eventBus.on(event, handler)</li>
                <li>eventBus.once(event, handler)</li>
                <li>eventBus.off(event, handler)</li>
                <li>eventBus.offAll(event)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Container Event Controls */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4" />
            Container Event Emitter
          </CardTitle>
          <CardDescription className="text-xs">
            Emit events from the container to demonstrate cross-boundary communication
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        const [category, action] = event.split(':');
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
                        const [category, action] = event.split(':');
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-muted-foreground">EVENT LOG</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {containerMessages.length} events
                  </Badge>
                  {containerMessages.length > 0 && (
                    <Button
                      onClick={() => setContainerMessages([])}
                      size="sm"
                      variant="ghost"
                      className="h-5 px-1.5 text-xs hover:bg-destructive/10"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
              <div className="border border-border rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  {containerMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Radio className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-xs">No events captured yet</p>
                      <p className="text-[10px] mt-1">Emit events to see them here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {containerMessages.map((msg, index) => {
                        const [category, action] = msg.event.split(':');
                        const categoryColor = 
                          category === 'user' ? 'text-blue-500' :
                          category === 'container' ? 'text-purple-500' :
                          category === 'theme' ? 'text-green-500' :
                          category === 'data' ? 'text-orange-500' :
                          category === 'navigation' ? 'text-indigo-500' :
                          category === 'config' ? 'text-pink-500' :
                          category === 'system' ? 'text-cyan-500' :
                          'text-gray-500';
                        
                        return (
                          <div key={msg.id} className="group hover:bg-muted/30 transition-colors">
                            <div className="p-2">
                              {/* Event Header */}
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-semibold ${categoryColor}`}>
                                    {category?.toUpperCase()}
                                  </span>
                                  <span className="text-xs font-mono">{action || msg.event}</span>
                                  {msg.source !== 'Container' && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                      {msg.source}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground tabular-nums">
                                  {msg.timestamp}
                                </span>
                              </div>
                              
                              {/* Event Data */}
                              {msg.data && (
                                <div className="mt-1 bg-muted/20 rounded p-1.5">
                                  <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto">
                                    {typeof msg.data === 'object' 
                                      ? JSON.stringify(msg.data, null, 2)
                                      : String(msg.data)
                                    }
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive MFE Demos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">MFE Event Bus Demos</h2>
          <Badge variant="secondary" className="text-xs">Multiple MFEs</Badge>
        </div>
        
        {/* Tabbed MFE Interface */}
        <Card className="relative overflow-hidden">
          <CardHeader className="py-2 border-b">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                React 19 Demo
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md hover:bg-muted text-muted-foreground border border-transparent whitespace-nowrap"
                disabled
              >
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                Vue 3 Demo
                <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1">Coming Soon</Badge>
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md hover:bg-muted text-muted-foreground border border-transparent whitespace-nowrap"
                disabled
              >
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                Vanilla JS Demo
                <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1">Coming Soon</Badge>
              </button>
              <button
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md hover:bg-muted text-muted-foreground border border-transparent whitespace-nowrap"
                disabled
              >
                <span className="w-2 h-2 bg-gray-400 rounded-full" />
                Angular Demo
                <Badge variant="outline" className="text-[10px] px-1 py-0 ml-1">Coming Soon</Badge>
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-border">
              {/* MFE Container */}
              <div className="lg:col-span-2 p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">React 19 MFE</h3>
                    <Badge variant="outline" className="text-[10px]">v{React.version}</Badge>
                  </div>
                  <div className="border rounded-lg bg-muted/10 min-h-[450px]">
                    <RegistryMFELoader
                      id="mfe-react19-eventbus-demo"
                      fallback={
                        <div className="flex items-center justify-center h-[450px] text-muted-foreground">
                          <p className="text-sm">Loading React 19 Event Bus Demo...</p>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
              
              {/* MFE Info Panel */}
              <div className="p-4 bg-muted/5">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">MFE DETAILS</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Framework:</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">React 19</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Bundle Size:</span>
                        <span className="font-mono">~45KB</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Load Time:</span>
                        <span className="font-mono">~120ms</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-green-600">● Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">CAPABILITIES</h4>
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
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">QUICK ACTIONS</h4>
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
                  
                  <div className="pt-2 border-t">
                    <p className="text-[10px] text-muted-foreground">
                      This MFE demonstrates event bus communication patterns. 
                      Try emitting events from the container above and watch them appear in the MFE's event log.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Use Cases */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Common Use Cases</CardTitle>
          <CardDescription className="text-xs">
            Typical scenarios where Event Bus communication is useful
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">User Authentication</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
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
              <h4 className="font-semibold mb-2">Theme Changes</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
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
              <h4 className="font-semibold mb-2">Data Updates</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
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
              <h4 className="font-semibold mb-2">Navigation Events</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
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
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Best Practices</CardTitle>
          <CardDescription className="text-xs">
            Guidelines for effective Event Bus usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Event Naming Convention</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use namespaced events to avoid conflicts:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code className="bg-muted px-1">domain:action</code> - e.g., user:login, cart:add</li>
                <li><code className="bg-muted px-1">mfe:domain:action</code> - e.g., checkout:payment:complete</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cleanup</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Always cleanup event listeners to prevent memory leaks:
              </p>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                <code>{`useEffect(() => {
  const unsubscribe = eventBus.on('event', handler);
  return () => unsubscribe(); // Cleanup
}, []);`}</code>
              </pre>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Type Safety</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Define event types for better type safety:
              </p>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                <code>{`type EventMap = {
  'user:login': { userId: string; username: string };
  'theme:change': { theme: 'light' | 'dark' };
};`}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}