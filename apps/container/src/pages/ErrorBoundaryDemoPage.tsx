import React, { useState } from 'react';
import { MFELoader, getErrorReporter } from '@mfe/dev-kit';
import { Button } from '@/components/ui/button';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';

// Fake MFE URLs for testing different error scenarios
const ERROR_SCENARIOS = {
  networkError: 'http://localhost:9999/non-existent-mfe.js',
  invalidModule: '/test-assets/invalid-module.js',
  timeoutError: 'http://httpstat.us/200?sleep=10000',
  crashingMFE: '/test-assets/crashing-mfe.js',
};

export const ErrorBoundaryDemoPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [errorReportVisible, setErrorReportVisible] = useState(false);
  const services = getMFEServicesSingleton();
  const errorReporter = getErrorReporter({}, services);

  const scenarios = [
    {
      id: 'networkError',
      name: 'Network Error',
      description: 'Simulates a network error when loading MFE',
      url: ERROR_SCENARIOS.networkError,
    },
    {
      id: 'invalidModule',
      name: 'Invalid Module',
      description: "MFE that doesn't export proper mount function",
      url: ERROR_SCENARIOS.invalidModule,
    },
    {
      id: 'timeoutError',
      name: 'Timeout Error',
      description: 'MFE that takes too long to load',
      url: ERROR_SCENARIOS.timeoutError,
    },
    {
      id: 'crashingMFE',
      name: 'Runtime Crash',
      description: 'MFE that crashes after mounting',
      url: ERROR_SCENARIOS.crashingMFE,
    },
  ];

  const getErrorSummary = () => {
    const summary = errorReporter.getSummary();
    return summary;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Error Boundary Demo</h1>
        <p className="text-muted-foreground mt-2">
          Test error handling and recovery mechanisms for MFEs
        </p>
      </div>

      {/* Error Scenarios */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Error Scenarios</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedScenario === scenario.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => setSelectedScenario(scenario.id)}
            >
              <h3 className="font-semibold">{scenario.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MFE Loader Test Area */}
      {selectedScenario && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">MFE Test Area</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Loading MFE with scenario: <strong>{selectedScenario}</strong>
          </p>

          <div className="border border-dashed border-gray-300 rounded-lg p-4 min-h-[200px]">
            <MFELoader
              key={selectedScenario} // Force remount on scenario change
              name={`test-${selectedScenario}`}
              url={scenarios.find((s) => s.id === selectedScenario)?.url || ''}
              services={services}
              maxRetries={2}
              retryDelay={1000}
              fallback={
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading test MFE...</p>
                  </div>
                </div>
              }
              onError={(error) => {
                services.notification.error('MFE Load Failed', error.message);
              }}
            />
          </div>
        </div>
      )}

      {/* Error Report Summary */}
      <div className="border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Error Report Summary</h2>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setErrorReportVisible(!errorReportVisible)}
            >
              {errorReportVisible ? 'Hide' : 'Show'} Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                errorReporter.clearErrors();
                setErrorReportVisible(false);
              }}
            >
              Clear Errors
            </Button>
          </div>
        </div>

        {(() => {
          const summary = getErrorSummary();
          return (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="border rounded p-3">
                <p className="text-sm text-muted-foreground">Total Errors</p>
                <p className="text-2xl font-bold">{summary.totalErrors}</p>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-muted-foreground">By Type</p>
                <div className="text-sm mt-1">
                  {Object.entries(summary.errorsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-muted-foreground">By Severity</p>
                <div className="text-sm mt-1">
                  {Object.entries(summary.errorsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex justify-between">
                      <span>{severity}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border rounded p-3">
                <p className="text-sm text-muted-foreground">By MFE</p>
                <div className="text-sm mt-1">
                  {Object.entries(summary.errorsByMFE).map(([mfe, count]) => (
                    <div key={mfe} className="flex justify-between">
                      <span className="truncate">{mfe}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {errorReportVisible && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Error Details</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {errorReporter.getErrors().map((error) => (
                <div key={error.id} className="border rounded p-3 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{error.mfeName}</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${
                          error.severity === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : error.severity === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : error.severity === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {error.severity}
                      </span>
                      <span className="ml-2 text-muted-foreground">{error.type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {error.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="mt-1 text-red-600">{error.error.message}</p>
                  {error.context?.retryCount !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Retry count: {error.context.retryCount}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Features Overview */}
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Error Handling Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Error Boundaries</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Catches JavaScript errors in MFE component tree</li>
              <li>Prevents crashes from affecting other MFEs</li>
              <li>Provides fallback UI for graceful degradation</li>
              <li>Allows retry attempts for transient failures</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Error Reporting</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Centralized error collection and analysis</li>
              <li>Error throttling to prevent spam</li>
              <li>Severity classification (low, medium, high, critical)</li>
              <li>Session tracking and error context</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
