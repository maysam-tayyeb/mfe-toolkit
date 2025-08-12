import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useUI } from '@/contexts/UIContext';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';
import { RegistryMFELoader } from '@/components/RegistryMFELoader';
import { EventLog, EmptyState, TabGroup, LoadingState } from '@mfe/design-system-react';
import { 
  MessageSquare, Send, Trash2, Search, Download, 
  Filter, Play, Pause, Settings, Zap, Activity,
  BarChart3, Code, BookOpen, Layers, Terminal,
  ChevronRight, AlertCircle, CheckCircle, Clock,
  Users, Cpu, Radio, Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type ReceivedEvent = {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  source: string;
  latency?: number;
};

type EventMetrics = {
  eventsPerMin: number;
  avgLatency: number;
  listeners: number;
  errors: number;
};

type MFELayout = 'two' | 'three';

const STORAGE_KEY = 'eventbus-logs';
const FILTERS_KEY = 'eventbus-filters';
const FAVORITES_KEY = 'eventbus-favorites';
const SETTINGS_KEY = 'eventbus-settings';

const eventPresets = [
  { icon: '👤', type: 'user:login', data: { userId: '123', name: 'John' }, color: 'ds-btn-success' },
  { icon: '🛒', type: 'cart:add', data: { item: 'Widget', qty: 1 }, color: 'ds-btn-info' },
  { icon: '📧', type: 'message', data: { text: 'Hello World!' }, color: 'ds-btn-primary' },
  { icon: '⚠️', type: 'error', data: { code: 500, message: 'Server error' }, color: 'ds-btn-danger' },
  { icon: '🔄', type: 'state:sync', data: { component: 'header', state: {} }, color: 'ds-btn-secondary' },
  { icon: '📍', type: 'navigation', data: { path: '/dashboard' }, color: 'ds-btn-outline' },
];

const StorageManager = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-50)));
      }
    }
  },
  
  load: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  clear: (key: string) => {
    localStorage.removeItem(key);
  },
  
  getSize: () => {
    let total = 0;
    for (const key in localStorage) {
      if (key.startsWith('eventbus-')) {
        total += localStorage[key].length;
      }
    }
    return total;
  }
};

