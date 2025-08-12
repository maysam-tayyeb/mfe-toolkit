import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/contexts/UIContext';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';
import { RegistryMFELoader } from '@/components/RegistryMFELoader';
import { 
  MessageSquare, Send, Trash2, Search, 
  Filter, Play, Pause, Settings, Zap, Activity,
  BarChart3, Code, BookOpen, Layers, Terminal,
  ChevronRight, AlertCircle, CheckCircle, Clock,
  Users, Cpu, Radio, Wifi, X, Maximize2, Minimize2,
  RefreshCw, Eye, EyeOff, Grid3x3
} from 'lucide-react';

type EventMessage = {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  source: string;
};

type LayoutMode = 'grid' | 'stacked' | 'focus';

const STORAGE_KEY = 'eventBus_logs';

// Storage Manager
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
  load: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  clear: (key: string) => {
    localStorage.removeItem(key);
  },
  getSize: () => {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }
};

export const EventBusPageV2: React.FC = () => {
  const { addNotification } = useUI();
  const services = useMemo(() => getMFEServicesSingleton(), []);
  
  // Core state
  const [events, setEvents] = useState<EventMessage[]>(() => StorageManager.load(STORAGE_KEY));
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [selectedMFE, setSelectedMFE] = useState<string | null>(null);
  const [showEventLog, setShowEventLog] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Performance metrics
  const [metrics, setMetrics] = useState({
    eventsPerMinute: 0,
    avgLatency: 0,
    activeListeners: 0,
    errors: 0,
    lastEventTime: null as number | null
  });

  // Event handling - Only listen to specific events to avoid re-renders
  useEffect(() => {
    const handleEvent = (payload: any) => {
      // Filter out lifecycle events that shouldn't cause re-renders
      if (payload.type?.startsWith('mfe:') || payload.type === 'user:seen') {
        return; // Skip MFE lifecycle events
      }
      
      const eventTime = Date.now();
      
      // Infer source from event type
      let source = payload.source || 'System';
      if (payload.type?.startsWith('order:') || payload.type?.startsWith('cart:')) {
        source = 'Order Actions';
      } else if (payload.type?.startsWith('payment:') || payload.type?.startsWith('inventory:') || payload.type?.startsWith('email:') || payload.type?.startsWith('analytics:')) {
        source = 'Order Processor';
      } else if (payload.type?.startsWith('worker:')) {
        source = 'Event Bus';
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
          eventsPerMinute: Math.min(prev.eventsPerMinute + 1, 999),
          avgLatency: Math.round((prev.avgLatency + latency) / 2),
          lastEventTime: eventTime
        };
      });
    };

    const unsubscribe = services.eventBus.on('*', handleEvent);

    // Count active listeners
    const updateListenerCount = () => {
      const count = (services.eventBus as any).listeners?.size || 0;
      setMetrics(prev => ({ ...prev, activeListeners: count }));
    };
    
    updateListenerCount();
    const interval = setInterval(updateListenerCount, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [services]);

  // Reset metrics every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({ ...prev, eventsPerMinute: Math.floor(prev.eventsPerMinute * 0.9) }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = !searchTerm || 
        event.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(event.data).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'all' || 
        event.event.toLowerCase().startsWith(filterType.toLowerCase());
      
      return matchesSearch && matchesFilter;
    });
  }, [events, searchTerm, filterType]);

  // Quick actions
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
    StorageManager.clear(STORAGE_KEY);
    addNotification({
      type: 'info',
      title: 'Events Cleared',
      message: 'Event log has been cleared'
    });
  };

  return (
    <div className="ds-h-screen ds-flex ds-flex-col ds-bg-slate-50">
      {/* Compact Header */}
      <div className="ds-bg-white ds-border-b ds-px-4 ds-py-2">
        <div className="ds-flex ds-items-center ds-justify-between">
          <div className="ds-flex ds-items-center ds-gap-4">
            <h1 className="ds-text-lg ds-font-bold">Event Bus</h1>
            
            {/* Metrics Bar */}
            <div className="ds-flex ds-items-center ds-gap-3 ds-text-xs">
              <div className="ds-flex ds-items-center ds-gap-1">
                <Activity className="ds-w-3 ds-h-3 ds-text-green-500" />
                <span className="ds-font-mono">{metrics.eventsPerMinute}/min</span>
              </div>
              <div className="ds-flex ds-items-center ds-gap-1">
                <Clock className="ds-w-3 ds-h-3 ds-text-blue-500" />
                <span className="ds-font-mono">{metrics.avgLatency}ms</span>
              </div>
              <div className="ds-flex ds-items-center ds-gap-1">
                <Radio className="ds-w-3 ds-h-3 ds-text-purple-500" />
                <span className="ds-font-mono">{metrics.activeListeners}</span>
              </div>
              {metrics.errors > 0 && (
                <div className="ds-flex ds-items-center ds-gap-1">
                  <AlertCircle className="ds-w-3 ds-h-3 ds-text-red-500" />
                  <span className="ds-font-mono ds-text-red-600">{metrics.errors}</span>
                </div>
              )}
            </div>
          </div>

          {/* Layout Controls */}
          <div className="ds-flex ds-items-center ds-gap-2">
            <div className="ds-flex ds-bg-slate-100 ds-rounded-md ds-p-0.5">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`ds-px-2 ds-py-1 ds-rounded ds-text-xs ${
                  layoutMode === 'grid' ? 'ds-bg-white ds-shadow-sm' : ''
                }`}
                title="Grid Layout"
              >
                <Grid3x3 className="ds-w-3 ds-h-3" />
              </button>
              <button
                onClick={() => setLayoutMode('stacked')}
                className={`ds-px-2 ds-py-1 ds-rounded ds-text-xs ${
                  layoutMode === 'stacked' ? 'ds-bg-white ds-shadow-sm' : ''
                }`}
                title="Stacked Layout"
              >
                <Layers className="ds-w-3 ds-h-3" />
              </button>
              <button
                onClick={() => setLayoutMode('focus')}
                className={`ds-px-2 ds-py-1 ds-rounded ds-text-xs ${
                  layoutMode === 'focus' ? 'ds-bg-white ds-shadow-sm' : ''
                }`}
                title="Focus Mode"
              >
                <Maximize2 className="ds-w-3 ds-h-3" />
              </button>
            </div>
            
            <button
              onClick={() => setShowEventLog(!showEventLog)}
              className="ds-p-1 ds-rounded ds-hover:bg-slate-100"
              title={showEventLog ? 'Hide Event Log' : 'Show Event Log'}
            >
              {showEventLog ? <EyeOff className="ds-w-4 ds-h-4" /> : <Eye className="ds-w-4 ds-h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ds-flex-1 ds-flex ds-overflow-hidden">
        {/* MFE Panel */}
        <div className={`ds-flex-1 ds-flex ${
          showEventLog ? 'ds-w-2/3' : 'ds-w-full'
        }`}>
          {layoutMode === 'grid' && (
            <div className="ds-grid ds-grid-cols-2 ds-gap-2 ds-p-2 ds-w-full">
              <MFECard 
                id="mfe-event-publisher" 
                title="Order Actions" 
                badge="ds-bg-green-500"
                onQuickAction={(action) => quickEmit(action.type, action.data)}
              />
              <MFECard 
                id="mfe-event-subscriber" 
                title="Service Notifications" 
                badge="ds-bg-blue-500"
              />
              <MFECard 
                id="mfe-event-orchestrator" 
                title="Order Processor" 
                badge="ds-bg-purple-500"
                className="ds-col-span-2"
              />
            </div>
          )}

          {layoutMode === 'stacked' && (
            <div className="ds-flex ds-flex-col ds-gap-2 ds-p-2 ds-w-full ds-overflow-y-auto">
              <MFECard 
                id="mfe-event-publisher" 
                title="Order Actions" 
                badge="ds-bg-green-500"
                onQuickAction={(action) => quickEmit(action.type, action.data)}
              />
              <MFECard 
                id="mfe-event-subscriber" 
                title="Service Notifications" 
                badge="ds-bg-blue-500"
              />
              <MFECard 
                id="mfe-event-orchestrator" 
                title="Order Processor" 
                badge="ds-bg-purple-500"
              />
            </div>
          )}

          {layoutMode === 'focus' && (
            <div className="ds-flex ds-flex-col ds-w-full">
              <div className="ds-flex ds-border-b ds-bg-white">
                {['publisher', 'subscriber', 'orchestrator'].map(mfe => (
                  <button
                    key={mfe}
                    onClick={() => setSelectedMFE(mfe)}
                    className={`ds-px-4 ds-py-2 ds-text-sm ds-border-r ds-hover:bg-slate-50 ${
                      selectedMFE === mfe ? 'ds-bg-slate-100 ds-font-medium' : ''
                    }`}
                  >
                    {mfe.charAt(0).toUpperCase() + mfe.slice(1)}
                  </button>
                ))}
              </div>
              <div className="ds-flex-1 ds-p-2">
                {selectedMFE === 'publisher' && (
                  <MFECard 
                    id="mfe-event-publisher" 
                    title="Order Actions" 
                    badge="ds-bg-green-500"
                    fullHeight
                    onQuickAction={(action) => quickEmit(action.type, action.data)}
                  />
                )}
                {selectedMFE === 'subscriber' && (
                  <MFECard 
                    id="mfe-event-subscriber" 
                    title="Service Notifications" 
                    badge="ds-bg-blue-500"
                    fullHeight
                  />
                )}
                {selectedMFE === 'orchestrator' && (
                  <MFECard 
                    id="mfe-event-orchestrator" 
                    title="Order Processor" 
                    badge="ds-bg-purple-500"
                    fullHeight
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Event Log Sidebar */}
        {showEventLog && (
          <div className="ds-w-1/3 ds-border-l ds-bg-white ds-flex ds-flex-col">
            {/* Event Log Header */}
            <div className="ds-border-b ds-px-3 ds-py-2">
              <div className="ds-flex ds-items-center ds-justify-between ds-mb-2">
                <h3 className="ds-text-sm ds-font-semibold">Event Log</h3>
                <div className="ds-flex ds-items-center ds-gap-1">
                  <span className="ds-text-xs ds-text-slate-500">
                    {filteredEvents.length} events
                  </span>
                  <button
                    onClick={clearEvents}
                    className="ds-p-1 ds-rounded ds-hover:bg-slate-100"
                    title="Clear Events"
                  >
                    <Trash2 className="ds-w-3 ds-h-3" />
                  </button>
                </div>
              </div>
              
              {/* Search and Filter */}
              <div className="ds-flex ds-gap-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="ds-flex-1 ds-px-2 ds-py-1 ds-text-xs ds-border ds-rounded"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="ds-px-2 ds-py-1 ds-text-xs ds-border ds-rounded"
                >
                  <option value="all">All</option>
                  <option value="chat">Chat</option>
                  <option value="system">System</option>
                  <option value="user">User</option>
                  <option value="worker">Worker</option>
                </select>
              </div>
            </div>

            {/* Event List */}
            <div className="ds-flex-1 ds-overflow-y-auto ds-text-xs">
              {filteredEvents.length === 0 ? (
                <div className="ds-flex ds-flex-col ds-items-center ds-justify-center ds-h-full ds-text-slate-400">
                  <MessageSquare className="ds-w-8 ds-h-8 ds-mb-2" />
                  <p>No events</p>
                </div>
              ) : (
                <div>
                  {filteredEvents.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>

            {/* Storage Info */}
            <div className="ds-border-t ds-px-3 ds-py-1 ds-text-xs ds-text-slate-500">
              Storage: {(StorageManager.getSize() / 1024).toFixed(1)}KB
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Bar */}
      <div className="ds-border-t ds-bg-white ds-px-4 ds-py-2">
        <div className="ds-flex ds-items-center ds-gap-2">
          <span className="ds-text-xs ds-text-slate-500 ds-mr-2">Quick Actions:</span>
          <button
            onClick={() => quickEmit('test:ping', { timestamp: Date.now() })}
            className="ds-px-2 ds-py-1 ds-text-xs ds-bg-slate-100 ds-rounded ds-hover:bg-slate-200"
          >
            Ping
          </button>
          <button
            onClick={() => quickEmit('system:broadcast', { message: 'Hello all!' })}
            className="ds-px-2 ds-py-1 ds-text-xs ds-bg-slate-100 ds-rounded ds-hover:bg-slate-200"
          >
            Broadcast
          </button>
          <button
            onClick={() => {
              for (let i = 0; i < 10; i++) {
                setTimeout(() => quickEmit('load:test', { index: i }), i * 100);
              }
            }}
            className="ds-px-2 ds-py-1 ds-text-xs ds-bg-slate-100 ds-rounded ds-hover:bg-slate-200"
          >
            Load Test
          </button>
          <div className="ds-flex-1" />
          <span className="ds-text-xs ds-text-slate-400">
            <kbd>Ctrl+K</kbd> Search • <kbd>Ctrl+E</kbd> Emit • <kbd>Ctrl+L</kbd> Clear
          </span>
        </div>
      </div>
    </div>
  );
};

// MFE Card Component
const MFECard: React.FC<{
  id: string;
  title: string;
  badge?: string;
  className?: string;
  fullHeight?: boolean;
  onQuickAction?: (action: { type: string; data: any }) => void;
}> = ({ id, title, badge, className = '', fullHeight = false, onQuickAction }) => {
  return (
    <div className={`ds-bg-white ds-rounded-lg ds-shadow-sm ds-border ds-flex ds-flex-col ${
      fullHeight ? 'ds-h-full' : ''
    } ${className}`}>
      <div className="ds-px-3 ds-py-2 ds-border-b ds-flex ds-items-center ds-justify-between">
        <div className="ds-flex ds-items-center ds-gap-2">
          <div className={`ds-w-2 ds-h-2 ds-rounded-full ${badge || 'ds-bg-gray-400'}`} />
          <span className="ds-text-sm ds-font-medium">{title}</span>
        </div>
        {onQuickAction && (
          <button
            onClick={() => onQuickAction({ type: 'quick:action', data: { from: title } })}
            className="ds-p-1 ds-rounded ds-hover:bg-slate-100"
          >
            <Zap className="ds-w-3 ds-h-3" />
          </button>
        )}
      </div>
      <div className="ds-flex-1 ds-p-2 ds-overflow-auto">
        <RegistryMFELoader id={id} />
      </div>
    </div>
  );
};

// Event Row Component
const EventRow: React.FC<{ event: EventMessage }> = ({ event }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getEventColor = (type: string) => {
    if (type.startsWith('chat:')) return 'ds-text-blue-600';
    if (type.startsWith('system:')) return 'ds-text-purple-600';
    if (type.startsWith('user:')) return 'ds-text-green-600';
    if (type.startsWith('worker:')) return 'ds-text-orange-600';
    if (type.startsWith('error:')) return 'ds-text-red-600';
    return 'ds-text-gray-600';
  };

  return (
    <div className="ds-border-b ds-hover:bg-slate-50">
      <div 
        className="ds-px-3 ds-py-2 ds-cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="ds-flex ds-items-center ds-justify-between">
          <span className={`ds-font-medium ${getEventColor(event.event)}`}>
            {event.event}
          </span>
          <span className="ds-text-slate-400 ds-font-mono">
            {event.timestamp}
          </span>
        </div>
        {event.source && (
          <div className="ds-text-slate-500 ds-mt-0.5">
            from: {event.source}
          </div>
        )}
      </div>
      {expanded && event.data && (
        <div className="ds-px-3 ds-pb-2">
          <pre className="ds-bg-slate-100 ds-p-2 ds-rounded ds-text-xs ds-overflow-x-auto">
            {JSON.stringify(event.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EventBusPageV2;