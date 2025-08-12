import React, { useState, useMemo } from 'react';

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
  showSearch?: boolean;
  showStats?: boolean;
};

export const EventLog: React.FC<EventLogProps> = ({
  messages,
  onClear,
  maxHeight = 'max-h-64',
  className,
  emptyIcon,
  emptyMessage = 'No events captured',
  emptySubMessage = 'Events will appear here',
  showSearch = false,
  showStats = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories and their counts
  const categoryStats = useMemo(() => {
    const stats = new Map<string, number>();
    if (messages && Array.isArray(messages)) {
      messages.forEach((msg) => {
        const [category] = msg.event.split(':');
        stats.set(category, (stats.get(category) || 0) + 1);
      });
    }
    return Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);
  }, [messages]);

  // Filter messages based on search and category
  const filteredMessages = useMemo(() => {
    if (!messages || !Array.isArray(messages)) return [];
    return messages.filter((msg) => {
      const [category] = msg.event.split(':');
      const matchesSearch =
        !searchTerm ||
        msg.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(msg.data).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [messages, searchTerm, selectedCategory]);

  const formatTimestamp = (timestamp: string) => {
    if (timestamp.includes(':')) return timestamp;
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatData = (data: any) => {
    if (data === null || data === undefined) return null;

    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return <span className="text-xs text-muted-foreground/70 font-mono">= {String(data)}</span>;
    }

    const json = JSON.stringify(data, null, 2);
    const lines = json.split('\n');

    if (lines.length <= 2) {
      return (
        <span className="text-xs font-mono text-muted-foreground/70">{JSON.stringify(data)}</span>
      );
    }

    return (
      <div className="mt-1.5 bg-black/5 dark:bg-white/5 rounded p-1.5 border border-border/30">
        <pre className="text-xs font-mono text-muted-foreground/60 overflow-x-auto">{json}</pre>
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Event Log
          </h4>
          {filteredMessages.length > 0 && (
            <span className="text-xs text-muted-foreground/60">({filteredMessages.length})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showSearch && messages && messages.length > 0 && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="px-2 py-0.5 text-xs rounded border border-border bg-background/50 placeholder:text-muted-foreground/30 focus:outline-none focus:border-muted-foreground/50 w-24"
            />
          )}
          {onClear && messages && messages.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      {showStats && categoryStats.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              !selectedCategory
                ? 'bg-foreground text-background'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            All ({messages?.length || 0})
          </button>
          {categoryStats.map(([category, count]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-foreground text-background'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {category} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Log Container */}
      <div className="border border-border rounded-md bg-card/50 overflow-hidden">
        <div className={`${maxHeight} overflow-y-auto`}>
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50">
              {emptyIcon || (
                <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              )}
              <p className="text-xs font-medium">{searchTerm ? 'No matches' : emptyMessage}</p>
              <p className="text-xs mt-0.5 opacity-60">
                {searchTerm ? `No events match "${searchTerm}"` : emptySubMessage}
              </p>
            </div>
          ) : (
            <div>
              {filteredMessages.map((msg, index) => {
                const parts = msg.event.split(':');
                const category = parts[0];
                const action = parts.slice(1).join(':');
                const isFirst = index === 0;

                return (
                  <div
                    key={msg.id}
                    className={`group border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors ${
                      isFirst && !searchTerm && !selectedCategory ? 'bg-muted/10' : ''
                    }`}
                  >
                    <div className="px-3 py-2">
                      {/* Event Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Category */}
                          <span className="text-xs font-semibold text-muted-foreground uppercase">
                            {category}
                          </span>

                          {/* Separator */}
                          {action && (
                            <>
                              <span className="text-muted-foreground/30">:</span>
                              {/* Action */}
                              <span className="text-xs text-foreground/80 font-medium">
                                {action}
                              </span>
                            </>
                          )}

                          {/* Source */}
                          {msg.source && !['Container', 'Self'].includes(msg.source) && (
                            <>
                              <span className="text-muted-foreground/30">←</span>
                              <span className="text-xs text-muted-foreground">{msg.source}</span>
                            </>
                          )}
                        </div>

                        {/* Timestamp */}
                        <span className="text-xs text-muted-foreground/40 tabular-nums font-mono">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      </div>

                      {/* Event Data */}
                      {msg.data !== null && msg.data !== undefined && (
                        <div className="mt-1 ml-4">{formatData(msg.data)}</div>
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
