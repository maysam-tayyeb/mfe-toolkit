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
    <div className={`p-6 rounded-lg transition-colors ${
      theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="text-2xl">⚛️</span>
        React State Demo
      </h2>
      
      {/* User Management Section */}
      <div className={`mb-6 p-4 rounded-md ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm'
      }`}>
        <h3 className="text-lg font-medium mb-3">User Info</h3>
        <div className={`mb-3 p-3 rounded ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          {user ? (
            <p className="flex items-center gap-2">
              <span>👤</span>
              <span className="font-medium">{user.name}</span>
              <span className="text-sm opacity-75">({user.email})</span>
            </p>
          ) : (
            <p className="text-gray-500">No user set</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`flex-1 min-w-[150px] px-3 py-2 rounded-md border transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`flex-1 min-w-[150px] px-3 py-2 rounded-md border transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
          <button
            onClick={handleUpdateUser}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Update User
          </button>
        </div>
      </div>
      
      {/* Theme Switcher Section */}
      <div className={`mb-6 p-4 rounded-md ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm'
      }`}>
        <h3 className="text-lg font-medium mb-3">Theme Settings</h3>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-gray-600 dark:text-gray-400">Current theme:</span>
          <span className="font-medium flex items-center gap-2">
            {theme === 'dark' ? (
              <>🌙 Dark</>
            ) : (
              <>☀️ Light</>
            )}
          </span>
        </div>
        <button
          onClick={handleThemeToggle}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
        >
          Toggle Theme
        </button>
      </div>
      
      {/* Shared Counter Section */}
      <div className={`mb-6 p-4 rounded-md ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm'
      }`}>
        <h3 className="text-lg font-medium mb-3">Shared Counter</h3>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 dark:text-gray-400">Value:</span>
          <span className="text-2xl font-bold min-w-[40px] text-center">{counter}</span>
          <button
            onClick={handleIncrement}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Increment
          </button>
        </div>
      </div>
      
      {/* State Snapshot */}
      <div className={`p-4 rounded-md ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm'
      }`}>
        <h3 className="text-lg font-medium mb-3">Current State Snapshot</h3>
        <pre className={`p-3 rounded text-xs overflow-auto ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          {JSON.stringify(stateManager.getSnapshot(), null, 2)}
        </pre>
      </div>
    </div>
  );
};