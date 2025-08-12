import React, { useState, useEffect, useMemo } from 'react';
import { useUI } from '@/contexts/UIContext';
import { RegistryMFELoader } from '@/components/RegistryMFELoader';
import { EventLog } from '@mfe/design-system-react';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';

// Types
type LayoutMode = 'grid' | 'stacked' | 'focus';

type EventMessage = {
  id: string;
  event: string;
  data?: any;
  timestamp: string;
  source: string;
};

type Scenario = {
  id: string;
  name: string;
  description: string;
  icon: string;
  mfes: Array<{
    id: string;
    title: string;
    framework: 'react' | 'vue' | 'vanilla';
    position?: 'full-width';
  }>;
};

// Scenario configurations
const scenarios: Scenario[] = [
  {
    id: 'collaboration',
    name: 'Live Collaboration',
    description: 'Real-time document collaboration workspace',
    icon: '👥',
    mfes: [
      { id: 'mfe-document-editor', title: 'Document Editor', framework: 'vue' },
      { id: 'mfe-activity-feed', title: 'Activity Feed', framework: 'react' },
      { id: 'mfe-online-users', title: 'Online Users', framework: 'vanilla' }
    ]
  },
  {
    id: 'smart-home',
    name: 'Smart Home',
    description: 'IoT device control and monitoring',
    icon: '🏠',
    mfes: [
      { id: 'mfe-device-control', title: 'Device Control', framework: 'react' },
      { id: 'mfe-sensor-monitor', title: 'Sensor Monitor', framework: 'vue' },
      { id: 'mfe-automation-rules', title: 'Automation Rules', framework: 'vanilla', position: 'full-width' }
    ]
  },
  {
    id: 'live-stream',
    name: 'Live Stream',
    description: 'Broadcasting and viewer engagement platform',
    icon: '🎥',
    mfes: [
      { id: 'mfe-stream-control', title: 'Stream Control', framework: 'vanilla' },
      { id: 'mfe-chat-reactions', title: 'Chat & Reactions', framework: 'vue' },
      { id: 'mfe-stream-analytics', title: 'Analytics', framework: 'react', position: 'full-width' }
    ]
  },
  {
    id: 'e-commerce',
    name: 'E-commerce',
    description: 'Order processing and service notifications',
    icon: '🛒',
    mfes: [
      { id: 'mfe-event-publisher', title: 'Order Actions', framework: 'react' },
      { id: 'mfe-event-subscriber', title: 'Service Notifications', framework: 'react' },
      { id: 'mfe-event-orchestrator', title: 'Order Processor', framework: 'react', position: 'full-width' }
    ]
  }
];

// Storage utilities
const StorageManager = {
  save: (key: string, data: EventMessage[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save events:', error);
    }
  },
  load: (key: string): EventMessage[] => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load events:', error);
      return [];
    }
  }
};

const STORAGE_KEY = 'event-bus-demo-events';

