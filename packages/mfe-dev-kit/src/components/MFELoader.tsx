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

        console.log('Loading MFE from URL:', url);
        const mfeModule = await import(/* @vite-ignore */ url);
        console.log('MFE module loaded:', mfeModule);
        
        const mfe = mfeModule.default as MFEModule;
        console.log('MFE default export:', mfe);
        
        if (!mfe || typeof mfe.mount !== 'function') {
          throw new Error(`MFE ${name} does not export a valid module with mount function`);
        }

        mfeRef.current = mfe;
        
        // Wait for container to be ready, then mount
        setTimeout(() => {
          if (containerRef.current && mfeRef.current) {
            console.log('Mounting MFE to container element');
            try {
              mfeRef.current.mount(containerRef.current, services);
              setLoading(false);
              console.log('MFE mounted successfully');
            } catch (mountError) {
              console.error('Error mounting MFE:', mountError);
              setError(new Error(`Failed to mount MFE: ${mountError}`));
              setLoading(false);
            }
          } else {
            console.error('Container or MFE not ready for mounting');
            setError(new Error('Container or MFE not ready for mounting'));
            setLoading(false);
          }
        }, 100);
        
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
      mfeRef.current = null;
    };
  }, [name, url, services]);

  if (error) {
    return (
      <div className="mfe-error p-4 bg-red-50 border border-red-200 rounded" data-testid="mfe-error">
        <h3 className="text-red-800 font-semibold">Failed to load MFE: {name}</h3>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mfe-container">
      {loading && fallback}
    </div>
  );
};
