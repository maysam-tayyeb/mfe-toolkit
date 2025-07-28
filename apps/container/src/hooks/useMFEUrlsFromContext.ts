import { useMemo } from 'react';
import { useMFEUrlsWithRegistry, UseMFEUrlsResult } from './useMFEUrls';
import { useRegistryContext } from '@/contexts/RegistryContext';

/**
 * Hook that uses the registry from context instead of creating a new one.
 * This prevents multiple registry instances and infinite re-renders.
 */
export function useMFEUrlsFromContext(mfeNames?: string[]): UseMFEUrlsResult {
  const { registry, isLoading, error } = useRegistryContext();
  
  // Use the existing useMFEUrlsWithRegistry hook with the context registry
  const result = useMFEUrlsWithRegistry({ registry, mfeNames });
  
  // Override loading and error states from context
  return useMemo(() => ({
    ...result,
    isLoading,
    error,
  }), [result, isLoading, error]);
}