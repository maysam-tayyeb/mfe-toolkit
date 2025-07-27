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
  const mountedRef = useRef<boolean>(false);
  const loadingRef = useRef<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const loadMFE = async () => {
      // Prevent concurrent loads
      if (loadingRef.current) {
        console.log('MFE is already loading, skipping duplicate load');
        return;
      }

      // If already mounted, skip loading
      if (mountedRef.current && mfeRef.current) {
        console.log('MFE is already mounted, skipping load');
        return;
      }

      loadingRef.current = true;

      try {
        setLoading(true);
        setError(null);

        // Set services on window for MFE to access
        (window as MFEWindow).__MFE_SERVICES__ = services;

        console.log('Loading MFE from URL:', url);
        const mfeModule = await import(/* @vite-ignore */ url);

        // Check if cancelled during async operation
        if (cancelled) {
          console.log('MFE load cancelled');
          return;
        }

        console.log('MFE module loaded:', mfeModule);

        const mfe = mfeModule.default as MFEModule;
        console.log('MFE default export:', mfe);

        if (!mfe || typeof mfe.mount !== 'function') {
          throw new Error(`MFE ${name} does not export a valid module with mount function`);
        }

        mfeRef.current = mfe;

        // Wait for container to be ready, then mount
        setTimeout(() => {
          if (cancelled) {
            console.log('MFE mount cancelled');
            return;
          }

          if (containerRef.current && mfeRef.current && !mountedRef.current) {
            console.log('Mounting MFE to container element');
            try {
              mfeRef.current.mount(containerRef.current, services);
              mountedRef.current = true;
              setLoading(false);
              console.log('MFE mounted successfully');
            } catch (mountError) {
              console.error('Error mounting MFE:', mountError);
              setError(new Error(`Failed to mount MFE: ${mountError}`));
              setLoading(false);
            }
          } else if (mountedRef.current) {
            console.log('MFE already mounted, skipping');
            setLoading(false);
          } else {
            console.error('Container or MFE not ready for mounting');
            setError(new Error('Container or MFE not ready for mounting'));
            setLoading(false);
          }

          loadingRef.current = false;
        }, 100);
      } catch (err) {
        if (cancelled) {
          console.log('MFE load error handling cancelled');
          return;
        }

        const error = err instanceof Error ? err : new Error('Unknown error loading MFE');
        setError(error);
        setLoading(false);
        loadingRef.current = false;
        if (onError) {
          onError(error);
        }
      }
    };

    loadMFE();

    // Cleanup
    return () => {
      cancelled = true;

      if (mfeRef.current && mfeRef.current.unmount && mountedRef.current) {
        try {
          console.log('Unmounting MFE');
          mfeRef.current.unmount();
          mountedRef.current = false;
        } catch (err) {
          console.error('Error unmounting MFE:', err);
        }
      }
      mfeRef.current = null;
      loadingRef.current = false;
    };
  }, [name, url]);

  if (error) {
    return (
      <div
        className="mfe-error p-4 bg-red-50 border border-red-200 rounded"
        data-testid="mfe-error"
      >
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
