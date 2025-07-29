import React, { useEffect, useRef, useState } from 'react';
import { MFEServices } from '@mfe/dev-kit';

interface SimpleMFELoaderProps {
  name: string;
  url: string;
  services: MFEServices;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export const SimpleMFELoader: React.FC<SimpleMFELoaderProps> = ({
  name,
  url,
  services,
  fallback = <div>Loading MFE...</div>,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const loadAndMountMFE = async () => {
      try {
        console.log(`[SimpleMFELoader] Loading ${name} from ${url}`);
        
        // Import the MFE module
        const module = await import(/* @vite-ignore */ url);
        
        if (!module.default || typeof module.default.mount !== 'function') {
          throw new Error(`MFE ${name} does not export a valid module with mount function`);
        }

        // Wait a tick to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 0));

        // Mount the MFE if we have a container
        if (containerRef.current && !mountedRef.current) {
          console.log(`[SimpleMFELoader] Mounting ${name}`);
          module.default.mount(containerRef.current, services);
          mountedRef.current = true;
          
          // Store cleanup function
          if (module.default.unmount) {
            cleanup = () => {
              if (containerRef.current) {
                module.default.unmount(containerRef.current);
              }
            };
          }
          
          setLoading(false);
          console.log(`[SimpleMFELoader] ${name} mounted successfully`);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`[SimpleMFELoader] Error loading ${name}:`, error);
        setError(error);
        setLoading(false);
        onError?.(error);
      }
    };

    loadAndMountMFE();

    // Cleanup
    return () => {
      if (cleanup) {
        cleanup();
      }
      mountedRef.current = false;
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

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {loading && fallback}
    </div>
  );
};