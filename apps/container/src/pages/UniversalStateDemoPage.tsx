import React, { useState, useMemo, useEffect } from 'react';
import { getGlobalStateManager } from '@mfe/universal-state';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';
import { useMFEUrlsFromContext } from '@/hooks/useMFEUrlsFromContext';
import { IsolatedMFELoader } from '@/components/IsolatedMFELoader';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StateChangeLog } from '@/components/StateChangeLog';

export const UniversalStateDemoPage: React.FC = () => {
  // Use the custom hook to get MFE URLs from context
  const { urls: mfeUrls, isLoading: registryLoading } = useMFEUrlsFromContext([
    'stateDemoReact',
    'stateDemoVue',
    'stateDemoVanilla',
  ]);

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
  const mfeServices = useMemo(() => {
    const baseServices = getMFEServicesSingleton();
    const enhancedServices = Object.assign({}, baseServices, {
      stateManager: stateManager
    });
    console.log('[UniversalStateDemoPage] Enhanced services:', enhancedServices);
    console.log('[UniversalStateDemoPage] stateManager in services?', 'stateManager' in enhancedServices);
    console.log('[UniversalStateDemoPage] Services keys:', Object.keys(enhancedServices));
    return enhancedServices;
  }, [stateManager]);
  
  // Subscribe to theme changes and update document class
  useEffect(() => {
    // Subscribe to theme changes
    const unsubscribe = stateManager.subscribe('theme', (value) => {
      if (value === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
    
    // Set initial theme
    const currentTheme = stateManager.get('theme');
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return unsubscribe;
  }, [stateManager]);
  
  
  const clearState = () => {
    stateManager.clear();
  };
  
  const resetCounter = () => {
    stateManager.set('sharedCounter', 0, 'container');
  };
  
  return (
    <ErrorBoundary>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Universal State Management Demo</h1>
        <p className="text-muted-foreground mt-2">
          Framework-agnostic state management across React, Vue, and Vanilla JS MFEs
        </p>
      </div>
      
      {/* Control Panel and State Change Log */}
      <div className="grid gap-6 lg:grid-cols-6">
        {/* Control Panel - 1 column */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="text-xl font-semibold">Control Panel</h2>
            <div className="space-y-2">
              <button
                onClick={clearState}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
              >
                Clear All State
              </button>
              <button
                onClick={resetCounter}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
              >
                Reset Counter
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm"
              >
                Reload Page
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: State persists across page reloads and is synchronized across browser tabs!
            </p>
          </div>
        </div>
        
        {/* State Change Log - 5 columns */}
        <div className="lg:col-span-5">
          <StateChangeLog stateManager={stateManager} />
        </div>
      </div>
      
      {/* MFE Grid */}
      {registryLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading MFE registry...</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* React MFE */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-blue-500 text-white px-4 py-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span>⚛️</span> React MFE
              </h3>
            </div>
            <div className="p-4">
              {mfeUrls.stateDemoReact ? (
                <IsolatedMFELoader
                  name="state-demo-react"
                  url={mfeUrls.stateDemoReact}
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
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">React MFE not found in registry</p>
                </div>
              )}
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
              {mfeUrls.stateDemoVue ? (
                <IsolatedMFELoader
                  name="state-demo-vue"
                  url={mfeUrls.stateDemoVue}
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
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Vue MFE not found in registry</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Vanilla JS MFE */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-yellow-500 text-white px-4 py-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span>🟨</span> Vanilla JS MFE
              </h3>
            </div>
            <div className="p-4">
              {mfeUrls.stateDemoVanilla ? (
                <IsolatedMFELoader
                  name="state-demo-vanilla"
                  url={mfeUrls.stateDemoVanilla}
                  services={mfeServices}
                  fallback={
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-muted-foreground">Loading Vanilla JS MFE...</p>
                    </div>
                  }
                  onError={(error) => {
                    console.error('Failed to load Vanilla JS MFE:', error);
                  }}
                />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Vanilla JS MFE not found in registry</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">🎯 Try These Actions:</h3>
        <ul className="space-y-1 text-sm">
          <li>• Update the user in one MFE and see it reflect in all three</li>
          <li>• Toggle the theme and watch all MFEs update their appearance</li>
          <li>• Increment the shared counter from any MFE</li>
          <li>• Notice how state changes from React, Vue, or Vanilla JS are synchronized</li>
          <li>• Open this page in another tab and see state sync in real-time</li>
          <li>• Refresh the page and see that state persists</li>
        </ul>
      </div>
    </div>
    </ErrorBoundary>
  );
};