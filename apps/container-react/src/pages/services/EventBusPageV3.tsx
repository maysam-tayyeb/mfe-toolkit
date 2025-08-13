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
    id: 'trading',
    name: 'Stock Trading Dashboard',
    description: 'Real-time stock market trading platform with analytics',
    icon: '📈',
    mfes: [
      { id: 'mfe-market-watch', title: 'Market Watch', framework: 'react' },
      { id: 'mfe-trading-terminal', title: 'Trading Terminal', framework: 'vue' },
      { id: 'mfe-analytics-engine', title: 'Analytics Engine', framework: 'vanilla', position: 'full-width' }
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
  const [activeScenario, setActiveScenario] = useState<string>('trading');
  const [events, setEvents] = useState<EventMessage[]>(() => StorageManager.load(STORAGE_KEY));
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [selectedMFE, setSelectedMFE] = useState<string | null>(null);
  const [showEventLog, setShowEventLog] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Initialize selectedMFE when switching to focus mode
  useEffect(() => {
    if (layoutMode === 'focus' && !selectedMFE) {
      const currentScenario = scenarios.find(s => s.id === activeScenario);
      if (currentScenario && currentScenario.mfes.length > 0) {
        setSelectedMFE(currentScenario.mfes[0].id);
      }
    }
  }, [layoutMode, selectedMFE, activeScenario]);

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
      // Debug logging
      console.log('Event received:', payload);
      
      // Filter out lifecycle events and internal events
      if (payload.type?.startsWith('mfe:')) {
        return;
      }
      
      const eventTime = Date.now();
      
      // Infer source from event type
      let source = payload.source || 'System';
      const eventType = payload.type || '';
      
      // Map events to their sources based on scenario
      if (activeScenario === 'trading') {
        if (eventType.startsWith('market:')) source = 'Market Watch';
        else if (eventType.startsWith('trade:')) source = 'Trading Terminal';
        else if (eventType.startsWith('analytics:')) source = 'Analytics Engine';
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
    <div className="ds-page" style={{ 
      paddingBottom: showEventLog ? '320px' : '0',
      transition: 'padding-bottom 0.3s ease'
    }}>
      {/* Fixed Event Log Toggle Button */}
      <button
        className="ds-fixed ds-bottom-4 ds-right-4 ds-z-50 ds-btn-primary ds-btn-sm ds-shadow-lg"
        onClick={() => setShowEventLog(!showEventLog)}
        style={{ 
          position: 'fixed',
          bottom: showEventLog ? '320px' : '1rem',
          right: '1rem',
          zIndex: 50,
          transition: 'bottom 0.3s ease'
        }}
      >
        <span className="ds-icon">{showEventLog ? '📋 Hide' : '📋 Show'}</span> Event Log
      </button>

      {/* Fixed Event Log Panel */}
      {showEventLog && (
        <div 
          className="ds-fixed ds-bottom-0 ds-left-0 ds-right-0 ds-z-40 ds-shadow-xl"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            maxHeight: '300px',
            backgroundColor: 'white'
          }}
        >
          <div className="ds-card ds-p-0 ds-m-0 ds-rounded-none">
            <div className="ds-px-4 ds-py-2 ds-border-b ds-bg-slate-50">
              <div className="ds-flex ds-items-center ds-justify-between">
                <h4 className="ds-text-sm ds-font-semibold">📋 Event Log ({filteredEvents.length})</h4>
                <div className="ds-flex ds-gap-2">
                  <button 
                    onClick={clearEvents}
                    className="ds-btn-outline ds-btn-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
            <div className="ds-p-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              <EventLog
                messages={filteredEvents}
                onClear={clearEvents}
                showSearch={true}
                showStats={false}
                maxHeight="max-h-48"
              />
            </div>
          </div>
        </div>
      )}

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

        {/* Scenario Display */}
        
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
        </div>
      </div>

      {/* Main Content */}
      <div className="ds-space-y-4">
        {/* MFE Container */}
        <div className="ds-w-full">
          {/* Render all MFEs but control visibility/layout with CSS */}
          <div className={
            layoutMode === 'grid' ? 'ds-grid ds-grid-cols-2 ds-gap-3' :
            layoutMode === 'stacked' ? 'ds-flex ds-flex-col ds-gap-3' :
            'ds-space-y-4'
          }>
            {layoutMode === 'focus' && (
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
            )}
            
            {currentScenario.mfes.map(mfe => (
              <div
                key={`${activeScenario}-${mfe.id}`} // Key includes scenario to force remount on scenario change
                className={
                  layoutMode === 'focus' 
                    ? (selectedMFE === mfe.id ? 'ds-block' : 'ds-hidden')
                    : (mfe.position === 'full-width' && layoutMode === 'grid' ? 'ds-col-span-2' : '')
                }
              >
                <MFECard 
                  id={mfe.id}
                  title={mfe.title}
                  framework={mfe.framework}
                  fullHeight={layoutMode === 'focus'}
                />
              </div>
            ))}
          </div>
        </div>

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