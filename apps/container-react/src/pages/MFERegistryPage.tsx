import React from 'react';
import { useRegistry } from '@/hooks/useRegistry';
import { MetricCard, EmptyState } from '@mfe/design-system-react';
import { Package, CheckCircle, AlertCircle } from 'lucide-react';

export const MFERegistryPage: React.FC = () => {
  const { registry, isLoading } = useRegistry();
  const mfes = registry.getAll();
  const mfeCount = Object.keys(mfes).length;

  if (isLoading) {
    return (
      <div className="ds-page">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-page">
      <div className="ds-section">
        <h1 className="ds-page-title">MFE Registry</h1>
        <p className="ds-text-muted">Manage and monitor registered microfrontends</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total MFEs"
          value={mfeCount.toString()}
          icon={<Package className="h-5 w-5" />}
          trend={mfeCount > 0 ? 'up' : undefined}
        />
        <MetricCard
          title="Active"
          value="0"
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <MetricCard
          title="Errors"
          value="0"
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      {mfeCount === 0 ? (
        <EmptyState
          title="No MFEs Registered"
          description="Start by registering your first microfrontend in the registry"
          icon={<Package className="h-12 w-12" />}
        />
      ) : (
        <div className="ds-card-padded">
          <h2 className="ds-section-title mb-4">Registered MFEs</h2>
          <div className="space-y-2">
            {Object.entries(mfes).map(([name, manifest]) => (
              <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Version {(manifest as any).version || '1.0.0'}
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};