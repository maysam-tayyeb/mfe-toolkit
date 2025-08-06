import { useState, useEffect, useRef } from 'react';
import { RegistryMFELoader } from '@/components/RegistryMFELoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Radio, Send, Trash2 } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Event Bus Service Demo</h1>
        <p className="text-muted-foreground">
          Explore cross-MFE communication using the Event Bus pub/sub pattern
        </p>
      </div>

      {/* Service Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            About Event Bus Service
          </CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            The Event Bus Service enables decoupled communication between MFEs using a publish-subscribe pattern. 
            MFEs can emit events and listen to events without knowing about each other's existence.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-semibold mb-2">Key Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Pub/sub pattern for loose coupling</li>
                <li>Type-safe event handling</li>
                <li>Event namespacing support</li>
                <li>Automatic cleanup on unmount</li>
                <li>Wildcard event listeners</li>
                <li>Event history and debugging</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">API Methods:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm font-mono">
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Container Event Emitter
          </CardTitle>
          <CardDescription>
            Emit events from the container to demonstrate cross-boundary communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Container Event Emitters */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Emit Container Events</h4>
                <div className="grid grid-cols-2 gap-2">
                  {containerPresetEvents.map(({ name, data }) => (
                    <Button
                      key={name}
                      onClick={() => emitFromContainer(name, data)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Container Subscriptions */}
              <div>
                <h4 className="text-sm font-medium mb-2">Container Subscriptions</h4>
                <div className="space-y-2">
                  {subscribedEvents.map(event => (
                    <div key={event} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm font-mono">{event}</span>
                      <button
                        onClick={() => setSubscribedEvents(prev => prev.filter(e => e !== event))}
                        className="text-xs text-destructive hover:underline"
                      >
                        Unsubscribe
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Quick Subscribe:</h5>
                  <div className="flex flex-wrap gap-1">
                    {['navigation:change', 'modal:open', 'notification:show', 'settings:update']
                      .filter(e => !subscribedEvents.includes(e))
                      .map(event => (
                        <button
                          key={event}
                          onClick={() => setSubscribedEvents(prev => [...prev, event])}
                          className="px-2 py-1 text-xs rounded bg-muted hover:bg-muted/80"
                        >
                          + {event}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Container Event Log */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Container Event Log</h4>
                {containerMessages.length > 0 && (
                  <Button
                    onClick={() => setContainerMessages([])}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <div className="border border-border rounded-lg p-3 bg-card max-h-64 overflow-y-auto">
                {containerMessages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No container events yet. Events will appear here when emitted.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {containerMessages.map(msg => (
                      <div key={msg.id} className="p-2 rounded bg-muted/30 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-medium">{msg.event}</span>
                          <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Source: {msg.source}
                        </div>
                        <pre className="text-xs font-mono bg-background p-1 rounded overflow-x-auto">
                          {typeof msg.data === 'object' ? JSON.stringify(msg.data, null, 2) : msg.data}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">MFE Event Bus Demo</h2>
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>React 19 MFE Event Demo</CardTitle>
              <Badge variant="default">Interactive</Badge>
            </div>
            <CardDescription>
              MFE perspective: Subscribe and emit events that interact with the container above
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg bg-muted/10 min-h-[500px]">
              <RegistryMFELoader
                id="mfe-react19-eventbus-demo"
                fallback={
                  <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                    <p>Loading Event Bus Demo...</p>
                  </div>
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Common Use Cases</CardTitle>
          <CardDescription>
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
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
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