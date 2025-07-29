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
  const [containerReady, setContainerReady] = useState(false);

  // Monitor when container ref becomes available
  useEffect(() => {
    if (containerRef.current && !containerReady) {
      console.log(`[SafeMFELoader] Container ref now ready for ${name}`);
      setContainerReady(true);
    }
  });

  useEffect(() => {
    // Skip if container not ready
    if (!containerReady) {
      console.log(`[SafeMFELoader] Waiting for container to be ready for ${name}`);
      return;
    }

    let mounted = true;

    const loadMFE = async () => {
      try {
        console.log(`[SafeMFELoader] Starting to load ${name} from ${url}`);
        console.log(`[SafeMFELoader] Container ref exists:`, !!containerRef.current);
        
        // Log the actual URL being loaded
        console.log(`[SafeMFELoader] Attempting dynamic import of: ${url}`);
        
        const module = await import(/* @vite-ignore */ url);
        console.log(`[SafeMFELoader] Module loaded for ${name}:`, module);
        
        if (!mounted) {
          console.log(`[SafeMFELoader] Component unmounted, cancelling load for ${name}`);
          return;
        }

        const mfeExport = module.default;
        console.log(`[SafeMFELoader] Default export for ${name}:`, mfeExport);
        console.log(`[SafeMFELoader] Type of default export:`, typeof mfeExport);
        console.log(`[SafeMFELoader] Has mount function:`, typeof mfeExport?.mount === 'function');
        
        if (!mfeExport || typeof mfeExport.mount !== 'function') {
          throw new Error(`MFE ${name} does not export a valid module with mount function`);
        }

        // Create a dedicated container for the MFE
        if (containerRef.current) {
          console.log(`[SafeMFELoader] Creating container for ${name}`);
          const mfeContainer = document.createElement('div');
          mfeContainer.style.width = '100%';
          mfeContainer.style.minHeight = '200px'; // Add min height for visibility
          mfeContainer.setAttribute('data-mfe', name); // Add attribute for debugging
          
          containerRef.current.appendChild(mfeContainer);
          console.log(`[SafeMFELoader] Container created and appended for ${name}`);
          
          // Mount the MFE
          console.log(`[SafeMFELoader] Mounting ${name} with services:`, services);
          console.log(`[SafeMFELoader] Services keys:`, Object.keys(services));
          console.log(`[SafeMFELoader] Services has stateManager:`, 'stateManager' in services);
          console.log(`[SafeMFELoader] stateManager value:`, services.stateManager);
          
          try {
            mfeExport.mount(mfeContainer, services);
            console.log(`[SafeMFELoader] ${name} mount function called successfully`);
            console.log(`[SafeMFELoader] MFE container innerHTML length:`, mfeContainer.innerHTML.length);
            console.log(`[SafeMFELoader] MFE container children count:`, mfeContainer.children.length);
            
            // Store the instance and container for cleanup
            mfeInstanceRef.current = {
              instance: mfeExport,
              container: mfeContainer
            };
            
            setLoading(false);
            console.log(`[SafeMFELoader] ${name} loading complete`);
          } catch (mountErr) {
            console.error(`[SafeMFELoader] Error during mount of ${name}:`, mountErr);
            console.error(`[SafeMFELoader] Mount error stack:`, mountErr.stack);
            throw mountErr;
          }
        } else {
          console.error(`[SafeMFELoader] Container ref is null for ${name}`);
        }
      } catch (err) {
        if (!mounted) {
          console.log(`[SafeMFELoader] Component unmounted during error handling for ${name}`);
          return;
        }
        
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`[SafeMFELoader] Error loading ${name}:`, error);
        console.error(`[SafeMFELoader] Error stack:`, error.stack);
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
  }, [name, url, services, onError, containerReady]);

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

  return <div ref={containerRef} style={{ width: '100%' }} />;
};