export const EventBusPageV3: React.FC = () => {
  const { addNotification } = useUI();
  const services = useMemo(() => getMFEServicesSingleton(), []);
  
  // Core state
  const [activeScenario, setActiveScenario] = useState<string>('collaboration');
  const [events, setEvents] = useState<EventMessage[]>(() => StorageManager.load(STORAGE_KEY));
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [selectedMFE, setSelectedMFE] = useState<string | null>(null);
  const [showEventLog, setShowEventLog] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Metrics state
  const [metrics, setMetrics] = useState({
    eventRate: 0,
    avgLatency: 0,
    errorCount: 0,
    totalEvents: events.length,
    lastEventTime: 0
  });

  // Event handling
  useEffect(() => {
    const handleEvent = (payload: any) => {
      // Filter out lifecycle events
      if (payload.type?.startsWith('mfe:') || payload.type === 'user:seen') {
        return;
      }
      
      const eventTime = Date.now();
      
      // Infer source from event type
      let source = payload.source || 'System';
      const eventType = payload.type || '';
      
      // Map events to their sources based on scenario
      if (activeScenario === 'collaboration') {
        if (eventType.startsWith('document:')) source = 'Document Editor';
        else if (eventType.startsWith('activity:')) source = 'Activity Feed';
        else if (eventType.startsWith('user:')) source = 'Online Users';
      } else if (activeScenario === 'smart-home') {
        if (eventType.startsWith('device:')) source = 'Device Control';
        else if (eventType.startsWith('sensor:')) source = 'Sensor Monitor';
        else if (eventType.startsWith('automation:')) source = 'Automation Rules';
      } else if (activeScenario === 'live-stream') {
        if (eventType.startsWith('stream:')) source = 'Stream Control';
        else if (eventType.startsWith('chat:') || eventType.startsWith('reaction:')) source = 'Chat & Reactions';
        else if (eventType.startsWith('analytics:')) source = 'Analytics';
      } else if (activeScenario === 'e-commerce') {
        if (eventType.startsWith('order:') || eventType.startsWith('cart:')) source = 'Order Actions';
        else if (eventType.startsWith('payment:') || eventType.startsWith('inventory:') || eventType.startsWith('email:')) source = 'Order Processor';
      }
      
      const newEvent: EventMessage = {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        event: payload.type || 'unknown',
        data: payload.data,
        timestamp: new Date().toLocaleTimeString(),
        source
      };

      setEvents(prev => {
        const updated = [newEvent, ...prev].slice(0, 100);
        StorageManager.save(STORAGE_KEY, updated);
        return updated;
      });

      // Update metrics
      setMetrics(prev => {
        const latency = prev.lastEventTime ? eventTime - prev.lastEventTime : 0;
        return {
          ...prev,
          avgLatency: Math.round((prev.avgLatency + latency) / 2),
          totalEvents: prev.totalEvents + 1,
          lastEventTime: eventTime,
          eventRate: Math.round((prev.eventRate + 1) / 2)
        };
      });
    };

    const unsubscribe = services.eventBus.on('*', handleEvent);
    return () => unsubscribe();
  }, [services, activeScenario]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = searchTerm === '' || 
        event.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(event.data).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'all' || 
        event.event.toLowerCase().startsWith(filterType.toLowerCase());
      
      return matchesSearch && matchesFilter;
    });
  }, [events, searchTerm, filterType]);

  // Quick emit helper
  const quickEmit = (type: string, data: any) => {
    services.eventBus.emit(type, data);
    addNotification({
      type: 'success',
      title: 'Event Emitted',
      message: `${type} event sent`
    });
  };

  const clearEvents = () => {
    setEvents([]);
    StorageManager.save(STORAGE_KEY, []);
    setMetrics(prev => ({ ...prev, totalEvents: 0, eventRate: 0 }));
  };

  const currentScenario = scenarios.find(s => s.id === activeScenario)!;

  return (
    <div className="ds-page">
      {/* Header */}
      <div className="ds-mb-6">
        <div className="ds-flex ds-justify-between ds-items-start ds-mb-4">
          <div>
            <h1 className="ds-page-title">Event Bus Demos</h1>
            <p className="ds-text-muted ds-mt-2">
              Multi-framework microfrontend communication patterns
            </p>
          </div>
          <div className="ds-flex ds-items-center ds-gap-4">
            <div className="ds-flex ds-gap-2">
              <div className="ds-metric-sm">
                <span className="ds-icon">📊</span>
                <span className="ds-text-sm">{metrics.eventRate}/min</span>
              </div>
              <div className="ds-metric-sm">
                <span className="ds-icon">⚡</span>
                <span className="ds-text-sm">{metrics.avgLatency}ms</span>
              </div>
              <div className="ds-metric-sm">
                <span className="ds-icon">📨</span>
                <span className="ds-text-sm">{metrics.totalEvents}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Tabs */}
        <div className="ds-tabs">
          {scenarios.map(scenario => (
            <button
              key={scenario.id}
              className={`ds-tab ${activeScenario === scenario.id ? 'ds-tab-active' : ''}`}
              onClick={() => setActiveScenario(scenario.id)}
            >
              <span className="ds-mr-2">{scenario.icon}</span>
              {scenario.name}
            </button>
          ))}
        </div>
        
        {/* Scenario Description */}
        <div className="ds-alert-info ds-mt-4">
          <div className="ds-flex ds-items-center ds-gap-2">
            <span className="ds-text-lg">{currentScenario.icon}</span>
            <div>
              <div className="ds-font-semibold">{currentScenario.name}</div>
              <div className="ds-text-sm ds-text-muted">{currentScenario.description}</div>
            </div>
          </div>
        </div>

        {/* Layout Controls */}
        <div className="ds-flex ds-justify-between ds-items-center ds-mt-4">
          <div className="ds-flex ds-gap-2">
            <button
              className={`ds-btn-sm ${layoutMode === 'grid' ? 'ds-btn-primary' : 'ds-btn-outline'}`}
              onClick={() => setLayoutMode('grid')}
            >
              <span className="ds-icon">⊞</span> Grid Layout
            </button>
            <button
              className={`ds-btn-sm ${layoutMode === 'stacked' ? 'ds-btn-primary' : 'ds-btn-outline'}`}
              onClick={() => setLayoutMode('stacked')}
            >
              <span className="ds-icon">☰</span> Stacked Layout
            </button>
            <button
              className={`ds-btn-sm ${layoutMode === 'focus' ? 'ds-btn-primary' : 'ds-btn-outline'}`}
              onClick={() => setLayoutMode('focus')}
            >
              <span className="ds-icon">◻</span> Focus Mode
            </button>
          </div>
          <button
            className="ds-btn-outline ds-btn-sm"
            onClick={() => setShowEventLog(!showEventLog)}
          >
            <span className="ds-icon">{showEventLog ? '◀' : '▶'}</span>
            {showEventLog ? 'Hide' : 'Show'} Event Log
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ds-flex ds-gap-4">
        {/* MFE Container */}
        <div className={`ds-flex-1 ${showEventLog ? '' : 'ds-w-full'}`}>
          {layoutMode === 'grid' && (
            <div className="ds-grid ds-grid-cols-2 ds-gap-3">
              {currentScenario.mfes.map(mfe => (
                <MFECard 
                  key={mfe.id}
                  id={mfe.id}
                  title={mfe.title}
                  framework={mfe.framework}
                  className={mfe.position === 'full-width' ? 'ds-col-span-2' : ''}
                />
              ))}
            </div>
          )}

          {layoutMode === 'stacked' && (
            <div className="ds-flex ds-flex-col ds-gap-3">
              {currentScenario.mfes.map(mfe => (
                <MFECard 
                  key={mfe.id}
                  id={mfe.id}
                  title={mfe.title}
                  framework={mfe.framework}
                />
              ))}
            </div>
          )}

          {layoutMode === 'focus' && (
            <div className="ds-space-y-4">
              <div className="ds-flex ds-gap-2">
                {currentScenario.mfes.map(mfe => (
                  <button
                    key={mfe.id}
                    className={`ds-btn-sm ${selectedMFE === mfe.id ? 'ds-btn-primary' : 'ds-btn-outline'}`}
                    onClick={() => setSelectedMFE(mfe.id)}
                  >
                    {mfe.title}
                  </button>
                ))}
              </div>
              {selectedMFE && (
                <MFECard 
                  id={selectedMFE}
                  title={currentScenario.mfes.find(m => m.id === selectedMFE)?.title || ''}
                  framework={currentScenario.mfes.find(m => m.id === selectedMFE)?.framework || 'react'}
                  fullHeight
                />
              )}
            </div>
          )}
        </div>

        {/* Event Log */}
        {showEventLog && (
          <div className="ds-w-96">
            <EventLog
              events={filteredEvents}
              onClear={clearEvents}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterType={filterType}
              onFilterChange={setFilterType}
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="ds-mt-6 ds-p-4 ds-bg-slate-50 ds-rounded-lg">
        <div className="ds-flex ds-items-center ds-justify-between">
          <div className="ds-flex ds-items-center ds-gap-4">
            <span className="ds-text-sm ds-text-muted">Quick Actions:</span>
            <button 
              className="ds-btn-outline ds-btn-sm"
              onClick={() => quickEmit('test:ping', { timestamp: Date.now() })}
            >
              Ping
            </button>
            <button 
              className="ds-btn-outline ds-btn-sm"
              onClick={() => quickEmit('test:broadcast', { message: 'Hello all MFEs!' })}
            >
              Broadcast
            </button>
            <button 
              className="ds-btn-danger ds-btn-sm"
              onClick={clearEvents}
            >
              Clear Events
            </button>
          </div>
          <div className="ds-text-xs ds-text-muted">
            <span className="ds-badge ds-mr-2">Ctrl+K</span>Search •
            <span className="ds-badge ds-mx-2">Ctrl+E</span>Emit •
            <span className="ds-badge ds-mx-2">Ctrl+L</span>Clear
          </div>
        </div>
      </div>
    </div>
  );
};

