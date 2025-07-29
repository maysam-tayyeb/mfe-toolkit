import React, { useState, useEffect, useCallback } from 'react';
import { StateManager } from '@mfe/universal-state';

interface AppProps {
  stateManager: StateManager;
}

export const App: React.FC<AppProps> = ({ stateManager }) => {
  // Local state that syncs with global state
  const [user, setLocalUser] = useState<{ name: string; email: string } | undefined>();
  const [theme, setLocalTheme] = useState<'light' | 'dark'>('light');
  const [counter, setLocalCounter] = useState<number>(0);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  // Subscribe to state changes
  useEffect(() => {
    // Initial values
    setLocalUser(stateManager.get('user'));
    setLocalTheme(stateManager.get('theme') || 'light');
    setLocalCounter(stateManager.get('sharedCounter') || 0);
    
    // Subscribe to changes
    const unsubUser = stateManager.subscribe('user', (value) => {
      setLocalUser(value);
    });
    
    const unsubTheme = stateManager.subscribe('theme', (value) => {
      setLocalTheme(value || 'light');
    });
    
    const unsubCounter = stateManager.subscribe('sharedCounter', (value) => {
      setLocalCounter(value || 0);
    });
    
    // Register this MFE
    stateManager.registerMFE('state-demo-react', {
      version: '1.0.0',
      framework: 'react',
      features: ['user-management', 'theme-switcher', 'counter']
    });
    
    // Cleanup
    return () => {
      unsubUser();
      unsubTheme();
      unsubCounter();
      stateManager.unregisterMFE('state-demo-react');
    };
  }, [stateManager]);
  
  // Log all state changes
  useEffect(() => {
    const unsub = stateManager.subscribeAll((event) => {
      console.log(`[React MFE] State changed: ${event.key} =`, event.value);
    });
    return unsub;
  }, [stateManager]);
  
  const handleUpdateUser = useCallback(() => {
    if (formData.name && formData.email) {
      stateManager.set('user', formData, 'state-demo-react');
      setFormData({ name: '', email: '' });
    }
  }, [formData, stateManager]);
  
  const handleIncrement = useCallback(() => {
    stateManager.set('sharedCounter', counter + 1, 'state-demo-react');
  }, [counter, stateManager]);
  
  const handleThemeToggle = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    stateManager.set('theme', newTheme, 'state-demo-react');
  }, [theme, stateManager]);
  
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">React State Demo</h2>
        <p className="text-muted-foreground">Demonstrating cross-framework state synchronization</p>
      </div>
      
      {/* User Management Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">User Management</h3>
          
          {user ? (
            <div className="flex items-center gap-3 mb-4 p-3 bg-muted rounded-md">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
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
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
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
                  <p className="text-sm text-muted-foreground">Applies to all MFEs</p>
                </div>
                <div className="text-2xl">
                  {theme === 'dark' ? '🌙' : '☀️'}
                </div>
              </div>
              <button
                onClick={handleThemeToggle}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
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
                <div className="text-4xl font-bold tabular-nums">{counter}</div>
                <p className="text-sm text-muted-foreground mt-1">Synchronized value</p>
              </div>
              <button
                onClick={handleIncrement}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
              >
                Increment
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* State Snapshot Card */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">State Snapshot</h3>
          <pre className="p-4 rounded-md bg-muted text-sm font-mono overflow-auto max-h-48">
{JSON.stringify(stateManager.getSnapshot(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};