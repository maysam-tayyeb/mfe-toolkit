import React, { useState, useEffect, useRef } from 'react';
import { RegistryMFELoader } from '@/components/RegistryMFELoader';
import { Badge } from '@/components/ui/badge';
import { Radio, Activity, Code, Users, Zap, ChevronRight } from 'lucide-react';
import { EventLog, Hero, TabGroup, EmptyState, MetricCard, type EventMessage } from '@mfe/design-system-react';
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
  const [eventCount, setEventCount] = useState(0);
  const [activeConnections] = useState(1);
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
    setEventCount(prev => prev + 1);
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
    addContainerMessage(event, data, 'Container');
    toast({
      title: 'Event Emitted',
      description: `${event}`,
    });
  };

  const quickEvents = [
    { icon: <Users className="h-4 w-4" />, name: 'user:login', data: { userId: 'admin', role: 'administrator' } },
    { icon: <Activity className="h-4 w-4" />, name: 'system:health', data: { status: 'healthy', uptime: 3600 } },
    { icon: <Zap className="h-4 w-4" />, name: 'theme:change', data: { theme: 'dark', mode: 'auto' } },
    { icon: <Code className="h-4 w-4" />, name: 'config:update', data: { feature: 'eventbus', enabled: true } },
  ];

  const codeExamples = [
    {
      id: 'emit',
      label: 'Emit Event',
      content: (
        <pre className="ds-bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-xs">{`// Emit an event from any MFE
eventBus.emit('user:login', { 
  userId: '123', 
  username: 'john' 
});`}</code>
        </pre>
      )
    },
    {
      id: 'subscribe',
      label: 'Subscribe',
      content: (
        <pre className="ds-bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-xs">{`// Listen to events in any MFE
const unsubscribe = eventBus.on('user:login', (data) => {
  console.log('User logged in:', data);
});

// Cleanup on unmount
useEffect(() => {
  return () => unsubscribe();
}, []);`}</code>
        </pre>
      )
    },
    {
      id: 'once',
      label: 'One-time',
      content: (
        <pre className="ds-bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-xs">{`// Listen to an event only once
eventBus.once('app:ready', () => {
  console.log('App is ready');
});`}</code>
        </pre>
      )
    },
    {
      id: 'wildcard',
      label: 'Wildcard',
      content: (
        <pre className="ds-bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-xs">{`// Listen to all user events
eventBus.on('user:*', (event, data) => {
  console.log(\`User event: \${event}\`, data);
});`}</code>
        </pre>
      )
    }
  ];

  return (
    <div className="ds-page">
      {/* Hero Section */}
      <Hero
        title="Event Bus Service"
        description="Real-time cross-MFE communication with publish-subscribe pattern"
        gradient
      >
        <div className="ds-mt-lg grid grid-cols-3 gap-4">
          <MetricCard
            label="Total Events"
            value={eventCount}
            trend={{ value: 'streaming', direction: 'up' }}
            icon={<Radio className="h-4 w-4" />}
          />
          <MetricCard
            label="Active Subscriptions"
            value={subscribedEvents.length}
            trend={{ value: 'listening', direction: 'neutral' }}
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricCard
            label="Connected MFEs"
            value={activeConnections}
            trend={{ value: 'online', direction: 'up' }}
            icon={<Zap className="h-4 w-4" />}
          />
        </div>
      </Hero>

      {/* Interactive Playground */}
      <div className="ds-card-padded">
        <h2 className="ds-section-title ds-mb-md">Interactive Playground</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div>
            <h3 className="ds-card-title ds-mb-sm">Quick Events</h3>
            <div className="grid grid-cols-2 gap-3 ds-mb-md">
              {quickEvents.map(({ icon, name, data }) => (
                <button
                  key={name}
                  onClick={() => emitFromContainer(name, data)}
                  className="ds-card-compact ds-hover-lift flex items-center gap-3 group"
                >
                  <div className="ds-icon-primary">{icon}</div>
                  <div className="text-left">
                    <div className="text-sm font-medium group-hover:ds-accent-primary">
                      {name.split(':')[1]}
                    </div>
                    <div className="text-xs ds-text-muted">{name.split(':')[0]} event</div>
                  </div>
                  <ChevronRight className="h-4 w-4 ds-text-muted ml-auto" />
                </button>
              ))}
            </div>

            <h3 className="ds-card-title ds-mb-sm">Active Subscriptions</h3>
            <div className="ds-card-compact ds-bg-accent-primary-soft">
              {subscribedEvents.length === 0 ? (
                <EmptyState
                  title="No subscriptions"
                  description="Add events to start listening"
                  className="py-4"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subscribedEvents.map(event => (
                    <div
                      key={event}
                      className="ds-event-badge ds-event-badge-active"
                    >
                      <div className="ds-status-dot ds-status-online" />
                      <span className="font-mono text-xs">{event}</span>
                      <button
                        onClick={() => setSubscribedEvents(prev => prev.filter(e => e !== event))}
                        className="ml-1 ds-text-muted hover:ds-accent-danger"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Event Log */}
          <div>
            <EventLog
              messages={containerMessages}
              onClear={() => {
                setContainerMessages([]);
                setEventCount(0);
              }}
              emptyMessage="No events captured yet"
              emptySubMessage="Emit events to see them here"
            />
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="ds-card-padded">
        <h2 className="ds-section-title ds-mb-md">Implementation Guide</h2>
        <TabGroup tabs={codeExamples} defaultTab="emit" />
      </div>

      {/* MFE Demonstrations */}
      <div className="ds-card-padded">
        <div className="flex items-center justify-between ds-mb-md">
          <h2 className="ds-section-title">Live MFE Demo</h2>
          <Badge variant="secondary">React {React.version}</Badge>
        </div>
        
        <div className="ds-card p-0 overflow-hidden">
          <RegistryMFELoader
            id="mfe-react19-eventbus-demo"
            fallback={
              <div className="ds-loading-state min-h-[400px]">
                <div className="ds-spinner-lg"></div>
                <p className="ds-loading-text">Loading Event Bus Demo...</p>
                <p className="ds-loading-subtext">Establishing connection</p>
              </div>
            }
          />
        </div>
      </div>

      {/* Best Practices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="ds-card-padded">
          <h3 className="ds-section-title ds-mb-sm">
            <span className="ds-icon-success">✓</span> Best Practices
          </h3>
          <ul className="ds-list-check">
            <li className="ds-list-check-item">
              <span className="ds-icon-success">•</span>
              <span className="text-sm">Use namespaced events (domain:action)</span>
            </li>
            <li className="ds-list-check-item">
              <span className="ds-icon-success">•</span>
              <span className="text-sm">Always cleanup subscriptions on unmount</span>
            </li>
            <li className="ds-list-check-item">
              <span className="ds-icon-success">•</span>
              <span className="text-sm">Define TypeScript interfaces for events</span>
            </li>
            <li className="ds-list-check-item">
              <span className="ds-icon-success">•</span>
              <span className="text-sm">Keep event payloads lightweight</span>
            </li>
            <li className="ds-list-check-item">
              <span className="ds-icon-success">•</span>
              <span className="text-sm">Use wildcard listeners sparingly</span>
            </li>
          </ul>
        </div>

        <div className="ds-card-padded">
          <h3 className="ds-section-title ds-mb-sm">
            <span className="ds-icon-warning">⚠</span> Common Pitfalls
          </h3>
          <ul className="ds-list">
            <li className="ds-list-item">
              <span className="ds-icon-danger">•</span>
              <span className="text-sm">Forgetting to unsubscribe (memory leaks)</span>
            </li>
            <li className="ds-list-item">
              <span className="ds-icon-danger">•</span>
              <span className="text-sm">Using generic event names</span>
            </li>
            <li className="ds-list-item">
              <span className="ds-icon-danger">•</span>
              <span className="text-sm">Circular event dependencies</span>
            </li>
            <li className="ds-list-item">
              <span className="ds-icon-danger">•</span>
              <span className="text-sm">Large data in event payloads</span>
            </li>
            <li className="ds-list-item">
              <span className="ds-icon-danger">•</span>
              <span className="text-sm">Not handling event errors</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}