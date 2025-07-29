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
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">⚛️ React State Demo</h2>
        <p className="text-muted-foreground mt-2">This MFE demonstrates framework-agnostic state management.</p>
      </div>
      
      {/* User Management Section */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <div className="bg-muted/50 rounded-lg p-4">
          {user ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">Current User:</p>
              <p className="text-sm text-muted-foreground">Name: {user.name}</p>
              <p className="text-sm text-muted-foreground">Email: {user.email}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No user logged in</p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm flex-1 min-w-[150px]"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-md text-sm flex-1 min-w-[150px]"
          />
          <button
            onClick={handleUpdateUser}
            className="inline-flex items-center justify-center h-9 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Update User
          </button>
        </div>
      </div>
      
      {/* Theme Switcher Section */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Theme Settings</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Current theme:</span>
          <span className="text-sm font-medium">
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </span>
        </div>
        <button
          onClick={handleThemeToggle}
          className="inline-flex items-center justify-center h-9 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
        >
          Toggle Theme
        </button>
      </div>
      
      {/* Shared Counter Section */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Shared Counter</h2>
        <p className="text-sm text-muted-foreground">This counter is shared across all MFEs:</p>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Value:</span>
          <span className="text-3xl font-bold min-w-[40px] text-center">{counter}</span>
          <button
            onClick={handleIncrement}
            className="inline-flex items-center justify-center h-9 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Increment
          </button>
        </div>
      </div>
      
      {/* State Snapshot */}
      <div className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Current State Snapshot</h2>
        <pre className="w-full px-3 py-2 border rounded-md text-sm font-mono text-xs h-32 overflow-auto">
          {JSON.stringify(stateManager.getSnapshot(), null, 2)}
        </pre>
      </div>
    </div>
  );
};