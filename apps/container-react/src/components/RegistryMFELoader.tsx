import React, { useEffect, useState, useMemo } from 'react';
import { MFELoader } from '@mfe-toolkit/react';
import { useRegistry } from '@/hooks/useRegistry';
import { getMFEServicesSingleton } from '@/services/mfe-services-singleton';
import type { ManifestV2 } from '@mfe-toolkit/core';

interface RegistryMFELoaderProps {
  id: string;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
  isolate?: boolean;
  errorBoundary?: boolean;
  errorFallback?: (error: Error, errorInfo: React.ErrorInfo, retry: () => void) => React.ReactNode;
}

export function RegistryMFELoader({ id, fallback, ...props }: RegistryMFELoaderProps) {
  const { registry, isLoading: registryLoading, error: registryError } = useRegistry();
  const services = useMemo(() => getMFEServicesSingleton(), []);
  const [manifest, setManifest] = useState<ManifestV2 | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!registryLoading && !registryError) {
      try {
        const mfe = registry.get(id);
        if (mfe) {
          setManifest(mfe);
          setError(null);
        } else {
          setError(new Error(`MFE with id "${id}" not found in registry`));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to get MFE "${id}" from registry`));
      }
    }
  }, [id, registry, registryLoading, registryError]);

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
    <MFELoader
      name={manifest.name}
      url={manifest.url}
      services={services}
      fallback={fallback}
      {...props}
    />
  );
}