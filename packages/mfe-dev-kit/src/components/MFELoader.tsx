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

        // Check if script already exists
        const existingScript = document.querySelector(`script[data-mfe="${name}"]`);
        if (existingScript) {
          existingScript.remove();
        }

        // Create and load script
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.setAttribute('data-mfe', name);

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load MFE script: ${url}`));
          document.body.appendChild(script);
        });

        // Wait for MFE to register itself
        const mfeWindow = window as MFEWindow;
        const checkMFE = () => {
          return new Promise<MFEModule>((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds

            const interval = setInterval(() => {
              if (mfeWindow[name]) {
                clearInterval(interval);
                resolve(mfeWindow[name] as MFEModule);
              } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                reject(new Error(`MFE ${name} did not register within timeout`));
              }
              attempts++;
            }, 100);
          });
        };

        const mfe = await checkMFE();
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

      // Remove script
      const script = document.querySelector(`script[data-mfe="${name}"]`);
      if (script) {
        script.remove();
      }

      // Clean up window reference
      const mfeWindow = window as MFEWindow;
      delete mfeWindow[name];
    };
  }, [name, url]);

  if (error) {
    return (
      <div className="mfe-error p-4 bg-red-50 border border-red-200 rounded">
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
