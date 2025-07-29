import React, { useState, useEffect, memo } from 'react';

interface StateLogEntry {
  timestamp: Date;
  key: string;
  value: any;
  source: string;
}

interface StateChangeLogProps {
  stateManager: any;
}

// Memoized component to prevent re-renders from affecting parent
export const StateChangeLog: React.FC<StateChangeLogProps> = memo(({ stateManager }) => {
  const [stateLog, setStateLog] = useState<Array<StateLogEntry>>([]);
  
  useEffect(() => {
    // Subscribe to all state changes
    const unsubscribe = stateManager.subscribeAll((event: any) => {
      setStateLog(prev => [{
        timestamp: new Date(event.timestamp),
        key: event.key,
        value: event.value,
        source: event.source
      }, ...prev].slice(0, 20)); // Keep last 20 entries
    });
    
    return unsubscribe;
  }, [stateManager]);

  // Clear log when state is cleared
  useEffect(() => {
    const unsubscribe = stateManager.subscribe('__CLEAR__', () => {
      setStateLog([]);
    });
    return unsubscribe;
  }, [stateManager]);

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Real-time State Change Log</h2>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {stateLog.length === 0 ? (
          <p className="text-muted-foreground">No state changes yet. Interact with the MFEs below.</p>
        ) : (
          stateLog.map((entry, index) => (
            <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
              <span className="text-muted-foreground">
                [{entry.timestamp.toLocaleTimeString()}]
              </span>{' '}
              <span className="font-semibold">{entry.key}</span> ={' '}
              <span className="text-primary">{JSON.stringify(entry.value)}</span>
              <span className="text-muted-foreground"> (from: {entry.source})</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

StateChangeLog.displayName = 'StateChangeLog';