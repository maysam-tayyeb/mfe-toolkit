import React, { useState } from 'react';
import { ReactAdapter } from '@mfe/universal-state';
import { StateManager } from '@mfe/universal-state';

interface AppProps {
  stateManager: StateManager;
}

export const App: React.FC<AppProps> = ({ stateManager }) => {
  const adapter = new ReactAdapter(stateManager);
  
  // Use global state hooks
  const [user, setUser] = adapter.useGlobalState<{ name: string; email: string }>('user');
  const [theme, setTheme] = adapter.useGlobalState<'light' | 'dark'>('theme');
  const [counter, setCounter] = adapter.useGlobalState<number>('sharedCounter');
  
  // Local state for form
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  // Register this MFE
  adapter.useMFERegistration('state-demo-react', {
    version: '1.0.0',
    features: ['user-management', 'theme-switcher', 'counter']
  });
  
  // Listen to all state changes
  adapter.useGlobalStateListener((key, value) => {
    console.log(`[React MFE] State changed: ${key} =`, value);
  });
  
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
        <p>Current theme: <strong>{theme || 'light'}</strong></p>
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
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{counter || 0}</p>
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