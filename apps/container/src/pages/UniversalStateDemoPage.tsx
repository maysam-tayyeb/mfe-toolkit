import React, { useState, useMemo, useEffect } from 'react';
import { getGlobalStateManager } from '@mfe-toolkit/state';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';
import { useMFEUrlsFromContext } from '@/hooks/useMFEUrlsFromContext';
import { MFELoader } from '@mfe-toolkit/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StateChangeLog } from '@/components/StateChangeLog';
import { Button } from '@/components/ui/button';
import { 
  initStatePerformanceMonitor, 
  measureStateUpdate,
  getPerformanceSummary 
} from '@/utils/state-performance-monitor';

export const UniversalStateDemoPage: React.FC = () => {
  // Use the custom hook to get MFE URLs from context
  const { urls: mfeUrls, isLoading: registryLoading } = useMFEUrlsFromContext([
    'stateDemoReact',
    'stateDemoVue',
    'stateDemoVanilla',
  ]);

  const [stateManager] = useState(() => {
    const manager = getGlobalStateManager({
      devtools: true,
      persistent: true,
      crossTab: true,
      initialState: {
        theme: 'light',
        sharedCounter: 0,
      },
    });
    
    console.log('[UniversalStateDemoPage] State manager type:', manager.constructor.name);
    
    // Initialize performance monitoring
    initStatePerformanceMonitor(manager.constructor.name);
    
    return manager;
  });

  // Create enhanced services with state manager
  const mfeServices = useMemo(() => {
    const baseServices = getMFEServicesSingleton();
    const enhancedServices = Object.assign({}, baseServices, {
      stateManager: stateManager,
    });
    console.log('[UniversalStateDemoPage] Enhanced services:', enhancedServices);
    console.log(
      '[UniversalStateDemoPage] stateManager in services?',
      'stateManager' in enhancedServices
    );
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
    measureStateUpdate(() => {
      stateManager.clear();
    }, 'clear-state');
  };

  const resetCounter = () => {
    measureStateUpdate(() => {
      stateManager.set('sharedCounter', 0, 'container');
    }, 'reset-counter');
  };
  
  const showPerformanceReport = () => {
    const summary = getPerformanceSummary();
    console.log('Performance Summary:', summary);
    alert(`Performance data logged to console. Check developer tools.`);
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
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-4 space-y-4">
                <h3 className="text-lg font-semibold">Control Panel</h3>
                <div className="space-y-2">
                  <Button onClick={clearState} variant="outline" size="sm" className="w-full">
                    Clear All State
                  </Button>
                  <Button onClick={resetCounter} variant="secondary" size="sm" className="w-full">
                    Reset Counter
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Reload Page
                  </Button>
                  <Button
                    onClick={showPerformanceReport}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    Performance Report
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: State persists across page reloads and is synchronized across browser tabs!
                </p>
                <p className="text-xs text-muted-foreground">
                  Implementation: <strong>{stateManager.constructor.name}</strong>
                </p>
              </div>
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
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="border-b bg-muted px-4 py-3">
                <h3 className="font-semibold">React MFE</h3>
              </div>
              <div className="p-4">
                {mfeUrls.stateDemoReact ? (
                  <MFELoader
                    name="state-demo-react"
                    url={mfeUrls.stateDemoReact}
                    services={mfeServices}
                    fallback={
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-muted-foreground">Loading React MFE...</p>
                      </div>
                    }
                    onError={(error: Error) => {
                      console.error('Failed to load React MFE:', error);
                    }}
                    isolate={true}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">React MFE not found in registry</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vue MFE */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="border-b bg-muted px-4 py-3">
                <h3 className="font-semibold">Vue MFE</h3>
              </div>
              <div className="p-4">
                {mfeUrls.stateDemoVue ? (
                  <MFELoader
                    name="state-demo-vue"
                    url={mfeUrls.stateDemoVue}
                    services={mfeServices}
                    fallback={
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-muted-foreground">Loading Vue MFE...</p>
                      </div>
                    }
                    onError={(error: Error) => {
                      console.error('Failed to load Vue MFE:', error);
                    }}
                    isolate={true}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Vue MFE not found in registry</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vanilla JS MFE */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="border-b bg-muted px-4 py-3">
                <h3 className="font-semibold">Vanilla TypeScript MFE</h3>
              </div>
              <div className="p-4">
                {mfeUrls.stateDemoVanilla ? (
                  <MFELoader
                    name="state-demo-vanilla"
                    url={mfeUrls.stateDemoVanilla}
                    services={mfeServices}
                    fallback={
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-muted-foreground">Loading Vanilla JS MFE...</p>
                      </div>
                    }
                    onError={(error: Error) => {
                      console.error('Failed to load Vanilla JS MFE:', error);
                    }}
                    isolate={true}
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
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-3">Try These Actions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/60">•</span>
                <span>Update the user in one MFE and see it reflect in all three</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/60">•</span>
                <span>Toggle the theme and watch all MFEs update their appearance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/60">•</span>
                <span>Increment the shared counter from any MFE</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/60">•</span>
                <span>
                  Notice how state changes from React, Vue, or Vanilla JS are synchronized
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/60">•</span>
                <span>Open this page in another tab and see state sync in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground/60">•</span>
                <span>Refresh the page and see that state persists</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
