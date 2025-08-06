import { RegistryMFELoader } from '@/components/RegistryMFELoader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio } from 'lucide-react';

export function EventBusServiceDemoPage() {
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

      {/* Interactive Demo */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Interactive Event Bus Demo</h2>
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>React 19 Event Bus Demo</CardTitle>
              <Badge variant="default">Interactive</Badge>
            </div>
            <CardDescription>
              Try emitting and subscribing to events in real-time
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