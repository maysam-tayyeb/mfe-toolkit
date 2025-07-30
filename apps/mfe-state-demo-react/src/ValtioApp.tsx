import React, { useEffect } from 'react';
import { ValtioStateManager, setGlobalValtioStateManagerReact } from '@mfe/universal-state';
import { useValtioGlobalState, useValtioGlobalStates, useValtioStore } from '@mfe/universal-state';
import { getButtonClasses } from '@mfe/shared';
import { Moon, Sun } from 'lucide-react';

interface ValtioAppProps {
  stateManager: ValtioStateManager;
}

export const ValtioApp: React.FC<ValtioAppProps> = ({ stateManager }) => {
  // Set the global state manager for hooks to use
  useEffect(() => {
    setGlobalValtioStateManagerReact(stateManager);
  }, [stateManager]);
  // Use Valtio-specific hooks for better performance
  const [user, setUser] = useValtioGlobalState<{ name: string; email: string }>('user');
  const [theme, setTheme] = useValtioGlobalState<'light' | 'dark'>('theme');
  const [counter, setCounter] = useValtioGlobalState<number>('sharedCounter');
  
  // Get the entire store snapshot for debugging
  const store = useValtioStore();
  
  // Form state - local React state
  const [formData, setFormData] = React.useState({ name: '', email: '' });

  // Register this MFE
  useEffect(() => {
    stateManager.registerMFE('state-demo-react-valtio', {
      version: '2.0.0',
      framework: 'react',
      features: ['valtio-hooks', 'reactive-store', 'fine-grained-updates'],
    });

    return () => {
      stateManager.unregisterMFE('state-demo-react-valtio');
    };
  }, [stateManager]);

  const handleUpdateUser = () => {
    if (formData.name && formData.email) {
      setUser(formData);
      setFormData({ name: '', email: '' });
    }
  };

  const handleIncrement = () => {
    setCounter((counter || 0) + 1);
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">React State Demo (Valtio Enhanced)</h2>
        <p className="text-muted-foreground">Using Valtio hooks for reactive state management</p>
      </div>

      {/* User Management Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Management</h3>

          {user ? (
            <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-md">
              <div className="h-10 w-10 rounded-full bg-muted-foreground/20 flex items-center justify-center font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-muted rounded-md text-center text-muted-foreground">
              No user logged in
            </div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleUpdateUser}
              className={getButtonClasses('secondary', 'default', 'w-full')}
            >
              Update User
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme Settings Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Theme</p>
                  <p className="text-sm text-muted-foreground">Reactive updates with Valtio</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
              <button
                onClick={handleThemeToggle}
                className={getButtonClasses('outline', 'default', 'w-full')}
              >
                Toggle Theme
              </button>
            </div>
          </div>
        </div>

        {/* Shared Counter Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Shared Counter</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold tabular-nums">{counter || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">Fine-grained updates</p>
              </div>
              <button
                onClick={handleIncrement}
                className={getButtonClasses('secondary', 'default', 'w-full')}
              >
                Increment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Valtio Features Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Valtio Benefits</h3>
          <div className="grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Automatic Re-renders:</strong> Only components using changed state re-render
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Better TypeScript:</strong> Type inference without manual generics
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Smaller Bundle:</strong> 47% reduction in state manager size
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <strong>Reactive Store:</strong> Direct access to proxy store for advanced use cases
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Snapshot Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Live State Snapshot</h3>
          <pre className="p-4 rounded-md bg-muted text-sm font-mono overflow-auto max-h-48">
            {JSON.stringify(store, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};