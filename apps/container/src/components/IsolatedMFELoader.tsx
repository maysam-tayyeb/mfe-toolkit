import React, { useEffect, useRef, useState } from 'react';
import { MFEServices } from '@mfe-toolkit/core';

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
  const cleanupRef = useRef<(() => void) | null>(null);

  // Use ref to avoid stale closure
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    let isMounted = true;

    const loadAndMountMFE = async () => {
      try {
        console.log(`[IsolatedMFELoader] Loading ${name} from ${url}`);

        // Import the MFE module
        const module = await import(/* @vite-ignore */ url);

        if (!module.default || typeof module.default.mount !== 'function') {
          throw new Error(`MFE ${name} does not export a valid module with mount function`);
        }

        // Only proceed if component is still mounted
        if (!isMounted) return;

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
            cleanupRef.current = () => {
              try {
                console.log(`[IsolatedMFELoader] Unmounting ${name}`);
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
        if (!isMounted) return;

        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error(`[IsolatedMFELoader] Error loading ${name}:`, error);
        setError(error);
        setLoading(false);
        onErrorRef.current?.(error);
      }
    };

    // Reset state when name/url changes
    setLoading(true);
    setError(null);

    // Cleanup previous MFE if any
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Delay loading slightly to ensure DOM is ready
    const timer = setTimeout(loadAndMountMFE, 100);

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timer);

      // Only cleanup if component is truly unmounting
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // Clean up the container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [name, url, services]); // Include services but it should be stable

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
