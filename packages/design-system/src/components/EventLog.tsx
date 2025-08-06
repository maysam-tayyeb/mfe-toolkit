import React from 'react';
import { cn } from '../lib/utils';

export type EventMessage = {
  id: string;
  event: string;
  data: any;
  timestamp: string;
  source: string;
};

type EventLogProps = {
  messages: EventMessage[];
  onClear?: () => void;
  maxHeight?: string;
  className?: string;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  emptySubMessage?: string;
};

export const EventLog: React.FC<EventLogProps> = ({
  messages,
  onClear,
  maxHeight = 'max-h-64',
  className,
  emptyIcon,
  emptyMessage = 'No events captured yet',
  emptySubMessage = 'Events will appear here'
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user': return 'text-blue-500 bg-blue-500/10';
      case 'container': return 'text-purple-500 bg-purple-500/10';
      case 'theme': return 'text-green-500 bg-green-500/10';
      case 'data': return 'text-orange-500 bg-orange-500/10';
      case 'navigation': return 'text-indigo-500 bg-indigo-500/10';
      case 'config': return 'text-pink-500 bg-pink-500/10';
      case 'system': return 'text-cyan-500 bg-cyan-500/10';
      case 'modal': return 'text-violet-500 bg-violet-500/10';
      case 'notification': return 'text-yellow-500 bg-yellow-500/10';
      case 'settings': return 'text-emerald-500 bg-emerald-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      case 'mfe': return 'text-fuchsia-500 bg-fuchsia-500/10';
      case 'custom': return 'text-slate-500 bg-slate-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    // If it's already formatted, return as is
    if (timestamp.includes(':')) return timestamp;
    
    // Otherwise format it
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatData = (data: any) => {
    if (data === null || data === undefined) return null;
    
    // For simple values, show inline
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return <span className="text-[10px] text-muted-foreground ml-2">= {String(data)}</span>;
    }
    
    // For objects/arrays, show as formatted JSON
    const json = JSON.stringify(data, null, 2);
    const lines = json.split('\n');
    
    // If it's a small object (less than 3 lines), show inline
    if (lines.length <= 3) {
      return (
        <span className="text-[10px] font-mono text-muted-foreground ml-2">
          {JSON.stringify(data)}
        </span>
      );
    }
    
    // Otherwise show as a code block
    return (
      <div className="mt-1.5 bg-muted/20 rounded-md p-1.5 border border-border/50">
        <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto">
          {json}
        </pre>
      </div>
    );
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted-foreground">EVENT LOG</h4>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <span className="text-[10px] text-muted-foreground">
                {messages.length} {messages.length === 1 ? 'event' : 'events'}
              </span>
              {onClear && (
                <button
                  onClick={onClear}
                  className="px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                  Clear
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Log Container */}
      <div className="border border-border rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className={cn(maxHeight, 'overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent')}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              {emptyIcon || (
                <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              )}
              <p className="text-xs font-medium">{emptyMessage}</p>
              <p className="text-[10px] mt-0.5 text-muted-foreground/60">{emptySubMessage}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {messages.map((msg, index) => {
                const parts = msg.event.split(':');
                const category = parts[0];
                const action = parts.slice(1).join(':');
                const categoryStyle = getCategoryColor(category);
                const isLatest = index === 0;
                
                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "group transition-all duration-200",
                      "hover:bg-muted/20",
                      isLatest && "bg-primary/5 animate-in fade-in-0 slide-in-from-top-1"
                    )}
                  >
                    <div className="p-2">
                      {/* Event Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {/* Category Badge */}
                          <span className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold",
                            categoryStyle
                          )}>
                            <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                            {category?.toUpperCase()}
                          </span>
                          
                          {/* Event Action */}
                          {action && (
                            <span className="text-xs font-mono text-foreground/80 truncate">
                              {action}
                            </span>
                          )}
                          
                          {/* Source Badge */}
                          {msg.source && msg.source !== 'Container' && msg.source !== 'Self' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
                              from {msg.source}
                            </span>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <span className="text-[10px] text-muted-foreground/60 tabular-nums whitespace-nowrap">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>
                      
                      {/* Event Data */}
                      {msg.data !== null && msg.data !== undefined && (
                        <div className="mt-1.5 pl-4">
                          {formatData(msg.data)}
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
  );
};

export default EventLog;