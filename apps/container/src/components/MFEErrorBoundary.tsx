import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface MFEErrorBoundaryProps {
  mfeName: string;
  children: React.ReactNode;
}

export const MFEErrorBoundary: React.FC<MFEErrorBoundaryProps> = ({ mfeName, children }) => {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo) => (
        <div className="p-4 border border-orange-500 rounded-lg bg-orange-50 dark:bg-orange-900/20">
          <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400 mb-2">
            Failed to load {mfeName}
          </h3>
          <p className="text-sm text-orange-600 dark:text-orange-300 mb-2">
            The microfrontend encountered an error while loading.
          </p>
          <details className="cursor-pointer">
            <summary className="text-sm text-orange-600 dark:text-orange-300">
              Technical details
            </summary>
            <pre className="mt-2 text-xs overflow-auto p-2 bg-orange-100 dark:bg-orange-900/30 rounded">
              {error.toString()}
              {errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};