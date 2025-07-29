import React, { useState, useEffect } from 'react';

interface SimpleAppProps {
  stateManager: any;
}

export const SimpleApp: React.FC<SimpleAppProps> = ({ stateManager }) => {
  const [user, setLocalUser] = useState<any>(null);
  const [theme, setLocalTheme] = useState('light');
  const [counter, setLocalCounter] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    if (!stateManager) {
      console.error('No state manager provided');
      return;
    }

    // Initialize with current values
    const currentUser = stateManager.get('user');
    const currentTheme = stateManager.get('theme') || 'light';
    const currentCounter = stateManager.get('sharedCounter') || 0;
    
    setLocalUser(currentUser);
    setLocalTheme(currentTheme);
    setLocalCounter(currentCounter);

    // Subscribe to changes
    const unsubUser = stateManager.subscribe('user', (value: any) => {
      console.log('[React MFE] User changed:', value);
      setLocalUser(value);
    });

    const unsubTheme = stateManager.subscribe('theme', (value: any) => {
      console.log('[React MFE] Theme changed:', value);
      setLocalTheme(value || 'light');
    });

    const unsubCounter = stateManager.subscribe('sharedCounter', (value: any) => {
      console.log('[React MFE] Counter changed:', value);
      setLocalCounter(value || 0);
    });

    return () => {
      unsubUser();
      unsubTheme();
      unsubCounter();
    };
  }, [stateManager]);

  const updateUser = () => {
    if (formData.name && formData.email) {
      stateManager.set('user', formData, 'react-mfe');
      setFormData({ name: '', email: '' });
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    stateManager.set('theme', newTheme, 'react-mfe');
  };

  const incrementCounter = () => {
    stateManager.set('sharedCounter', counter + 1, 'react-mfe');
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000',
      minHeight: '300px',
      borderRadius: '8px'
    }}>
      <h2>React State Demo</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>User Info</h3>
        {user ? (
          <p>Name: {user.name}, Email: {user.email}</p>
        ) : (
          <p>No user set</p>
        )}
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ marginRight: '10px' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ marginRight: '10px' }}
        />
        <button onClick={updateUser}>Update User</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Theme: {theme}</h3>
        <button onClick={toggleTheme}>Toggle Theme</button>
      </div>

      <div>
        <h3>Shared Counter: {counter}</h3>
        <button onClick={incrementCounter}>Increment</button>
      </div>
    </div>
  );
};