import React, { useEffect, useRef, useState } from 'react';
import { MFEServices } from '@mfe/dev-kit';

interface IsolatedMFELoaderProps {
  name: string;
  url: string;
  services: MFEServices;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export const IsolatedMFELoader: React.FC<IsolatedMFELoaderProps> = ({
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
    let cleanup: (() => void) | null = null;

    const loadAndMountMFE = async () => {
      try {
        console.log(`[IsolatedMFELoader] Loading ${name} from ${url}`);
        
        // Import the MFE module
        const module = await import(/* @vite-ignore */ url);
        
        if (!module.default || typeof module.default.mount !== 'function') {
          throw new Error(`MFE ${name} does not export a valid module with mount function`);
        }

        // Create an isolated container for the MFE
        const mfeContainer = document.createElement('div');
        mfeContainer.style.width = '100%';
        mfeContainer.setAttribute('data-mfe', name);
        mfeContainer.setAttribute('data-react-root', 'false'); // Mark as non-React content
        
        // Wait for our container to be ready
        if (containerRef.current) {
          // Clear any existing content
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(mfeContainer);
          
          console.log(`[IsolatedMFELoader] Mounting ${name}`);
          module.default.mount(mfeContainer, services);
          mfeInstanceRef.current = module.default;
          
          // Store cleanup function
          if (module.default.unmount) {
            cleanup = () => {
              try {
                module.default.unmount(mfeContainer);
              } catch (err) {
                console.error(`Error unmounting ${name}:`, err);
              }
            };
          }
          
          setLoading(false);
          console.log(`[IsolatedMFELoader] ${name} mounted successfully`);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`[IsolatedMFELoader] Error loading ${name}:`, error);
        setError(error);
        setLoading(false);
        onError?.(error);
      }
    };

    // Delay loading slightly to ensure DOM is ready
    const timer = setTimeout(loadAndMountMFE, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (cleanup) {
        cleanup();
      }
      // Clean up the container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [name, url]); // Only depend on name and url to prevent remounting

  if (error) {
    return (
      <div className="text-red-500 p-4">
        <h3>Error loading {name}</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <>
      {loading && fallback}
      <div 
        ref={containerRef} 
        style={{ width: '100%', display: loading ? 'none' : 'block' }}
        // Prevent React from touching this div's children
        suppressHydrationWarning
      />
    </>
  );
};