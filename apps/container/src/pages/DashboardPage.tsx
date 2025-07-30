import React from 'react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/contexts/UIContext';

export const DashboardPage: React.FC = () => {
  const { openModal, addNotification } = useUI();

  const handleTestModal = () => {
    openModal({
      title: 'Platform Health Check',
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">System Status</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Platform:</span>
              <span>Operational</span>
              <span className="text-muted-foreground">Services:</span>
              <span>All Active</span>
              <span className="text-muted-foreground">Memory Usage:</span>
              <span>~45MB</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Platform Info</h3>
            <p className="text-sm text-muted-foreground">
              For detailed MFE status and event monitoring, visit the MFE Communication page.
            </p>
          </div>
        </div>
      ),
      size: 'md',
    });
  };

  const handleClearCache = () => {
    openModal({
      title: 'Clear Platform Cache',
      content: (
        <div className="space-y-2">
          <p>This will clear all cached data including:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            <li>MFE module cache</li>
            <li>Service worker cache</li>
            <li>Local storage data</li>
          </ul>
          <p className="text-sm text-warning mt-2">This action cannot be undone.</p>
        </div>
      ),
      size: 'md',
      onConfirm: () => {
        // Simulate cache clearing
        localStorage.clear();
        sessionStorage.clear();
        addNotification({
          type: 'success',
          title: 'Cache Cleared',
          message: 'All platform caches have been successfully cleared.',
        });
      },
    });
  };

  const handleReloadRegistry = () => {
    addNotification({
      type: 'info',
      title: 'Registry Reloading',
      message: 'Refreshing MFE registry...',
    });

    // Simulate registry reload
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Registry Updated',
        message: 'MFE registry has been successfully reloaded.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-muted-foreground mt-2">Monitor and manage your microfrontend platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Platform Status</p>
          <p className="text-2xl font-bold">Healthy</p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Services</p>
          <p className="text-2xl font-bold">Active</p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Environment</p>
          <p className="text-2xl font-bold">Development</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Health */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">System Health</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Container App</span>
              <span className="text-sm font-medium">Running</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Event Bus</span>
              <span className="text-sm font-medium">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Auth Service</span>
              <span className="text-sm font-medium">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Modal Service</span>
              <span className="text-sm font-medium">Ready</span>
            </div>
          </div>
          <Button onClick={handleTestModal} size="sm">
            View Full Status
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="sm" onClick={handleReloadRegistry}>
              Reload MFE Registry
            </Button>
            <Button variant="secondary" size="sm" onClick={handleClearCache}>
              Clear Cache
            </Button>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Platform Overview</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This platform supports dynamic loading of microfrontends with shared services and
              real-time communication.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">• Event-driven architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">• Shared dependencies (React, Redux)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">• Cross-version React support</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = '/mfe-communication')}
            >
              View MFE Communication
            </Button>
          </div>
        </div>
      </div>

      {/* Platform Info */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Platform Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Version:</span>
            <p className="font-medium">1.0.0</p>
          </div>
          <div>
            <span className="text-muted-foreground">Environment:</span>
            <p className="font-medium">Development</p>
          </div>
          <div>
            <span className="text-muted-foreground">Module Format:</span>
            <p className="font-medium">ES Modules</p>
          </div>
          <div>
            <span className="text-muted-foreground">Shared Dependencies:</span>
            <p className="font-medium">React 19, TailwindCSS</p>
          </div>
          <div>
            <span className="text-muted-foreground">Container Port:</span>
            <p className="font-medium">3000</p>
          </div>
          <div>
            <span className="text-muted-foreground">Registry Type:</span>
            <p className="font-medium">In-Memory</p>
          </div>
        </div>
      </div>
    </div>
  );
};
