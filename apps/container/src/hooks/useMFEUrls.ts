import { useState, useEffect, useMemo } from 'react';
import { MFERegistryService } from '@mfe/dev-kit';
import { useRegistry } from './useRegistry';

export interface MFEUrls {
  [key: string]: string;
}

export interface UseMFEUrlsResult {
  urls: MFEUrls;
  isLoading: boolean;
  error: Error | null;
  getUrl: (mfeName: string) => string | undefined;
}

export interface UseMFEUrlsOptions {
  registry?: MFERegistryService;
  mfeNames?: string[];
}

// Hook that creates its own registry (use at top level only)
// Note: This hook is kept for backward compatibility, but prefer useMFEUrlsFromContext
// to avoid multiple registry instances
export function useMFEUrls(mfeNames?: string[]): UseMFEUrlsResult {
  const { registry, isLoading, error } = useRegistry();
  
  const result = useMFEUrlsWithRegistry({ registry, mfeNames });
  
  // Override loading and error states from registry
  return {
    ...result,
    isLoading,
    error,
  };
}

// Hook that uses provided registry (use in nested components)
export function useMFEUrlsWithRegistry(options: UseMFEUrlsOptions): UseMFEUrlsResult {
  const { registry, mfeNames } = options;
  const [urls, setUrls] = useState<MFEUrls>({});
  
  // Create stable reference for mfeNames
  const stableMfeNames = useMemo(() => mfeNames, [JSON.stringify(mfeNames)]);

  useEffect(() => {
    if (!registry) {
      setUrls({});
      return;
    }

    const newUrls: MFEUrls = {};
    
    if (stableMfeNames) {
      // Get specific MFEs
      stableMfeNames.forEach(name => {
        const mfe = registry.get(name);
        if (mfe) {
          newUrls[name] = mfe.url;
        }
      });
    } else {
      // Get all MFEs
      const allMfes = registry.getAll();
      Object.entries(allMfes).forEach(([name, mfe]) => {
        newUrls[name] = mfe.url;
      });
    }
    
    setUrls(newUrls);
  }, [registry, stableMfeNames]);

  const getUrl = (mfeName: string) => urls[mfeName];

  return {
    urls,
    isLoading: false,
    error: null,
    getUrl,
  };
}