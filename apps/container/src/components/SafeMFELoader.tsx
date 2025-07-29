import React, { useEffect, useRef, useState } from 'react';
import { MFEServices } from '@mfe/dev-kit';

interface SafeMFELoaderProps {
  name: string;
  url: string;
  services: MFEServices;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export const SafeMFELoader: React.FC<SafeMFELoaderProps> = ({
  name,
  url,
  services,
  fallback = <div>Loading MFE...</div>,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mfeInstanceRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadMFE = async () => {
      try {
        console.log(`[SafeMFELoader] Loading ${name} from ${url}`);
        const module = await import(/* @vite-ignore */ url);
        
        if (!mounted) return;

        const mfeExport = module.default;
        if (!mfeExport || typeof mfeExport.mount !== 'function') {
          throw new Error(`MFE ${name} does not export a valid module`);
        }

        // Create a dedicated container for the MFE
        if (containerRef.current) {
          const mfeContainer = document.createElement('div');
          mfeContainer.style.width = '100%';
          containerRef.current.appendChild(mfeContainer);
          
          // Mount the MFE
          console.log(`[SafeMFELoader] Mounting ${name} with services:`, services);
          console.log(`[SafeMFELoader] Services has stateManager:`, 'stateManager' in services);
          
          try {
            mfeExport.mount(mfeContainer, services);
            console.log(`[SafeMFELoader] ${name} mounted successfully`);
            
            // Store the instance and container for cleanup
            mfeInstanceRef.current = {
              instance: mfeExport,
              container: mfeContainer
            };
            
            setLoading(false);
          } catch (mountErr) {
            console.error(`[SafeMFELoader] Error during mount of ${name}:`, mountErr);
            throw mountErr;
          }
        }
      } catch (err) {
        if (!mounted) return;
        
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`[SafeMFELoader] Error loading ${name}:`, error);
        setError(error);
        setLoading(false);
        onError?.(error);
      }
    };

    loadMFE();

    return () => {
      mounted = false;
      
      // Clean up the MFE
      if (mfeInstanceRef.current) {
        const { instance, container } = mfeInstanceRef.current;
        
        try {
          console.log(`[SafeMFELoader] Unmounting ${name}`);
          if (instance.unmount) {
            instance.unmount(container);
          }
          
          // Remove the container from DOM
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        } catch (err) {
          console.error(`[SafeMFELoader] Error unmounting ${name}:`, err);
        }
        
        mfeInstanceRef.current = null;
      }
    };
  }, [name, url, services, onError]);

  if (error) {
    return (
      <div className="text-red-500 p-4">
        <h3>Error loading {name}</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  if (loading) {
    return <>{fallback}</>;
  }

  return <div ref={containerRef} />;
};