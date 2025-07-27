import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '@/store/modalSlice';
import { addNotification } from '@/store/notificationSlice';
import { RootState } from '@/store';
import { EVENTS } from '@mfe/shared';
import { EventBusImpl, EventPayload } from '@mfe/dev-kit';

interface MFEStatus {
  name: string;
  version: string;
  loadTime: number;
  status: 'loaded' | 'loading' | 'error';
  lastEvent?: string;
}

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [mfeStatuses, setMfeStatuses] = useState<Record<string, MFEStatus>>({});
  const [eventCount, setEventCount] = useState(0);
  const [eventBus] = useState(() => new EventBusImpl());

  useEffect(() => {
    // Listen for MFE events
    const unsubscribes = [
      eventBus.on(EVENTS.MFE_LOADED, (payload: EventPayload<{ name: string; version: string }>) => {
        const { name, version } = payload.data;
        setMfeStatuses((prev) => ({
          ...prev,
          [name]: {
            name,
            version,
            loadTime: Date.now(),
            status: 'loaded',
            lastEvent: 'loaded',
          },
        }));
        setEventCount((prev) => prev + 1);
      }),
      eventBus.on(EVENTS.MFE_UNLOADED, (payload: EventPayload<{ name: string }>) => {
        const { name } = payload.data;
        setMfeStatuses((prev) => {
          const newStatuses = { ...prev };
          delete newStatuses[name];
          return newStatuses;
        });
        setEventCount((prev) => prev + 1);
      }),
    ];

    // Store event bus on window for MFEs
    (window as any).__EVENT_BUS__ = eventBus;

    return () => {
      unsubscribes.forEach((fn) => fn());
    };
  }, [eventBus]);

  const handleTestModal = () => {
    dispatch(
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
              <h3 className="font-medium">Active MFEs</h3>
              {Object.keys(mfeStatuses).length > 0 ? (
                <ul className="text-sm space-y-1">
                  {Object.values(mfeStatuses).map((mfe) => (
                    <li key={mfe.name} className="flex justify-between">
                      <span>
                        {mfe.name} v{mfe.version}
                      </span>
                      <span>Active</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No MFEs currently loaded</p>
              )}
            </div>
          </div>
        ),
        size: 'md',
      })
    );
  };

  const handleClearCache = () => {
    dispatch(
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
          dispatch(
            addNotification({
              type: 'success',
              title: 'Cache Cleared',
              message: 'All platform caches have been successfully cleared.',
            })
          );
        },
      })
    );
  };

  const handleReloadRegistry = () => {
    dispatch(
      addNotification({
        type: 'info',
        title: 'Registry Reloading',
        message: 'Refreshing MFE registry...',
      })
    );

    // Simulate registry reload
    setTimeout(() => {
      dispatch(
        addNotification({
          type: 'success',
          title: 'Registry Updated',
          message: 'MFE registry has been successfully reloaded.',
        })
      );
    }, 1500);
  };

  const handleViewEventLog = () => {
    dispatch(
      openModal({
        title: 'Platform Event Log',
        content: (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Total events: {eventCount}</p>
              <Button size="sm" variant="outline" onClick={() => setEventCount(0)}>
                Clear Log
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <div className="p-2 bg-muted rounded text-sm">
                <span className="text-muted-foreground">10:45:23</span> - Platform initialized
              </div>
              <div className="p-2 bg-muted rounded text-sm">
                <span className="text-muted-foreground">10:45:24</span> - Auth service ready
              </div>
              {Object.values(mfeStatuses).map((mfe) => (
                <div key={mfe.name} className="p-2 bg-muted rounded text-sm">
                  <span className="text-muted-foreground">
                    {new Date(mfe.loadTime).toLocaleTimeString()}
                  </span>{' '}
                  - MFE "{mfe.name}" loaded
                </div>
              ))}
            </div>
          </div>
        ),
        size: 'lg',
      })
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-muted-foreground mt-2">Monitor and manage your microfrontend platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Active MFEs</p>
          <p className="text-2xl font-bold">{Object.keys(mfeStatuses).length}</p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Platform Status</p>
          <p className="text-2xl font-bold">Healthy</p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Total Events</p>
          <p className="text-2xl font-bold">{eventCount}</p>
        </div>
        <div className="border rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Active User</p>
          <p className="text-2xl font-bold">{auth.session?.username || 'Guest'}</p>
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
            <Button variant="secondary" size="sm" onClick={handleViewEventLog}>
              View Event Log
            </Button>
          </div>
        </div>

        {/* Active MFEs */}
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Active MFEs</h2>
          {Object.keys(mfeStatuses).length > 0 ? (
            <div className="space-y-2">
              {Object.values(mfeStatuses).map((mfe) => (
                <div key={mfe.name} className="p-3 bg-muted rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{mfe.name}</p>
                      <p className="text-xs text-muted-foreground">v{mfe.version}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{mfe.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No MFEs are currently loaded. Navigate to an MFE page to load it.
            </p>
          )}
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
            <p className="font-medium">React 19, Redux Toolkit, TailwindCSS</p>
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
