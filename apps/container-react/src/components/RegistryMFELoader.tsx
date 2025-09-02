import React, { useEffect, useState } from 'react';
import { MFELoader, MFEErrorBoundary } from '@mfe-toolkit/react';
import { useRegistry } from '@/hooks/useRegistry';
import { useServices } from '@/contexts/ServiceContext';
import type { MFEManifest } from '@mfe-toolkit/core';

interface RegistryMFELoaderProps {
  name: string;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
  isolate?: boolean;
  errorBoundary?: boolean;
  errorFallback?: (error: Error, errorInfo: React.ErrorInfo, retry: () => void) => React.ReactNode;
}

export function RegistryMFELoader({ name, fallback, ...props }: RegistryMFELoaderProps) {
  const { registry, isLoading: registryLoading, error: registryError } = useRegistry();
  const serviceContainer = useServices();
  const [manifest, setManifest] = useState<MFEManifest | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!registryLoading && !registryError) {
      try {
        const mfe = registry.get(name);
        if (mfe) {
          setManifest(mfe);
          setError(null);
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

  return (
    <MFEErrorBoundary mfeName={manifest.name} services={serviceContainer} onError={props.onError}>
      <MFELoader
        name={manifest.name}
        url={manifest.url}
        serviceContainer={serviceContainer}
        fallback={fallback}
        isolate={true}
        {...props}
      />
    </MFEErrorBoundary>
  );
}
