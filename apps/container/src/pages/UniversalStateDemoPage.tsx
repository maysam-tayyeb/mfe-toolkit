import React, { useEffect, useState } from 'react';
import { MFELoader } from '@mfe/dev-kit';
import { getGlobalStateManager } from '@mfe/universal-state';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';

export const UniversalStateDemoPage: React.FC = () => {
  const [stateManager] = useState(() => getGlobalStateManager({
    devtools: true,
    persistent: true,
    crossTab: true,
    initialState: {
      theme: 'light',
      sharedCounter: 0
    }
  }));
  
  // Create enhanced services with state manager
  const [mfeServices] = useState(() => {
    const baseServices = getMFEServicesSingleton();
    return {
      ...baseServices,
      stateManager
    };
  });
  
  const [stateLog, setStateLog] = useState<Array<{
    timestamp: Date;
    key: string;
    value: any;
    source: string;
  }>>([]);
  
  useEffect(() => {
    // Subscribe to all state changes
    const unsubscribe = stateManager.subscribeAll((event) => {
      setStateLog(prev => [{
        timestamp: new Date(event.timestamp),
        key: event.key,
        value: event.value,
        source: event.source
      }, ...prev].slice(0, 20)); // Keep last 20 entries
    });
    
    return unsubscribe;
  }, [stateManager]);
  
  const clearState = () => {
    stateManager.clear();
    setStateLog([]);
  };
  
  const resetCounter = () => {
    stateManager.set('sharedCounter', 0, 'container');
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Universal State Management Demo</h1>
        <p className="text-muted-foreground mt-2">
          Framework-agnostic state management across React, Vue, and Vanilla JS MFEs
        </p>
      </div>
      
      {/* Control Panel */}
      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold">Control Panel</h2>
        <div className="flex gap-4">
          <button
            onClick={clearState}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Clear All State
          </button>
          <button
            onClick={resetCounter}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Reset Counter
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Reload Page
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Note: State persists across page reloads and is synchronized across browser tabs!
        </p>
      </div>
      
      {/* State Change Log */}
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Real-time State Change Log</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
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
      
      {/* MFE Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* React MFE */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-blue-500 text-white px-4 py-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span>⚛️</span> React MFE
            </h3>
          </div>
          <div className="p-4">
            <MFELoader
              name="state-demo-react"
              url="http://localhost:3004/state-demo-react.js"
              services={mfeServices}
              fallback={
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading React MFE...</p>
                </div>
              }
              onError={(error) => {
                console.error('Failed to load React MFE:', error);
              }}
            />
          </div>
        </div>
        
        {/* Vue MFE */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-green-500 text-white px-4 py-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span>💚</span> Vue MFE
            </h3>
          </div>
          <div className="p-4">
            <MFELoader
              name="state-demo-vue"
              url="http://localhost:3005/state-demo-vue.js"
              services={mfeServices}
              fallback={
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading Vue MFE...</p>
                </div>
              }
              onError={(error) => {
                console.error('Failed to load Vue MFE:', error);
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">🎯 Try These Actions:</h3>
        <ul className="space-y-1 text-sm">
          <li>• Update the user in one MFE and see it reflect in the other</li>
          <li>• Toggle the theme and watch both MFEs update their appearance</li>
          <li>• Increment the shared counter from either MFE</li>
          <li>• Add items to the Vue shopping cart (Vue-specific state)</li>
          <li>• Open this page in another tab and see state sync in real-time</li>
          <li>• Refresh the page and see that state persists</li>
        </ul>
      </div>
    </div>
  );
};