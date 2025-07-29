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
    <div style={{
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000',
      minHeight: '400px',
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    }}>
      <h2>React MFE - State Demo</h2>
      <p>This MFE demonstrates framework-agnostic state management.</p>
      
      {/* User Management Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>User Management</h3>
        {user ? (
          <div>
            <p><strong>Current User:</strong></p>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
          </div>
        ) : (
          <p>No user logged in</p>
        )}
        
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              padding: '5px',
              marginRight: '10px',
              backgroundColor: theme === 'dark' ? '#333' : '#fff',
              color: theme === 'dark' ? '#fff' : '#000',
              border: '1px solid #ccc'
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{
              padding: '5px',
              marginRight: '10px',
              backgroundColor: theme === 'dark' ? '#333' : '#fff',
              color: theme === 'dark' ? '#fff' : '#000',
              border: '1px solid #ccc'
            }}
          />
          <button
            onClick={handleUpdateUser}
            style={{
              padding: '5px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Update User
          </button>
        </div>
      </div>
      
      {/* Theme Switcher Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Theme Switcher</h3>
        <p>Current theme: <strong>{theme}</strong></p>
        <button
          onClick={handleThemeToggle}
          style={{
            padding: '5px 15px',
            backgroundColor: theme === 'dark' ? '#f8f9fa' : '#343a40',
            color: theme === 'dark' ? '#000' : '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Toggle Theme
        </button>
      </div>
      
      {/* Shared Counter Section */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Shared Counter</h3>
        <p>This counter is shared across all MFEs:</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{counter}</p>
        <button
          onClick={handleIncrement}
          style={{
            padding: '5px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Increment
        </button>
      </div>
      
      {/* State Snapshot */}
      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h3>Current State Snapshot</h3>
        <pre style={{
          backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {JSON.stringify(stateManager.getSnapshot(), null, 2)}
        </pre>
      </div>
    </div>
  );
};