// MFE Card Component with Framework Badge
const MFECard: React.FC<{
  id: string;
  title: string;
  framework: 'react' | 'vue' | 'vanilla';
  className?: string;
  fullHeight?: boolean;
}> = ({ id, title, framework, className = '', fullHeight = false }) => {
  const getFrameworkBadge = (framework: string) => {
    const badges = {
      react: { color: 'ds-bg-blue-500', icon: '⚛️', name: 'React' },
      vue: { color: 'ds-bg-green-500', icon: '💚', name: 'Vue' },
      vanilla: { color: 'ds-bg-yellow-600', icon: '📦', name: 'Vanilla' }
    };
    return badges[framework] || badges.vanilla;
  };

  const badge = getFrameworkBadge(framework);

  return (
    <div className={`ds-card ds-p-0 ds-overflow-hidden ${fullHeight ? 'ds-h-full' : ''} ${className}`}>
      <div className="ds-px-3 ds-py-2 ds-border-b ds-bg-slate-50 ds-flex ds-items-center ds-justify-between">
        <div className="ds-flex ds-items-center ds-gap-2">
          <span className="ds-text-sm ds-font-medium">{title}</span>
        </div>
        <div className={`ds-badge ds-badge-sm ${badge.color} ds-text-white`}>
          {badge.icon} {badge.name}
        </div>
      </div>
      <div className={`${fullHeight ? 'ds-h-full' : ''}`}>
        <RegistryMFELoader id={id} />
      </div>
    </div>
  );
};