export const EventBusPage: React.FC = () => {
  const { addNotification } = useUI();
  const services = getMFEServicesSingleton();
  
  // State
  const [events, setEvents] = useState<ReceivedEvent[]>(() => StorageManager.load(STORAGE_KEY, []));
  const [filters, setFilters] = useState(() => StorageManager.load(FILTERS_KEY, {}));
  const [favorites, setFavorites] = useState(() => StorageManager.load(FAVORITES_KEY, []));
  const [settings, setSettings] = useState(() => StorageManager.load(SETTINGS_KEY, { layout: 'two' }));
  
  const [layout, setLayout] = useState<MFELayout>(settings.layout || 'two');
  const [showDevTools, setShowDevTools] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedSequence, setRecordedSequence] = useState<ReceivedEvent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [metrics, setMetrics] = useState<EventMetrics>({
    eventsPerMin: 0,
    avgLatency: 0,
    listeners: 12,
    errors: 0
  });
  
  const [customType, setCustomType] = useState('custom:event');
  const [customData, setCustomData] = useState('{"key": "value"}');
  
  const eventLogRef = useRef<HTMLDivElement>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout>();

  // Compute filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (search && !JSON.stringify(event).toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (filters.type && !event.type.includes(filters.type)) {
        return false;
      }
      if (filters.source && event.source !== filters.source) {
        return false;
      }
      return true;
    });
  }, [events, search, filters]);

  // Event handler
  const handleEvent = useCallback((payload: any) => {
    const newEvent: ReceivedEvent = {
      id: `${Date.now()}-${Math.random()}`,
      type: payload.type || 'unknown',
      data: payload.data,
      timestamp: new Date().toISOString(),
      source: payload.source || 'unknown',
      latency: Math.random() * 10
    };
    
    setEvents(prev => {
      const updated = [...prev, newEvent].slice(-100);
      StorageManager.save(STORAGE_KEY, updated);
      return updated;
    });
    
    if (recording) {
      setRecordedSequence(prev => [...prev, newEvent]);
    }
  }, [recording]);

  // Subscribe to events
  useEffect(() => {
    const unsubscribe = services.eventBus.on('*', handleEvent);
    return unsubscribe;
  }, [services.eventBus, handleEvent]);

  // Calculate metrics
  useEffect(() => {
    const calculateMetrics = () => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const recentEvents = events.filter(e => 
        new Date(e.timestamp).getTime() > oneMinuteAgo
      );
      
      const avgLatency = recentEvents.length > 0
        ? recentEvents.reduce((sum, e) => sum + (e.latency || 0), 0) / recentEvents.length
        : 0;
      
      const errors = recentEvents.filter(e => 
        e.type.includes('error') || e.data?.error
      ).length;
      
      setMetrics({
        eventsPerMin: recentEvents.length,
        avgLatency: Math.round(avgLatency * 100) / 100,
        listeners: 12 + Math.floor(Math.random() * 5),
        errors
      });
    };
    
    calculateMetrics();
    metricsIntervalRef.current = setInterval(calculateMetrics, 5000);
    
    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [events]);

  // Save settings when layout changes
  useEffect(() => {
    StorageManager.save(SETTINGS_KEY, { ...settings, layout });
  }, [layout, settings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'k':
            e.preventDefault();
            document.querySelector<HTMLInputElement>('.event-search')?.focus();
            break;
          case 'e':
            e.preventDefault();
            document.querySelector<HTMLButtonElement>('.quick-emit')?.click();
            break;
          case 'l':
            e.preventDefault();
            if (window.confirm('Clear all event logs?')) {
              clearLogs();
            }
            break;
          case 'r':
            e.preventDefault();
            replaySequence();
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const sendEvent = (type: string, data: any) => {
    services.eventBus.emit(type, data);
    addNotification({
      type: 'success',
      title: 'Event Sent',
      message: `Event "${type}" emitted`
    });
  };

  const handleCustomSend = () => {
    try {
      const data = JSON.parse(customData);
      sendEvent(customType, data);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Invalid JSON',
        message: 'Please enter valid JSON data'
      });
    }
  };

  const clearLogs = () => {
    setEvents([]);
    StorageManager.clear(STORAGE_KEY);
    addNotification({
      type: 'info',
      title: 'Logs Cleared',
      message: 'Event logs have been cleared'
    });
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `event-logs-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    addNotification({
      type: 'success',
      title: 'Logs Exported',
      message: `Exported ${events.length} events`
    });
  };

  const replaySequence = () => {
    if (recordedSequence.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Sequence',
        message: 'Record a sequence first'
      });
      return;
    }
    
    recordedSequence.forEach((event, index) => {
      setTimeout(() => {
        services.eventBus.emit(event.type, event.data);
      }, index * 500);
    });
    
    addNotification({
      type: 'info',
      title: 'Replaying',
      message: `Replaying ${recordedSequence.length} events`
    });
  };

  const tabs = [
    { label: 'Live Demo', icon: <Radio className="ds-w-4 ds-h-4" /> },
    { label: 'Playground', icon: <Zap className="ds-w-4 ds-h-4" /> },
    { label: 'API Docs', icon: <BookOpen className="ds-w-4 ds-h-4" /> },
    { label: 'Patterns', icon: <Layers className="ds-w-4 ds-h-4" /> },
  ];

  return (
    <div className="ds-page">
      {/* Hero Section */}
      <div className="ds-hero-gradient ds-mb-6">
        <h1 className="ds-page-title">Event Bus Service</h1>
        <p className="ds-text-muted">Real-time cross-MFE communication with typed events</p>
      </div>

      {/* Performance Metrics */}
      <div className="ds-card-padded ds-mb-6">
        <div className="ds-grid ds-grid-cols-2 ds-md:grid-cols-4 ds-gap-4 ds-text-center">
          <div className="ds-metric-card">
            <Activity className="ds-w-5 ds-h-5 ds-mx-auto ds-mb-2 ds-text-accent-primary" />
            <div className="ds-text-2xl ds-font-bold">{metrics.eventsPerMin}</div>
            <div className="ds-text-xs ds-text-muted">Events/min</div>
          </div>
          <div className="ds-metric-card">
            <Clock className="ds-w-5 ds-h-5 ds-mx-auto ds-mb-2 ds-text-accent-success" />
            <div className="ds-text-2xl ds-font-bold">{metrics.avgLatency}ms</div>
            <div className="ds-text-xs ds-text-muted">Avg latency</div>
          </div>
          <div className="ds-metric-card">
            <Users className="ds-w-5 ds-h-5 ds-mx-auto ds-mb-2 ds-text-accent-info" />
            <div className="ds-text-2xl ds-font-bold">{metrics.listeners}</div>
            <div className="ds-text-xs ds-text-muted">Active listeners</div>
          </div>
          <div className="ds-metric-card">
            <AlertCircle className="ds-w-5 ds-h-5 ds-mx-auto ds-mb-2 ds-text-accent-danger" />
            <div className="ds-text-2xl ds-font-bold">{metrics.errors}</div>
            <div className="ds-text-xs ds-text-muted">Errors</div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <TabGroup
        tabs={tabs}
        selectedIndex={selectedTab}
        onChange={setSelectedTab}
      />

      {selectedTab === 0 && (
        <>
          {/* Live MFE Communication */}
          <div className="ds-card-padded ds-mb-6 ds-mt-6">
            <div className="ds-flex ds-justify-between ds-items-center ds-mb-4">
              <h2 className="ds-section-title">Live Communication Demo</h2>
              <div className="ds-flex ds-gap-2">
                <button
                  className={`ds-btn-sm ${layout === 'two' ? 'ds-btn-primary' : 'ds-btn-outline'}`}
                  onClick={() => setLayout('two')}
                >
                  <Layers className="ds-w-4 ds-h-4 ds-mr-1" />
                  2 MFEs
                </button>
                <button
                  className={`ds-btn-sm ${layout === 'three' ? 'ds-btn-primary' : 'ds-btn-outline'}`}
                  onClick={() => setLayout('three')}
                >
                  <Cpu className="ds-w-4 ds-h-4 ds-mr-1" />
                  3 MFEs
                </button>
              </div>
            </div>

            {/* MFE Layout */}
            {layout === 'two' ? (
              <div className="ds-grid ds-md:grid-cols-2 ds-gap-6">
                <div className="ds-relative">
                  <div className="ds-absolute -ds-top-2 -ds-left-2 ds-badge-success ds-z-10">Publisher</div>
                  <RegistryMFELoader id="mfe-event-publisher" />
                </div>
                <div className="ds-relative">
                  <div className="ds-absolute -ds-top-2 -ds-left-2 ds-badge-info ds-z-10">Subscriber</div>
                  <RegistryMFELoader id="mfe-event-subscriber" />
                </div>
              </div>
            ) : (
              <div className="ds-space-y-6">
                <div className="ds-flex ds-justify-center">
                  <div className="ds-w-full ds-md:w-1/2">
                    <div className="ds-relative">
                      <div className="ds-absolute -ds-top-2 -ds-left-2 ds-badge-primary ds-z-10">Orchestrator</div>
                      <RegistryMFELoader id="mfe-event-orchestrator" />
                    </div>
                  </div>
                </div>
                <div className="ds-grid ds-md:grid-cols-2 ds-gap-6">
                  <div className="ds-relative">
                    <div className="ds-absolute -ds-top-2 -ds-left-2 ds-badge-success ds-z-10">Worker A</div>
                    <RegistryMFELoader id="mfe-event-publisher" />
                  </div>
                  <div className="ds-relative">
                    <div className="ds-absolute -ds-top-2 -ds-left-2 ds-badge-info ds-z-10">Worker B</div>
                    <RegistryMFELoader id="mfe-event-subscriber" />
                  </div>
                </div>
              </div>
            )}

            {/* Visual Connection Indicator */}
            <div className="ds-flex ds-justify-center ds-mt-4">
              <div className="ds-badge-info ds-animate-pulse">
                <Wifi className="ds-w-4 ds-h-4 ds-inline ds-mr-1" />
                Events flowing in real-time
              </div>
            </div>
          </div>

          {/* Enhanced Event Monitor */}
          <div className="ds-card-padded">
            <div className="ds-flex ds-justify-between ds-items-center ds-mb-4">
              <h3 className="ds-section-title">Event Monitor</h3>
              <div className="ds-flex ds-gap-2">
                <input
                  className="ds-input ds-input-sm ds-w-48 event-search"
                  placeholder="Search events... (Ctrl+K)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select 
                  className="ds-select ds-select-sm"
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="chat">Chat Events</option>
                  <option value="system">System Events</option>
                  <option value="user">User Events</option>
                  <option value="state">State Events</option>
                </select>
                <Button size="sm" variant="outline" onClick={exportLogs}>
                  <Download className="ds-w-4 ds-h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={clearLogs}>
                  <Trash2 className="ds-w-4 ds-h-4" />
                </Button>
              </div>
            </div>

            <div ref={eventLogRef} className="ds-border ds-rounded ds-p-3 ds-max-h-96 ds-overflow-y-auto">
              {filteredEvents.length === 0 ? (
                <EmptyState
                  title="No Events"
                  description="Events will appear here as they flow through the system"
                  icon={<MessageSquare className="ds-h-8 ds-w-8" />}
                />
              ) : (
                <EventLog
                  events={filteredEvents.map(e => ({
                    ...e,
                    timestamp: new Date(e.timestamp).toLocaleTimeString()
                  }))}
                  maxHeight="none"
                />
              )}
            </div>

            <div className="ds-flex ds-justify-between ds-mt-2 ds-text-xs ds-text-muted">
              <span>{filteredEvents.length} events shown</span>
              <span>Storage: {(StorageManager.getSize() / 1024).toFixed(1)}KB</span>
            </div>
          </div>
        </>
      )}

      {selectedTab === 1 && (
        <div className="ds-card-padded ds-mt-6">
          <h3 className="ds-section-title ds-mb-4">Event Playground</h3>
          
          {/* Quick Action Presets */}
          <div className="ds-mb-4">
            <p className="ds-text-sm ds-text-muted ds-mb-2">Quick Actions:</p>
            <div className="ds-grid ds-grid-cols-3 ds-md:grid-cols-6 ds-gap-2">
              {eventPresets.map(preset => (
                <button
                  key={preset.type}
                  className={`${preset.color} ds-btn-sm quick-emit`}
                  onClick={() => sendEvent(preset.type, preset.data)}
                >
                  {preset.icon} {preset.type.split(':')[1] || preset.type}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Event Builder */}
          <div className="ds-grid ds-md:grid-cols-2 ds-gap-4">
            <div>
              <label className="ds-label">Event Type</label>
              <input
                className="ds-input"
                placeholder="e.g., user:action"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
              />
            </div>
            <div>
              <label className="ds-label">Payload (JSON)</label>
              <textarea
                className="ds-textarea"
                rows={3}
                placeholder='{"key": "value"}'
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
              />
            </div>
          </div>
          
          <div className="ds-flex ds-gap-2 ds-mt-4">
            <Button onClick={handleCustomSend}>
              <Send className="ds-w-4 ds-h-4 ds-mr-2" />
              Send Event
            </Button>
            <Button variant="outline" onClick={() => setShowDevTools(!showDevTools)}>
              <Settings className="ds-w-4 ds-h-4 ds-mr-2" />
              {showDevTools ? 'Hide' : 'Show'} Dev Tools
            </Button>
          </div>
        </div>
      )}

      {selectedTab === 2 && (
        <div className="ds-card-padded ds-mt-6">
          <h3 className="ds-section-title ds-mb-4">API Documentation</h3>
          
          <div className="ds-space-y-6">
            <div className="ds-card-compact">
              <h4 className="ds-font-semibold ds-mb-2">Core Methods</h4>
              <div className="ds-space-y-3">
                <div>
                  <code className="ds-bg-slate-100 ds-px-2 ds-py-1 ds-rounded ds-text-sm">
                    emit(type: string, data: any): void
                  </code>
                  <p className="ds-text-sm ds-text-muted ds-mt-1">
                    Emit an event to all subscribers
                  </p>
                </div>
                <div>
                  <code className="ds-bg-slate-100 ds-px-2 ds-py-1 ds-rounded ds-text-sm">
                    on(type: string, handler: Function): () =&gt; void
                  </code>
                  <p className="ds-text-sm ds-text-muted ds-mt-1">
                    Subscribe to events, returns unsubscribe function
                  </p>
                </div>
                <div>
                  <code className="ds-bg-slate-100 ds-px-2 ds-py-1 ds-rounded ds-text-sm">
                    once(type: string, handler: Function): void
                  </code>
                  <p className="ds-text-sm ds-text-muted ds-mt-1">
                    Subscribe to an event once
                  </p>
                </div>
              </div>
            </div>

            <div className="ds-card-compact">
              <h4 className="ds-font-semibold ds-mb-2">Typed Events</h4>
              <pre className="ds-bg-slate-50 ds-p-3 ds-rounded ds-text-sm ds-overflow-x-auto">
{`// Define your event map
type AppEventMap = {
  'user:login': { userId: string; name: string };
  'cart:add': { item: string; qty: number };
};

// Use typed event bus
const eventBus = createTypedEventBus<AppEventMap>();

// Type-safe emit
eventBus.emit('user:login', { userId: '123', name: 'John' });

// Type-safe subscribe
eventBus.on('cart:add', (event) => {
  console.log(event.data.item); // Typed!
});`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 3 && (
        <div className="ds-card-padded ds-mt-6">
          <h3 className="ds-section-title ds-mb-4">Communication Patterns</h3>
          
          <div className="ds-grid ds-md:grid-cols-2 ds-gap-4">
            <div className="ds-card-compact">
              <h4 className="ds-font-semibold ds-mb-2">Pub/Sub Pattern</h4>
              <p className="ds-text-sm ds-text-muted ds-mb-2">
                One-to-many communication
              </p>
              <pre className="ds-bg-slate-50 ds-p-2 ds-rounded ds-text-xs">
{`// Publisher
eventBus.emit('news:update', { 
  title: 'Breaking News' 
});

// Multiple subscribers
eventBus.on('news:update', handler1);
eventBus.on('news:update', handler2);`}
              </pre>
            </div>

            <div className="ds-card-compact">
              <h4 className="ds-font-semibold ds-mb-2">Request-Reply</h4>
              <p className="ds-text-sm ds-text-muted ds-mb-2">
                Bidirectional communication
              </p>
              <pre className="ds-bg-slate-50 ds-p-2 ds-rounded ds-text-xs">
{`// Request
eventBus.emit('data:request', { 
  id: '123', replyTo: 'data:response' 
});

// Reply
eventBus.on('data:request', (e) => {
  eventBus.emit(e.data.replyTo, result);
});`}
              </pre>
            </div>

            <div className="ds-card-compact">
              <h4 className="ds-font-semibold ds-mb-2">Event Sourcing</h4>
              <p className="ds-text-sm ds-text-muted ds-mb-2">
                State from event history
              </p>
              <pre className="ds-bg-slate-50 ds-p-2 ds-rounded ds-text-xs">
{`// Store all events
const events = [];
eventBus.on('*', (e) => {
  events.push(e);
  rebuildState(events);
});`}
              </pre>
            </div>

            <div className="ds-card-compact">
              <h4 className="ds-font-semibold ds-mb-2">Wildcards</h4>
              <p className="ds-text-sm ds-text-muted ds-mb-2">
                Pattern-based subscriptions
              </p>
              <pre className="ds-bg-slate-50 ds-p-2 ds-rounded ds-text-xs">
{`// Subscribe to all user events
eventBus.on('user:*', handler);

// Subscribe to all events
eventBus.on('*', globalHandler);`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Developer Tools Panel */}
      {showDevTools && (
        <div className="ds-card-compact ds-mt-6">
          <details open className="ds-space-y-3">
            <summary className="ds-font-semibold ds-cursor-pointer">
              <Terminal className="ds-w-4 ds-h-4 ds-inline ds-mr-2" />
              Developer Tools
            </summary>
            
            <div className="ds-grid ds-md:grid-cols-3 ds-gap-4 ds-mt-4">
              <div className="ds-space-y-2">
                <h4 className="ds-font-medium">Event Replay</h4>
                <div className="ds-flex ds-gap-2">
                  <Button
                    size="sm"
                    variant={recording ? 'destructive' : 'outline'}
                    onClick={() => setRecording(!recording)}
                  >
                    {recording ? <Pause className="ds-w-3 ds-h-3" /> : <Play className="ds-w-3 ds-h-3" />}
                    {recording ? 'Stop' : 'Record'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={replaySequence}>
                    <Play className="ds-w-3 ds-h-3 ds-mr-1" />
                    Replay ({recordedSequence.length})
                  </Button>
                </div>
              </div>

              <div className="ds-space-y-2">
                <h4 className="ds-font-medium">Load Test</h4>
                <div className="ds-flex ds-gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      for (let i = 0; i < 10; i++) {
                        setTimeout(() => {
                          services.eventBus.emit('load:test', { index: i });
                        }, i * 100);
                      }
                    }}
                  >
                    Generate 10 Events
                  </Button>
                </div>
              </div>

              <div className="ds-space-y-2">
                <h4 className="ds-font-medium">Storage</h4>
                <div className="ds-text-sm">
                  <p>Events: {events.length}/100</p>
                  <p>Size: {(StorageManager.getSize() / 1024).toFixed(1)}KB</p>
                </div>
              </div>
            </div>
          </details>
        </div>
      )}

      {/* Keyboard Shortcuts Helper */}
      <div className="ds-text-xs ds-text-muted ds-mt-6 ds-text-center">
        <kbd>Ctrl+K</kbd> Search • <kbd>Ctrl+E</kbd> Quick Emit • <kbd>Ctrl+L</kbd> Clear • <kbd>Ctrl+R</kbd> Replay
      </div>
    </div>
  );
};