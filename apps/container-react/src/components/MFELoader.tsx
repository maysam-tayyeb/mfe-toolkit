import React, { useEffect, useState } from 'react';
import { MFELoader as CoreMFELoader, MFEErrorBoundary } from '@mfe-toolkit/react';
import { useRegistry } from '@/hooks/useRegistry';
import { useServices } from '@/contexts/ServiceContext';
import { compatibilityChecker } from '@/services/compatibility-checker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { MFEManifest } from '@mfe-toolkit/core';

interface MFELoaderProps {
  name: string;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
  isolate?: boolean;
  errorBoundary?: boolean;
  errorFallback?: (error: Error, errorInfo: React.ErrorInfo, retry: () => void) => React.ReactNode;
  forceLoad?: boolean;
}

export function MFELoader({ 
  name, 
  fallback, 
  forceLoad = false,
  ...props 
}: MFELoaderProps) {
  const { registry, isLoading: registryLoading, error: registryError } = useRegistry();
  const serviceContainer = useServices();
  const [manifest, setManifest] = useState<MFEManifest | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [userAcceptedRisk, setUserAcceptedRisk] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<{
    compatible: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  useEffect(() => {
    if (!registryLoading && !registryError) {
      try {
        const mfe = registry.get(name);
        if (mfe) {
          setManifest(mfe);
          setError(null);
          // Check compatibility
          const result = compatibilityChecker.checkCompatibility(mfe);
          setCompatibilityResult(result);
        } else {
          setError(new Error(`MFE with name "${name}" not found in registry`));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error(`Failed to get MFE "${name}" from registry`)
        );
      }
    }
  }, [name, registry, registryLoading, registryError]);

  // Reset user acceptance when MFE changes
  useEffect(() => {
    setUserAcceptedRisk(false);
  }, [name]);

  if (registryLoading) {
    return <>{fallback || <div>Loading registry...</div>}</>;
  }

  if (registryError || error) {
    const displayError = registryError || error;
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-red-800 font-semibold">Failed to load MFE</h3>
        <p className="text-red-600 text-sm mt-1">{displayError?.message}</p>
      </div>
    );
  }

  if (!manifest) {
    return <>{fallback || <div>Loading MFE configuration...</div>}</>;
  }

  // Show compatibility errors if incompatible and not forced
  if (compatibilityResult && !compatibilityResult.compatible && !forceLoad && !userAcceptedRisk) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>MFE Compatibility Error: {manifest.name}</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p>This MFE is not compatible with the current container:</p>
              <ul className="list-disc list-inside space-y-1">
                {compatibilityResult.errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
              {import.meta.env.DEV && (
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => setUserAcceptedRisk(true)}>
                    Load Anyway (Development Only)
                  </Button>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show warnings if any
  const showWarnings = compatibilityResult && compatibilityResult.warnings.length > 0;

  return (
    <div>
      {showWarnings && (
        <Alert className="mb-2">
          <AlertTitle>Compatibility Warnings</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {compatibilityResult!.warnings.map((warning, index) => (
                <li key={index} className="text-sm">
                  {warning}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <MFEErrorBoundary mfeName={manifest.name} services={serviceContainer} onError={props.onError}>
        <CoreMFELoader
          name={manifest.name}
          url={manifest.url}
          serviceContainer={serviceContainer}
          fallback={fallback}
          isolate={true}
          {...props}
        />
      </MFEErrorBoundary>
    </div>
  );
}