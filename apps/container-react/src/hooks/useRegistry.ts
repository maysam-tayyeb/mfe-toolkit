import { useState, useEffect } from 'react';
import { createLogger } from '@mfe-toolkit/core';
import { getRegistrySingleton } from '@/services/registry-singleton';

const logger = createLogger('useRegistry');

export interface UseRegistryOptions {
  loadOnMount?: boolean;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
}

export interface UseRegistryResult {
  registry: ReturnType<typeof getRegistrySingleton>;
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

export function useRegistry(options: UseRegistryOptions = {}): UseRegistryResult {
  const {
    loadOnMount = true,
    onLoadSuccess,
    onLoadError,
  } = options;

  // Always use singleton registry
  const registry = getRegistrySingleton();

  const [isLoading, setIsLoading] = useState(loadOnMount);
  const [error, setError] = useState<Error | null>(null);

  const loadRegistry = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await registry.loadFromUrl();
      onLoadSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load registry');
      logger.error('Failed to load MFE registry:', error);
      setError(error);
      onLoadError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loadOnMount) {
      loadRegistry();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    registry,
    isLoading,
    error,
    reload: loadRegistry,
  };
}
