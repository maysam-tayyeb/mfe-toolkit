import React, { useEffect, useRef, useState } from 'react';
import { MFEServices, MFEWindow, MFEModule } from '../types';

interface MFELoaderProps {
  name: string;
  url: string;
  services: MFEServices;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export const MFELoader: React.FC<MFELoaderProps> = ({
  name,
  url,
  services,
  fallback = <div>Loading MFE...</div>,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mfeRef = useRef<MFEModule | null>(null);

  useEffect(() => {
    const loadMFE = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set services on window for MFE to access
        (window as MFEWindow).__MFE_SERVICES__ = services;

        // Use dynamic import to load the MFE ES module
        const mfeModule = await import(/* @vite-ignore */ url);
        
        // The MFE should export a default object with mount/unmount methods
        const mfe = mfeModule.default as MFEModule;
        
        if (!mfe || typeof mfe.mount !== 'function') {
          throw new Error(`MFE ${name} does not export a valid module with mount function`);
        }

        mfeRef.current = mfe;

        // Mount MFE
        if (containerRef.current && mfe.mount) {
          mfe.mount(containerRef.current, services);
        }

        setLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error loading MFE');
        setError(error);
        setLoading(false);
        if (onError) {
          onError(error);
        }
      }
    };

    loadMFE();

    // Cleanup
    return () => {
      if (mfeRef.current && mfeRef.current.unmount) {
        try {
          mfeRef.current.unmount();
        } catch (err) {
          console.error('Error unmounting MFE:', err);
        }
      }
    };
  }, [name, url]);

  if (error) {
    return (
      <div className="mfe-error p-4 bg-red-50 border border-red-200 rounded" data-testid="mfe-error">
        <h3 className="text-red-800 font-semibold">Failed to load MFE: {name}</h3>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (loading) {
    return <>{fallback}</>;
  }

  return <div ref={containerRef} className="mfe-container" />;
};
