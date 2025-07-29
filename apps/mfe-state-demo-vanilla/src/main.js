// Vanilla JS State Demo MFE
const StateDemoVanillaMFE = {
  mount: (element, services) => {
    console.log('[Vanilla State Demo] Mounting with services:', services);
    
    // Get state manager from services
    const stateManager = services.stateManager;
    if (!stateManager) {
      console.error('[Vanilla State Demo] No state manager provided in services');
      element.innerHTML = '<div style="padding: 20px; color: red;">Error: No state manager provided</div>';
      return;
    }
    
    // Create the UI
    element.innerHTML = `
      <div id="vanilla-app" style="padding: 20px; background-color: #ffffff; color: #000000; min-height: 400px; border-radius: 8px; transition: all 0.3s ease;">
        <h2>Vanilla JS MFE - State Demo</h2>
        <p>This MFE demonstrates framework-agnostic state management.</p>
        
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 4px;">
          <h3>User Management</h3>
          <div id="user-display-section">
            <p>No user logged in</p>
          </div>
          
          <div style="margin-top: 10px;">
            <input type="text" id="name-input" placeholder="Name" 
              style="padding: 5px; margin-right: 10px; background-color: #fff; color: #000; border: 1px solid #ccc;" />
            <input type="email" id="email-input" placeholder="Email" 
              style="padding: 5px; margin-right: 10px; background-color: #fff; color: #000; border: 1px solid #ccc;" />
            <button id="update-user-btn" style="padding: 5px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Update User</button>
          </div>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 4px;">
          <h3>Theme Switcher</h3>
          <p>Current theme: <strong id="theme-display">light</strong></p>
          <button id="toggle-theme-btn" style="padding: 5px 15px; background-color: #343a40; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Toggle Theme</button>
        </div>
        
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 4px;">
          <h3>Shared Counter</h3>
          <p>This counter is shared across all MFEs:</p>
          <p id="counter-display" style="font-size: 24px; font-weight: bold;">0</p>
          <button id="increment-btn" style="padding: 5px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Increment</button>
        </div>
        
        <div style="padding: 15px; border: 1px solid #ccc; border-radius: 4px;">
          <h3>Current State Snapshot</h3>
          <pre id="state-snapshot" style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;"></pre>
        </div>
      </div>
    `;
    
    // Get UI elements
    const app = element.querySelector('#vanilla-app');
    const userDisplaySection = element.querySelector('#user-display-section');
    const nameInput = element.querySelector('#name-input');
    const emailInput = element.querySelector('#email-input');
    const updateUserBtn = element.querySelector('#update-user-btn');
    const themeDisplay = element.querySelector('#theme-display');
    const toggleThemeBtn = element.querySelector('#toggle-theme-btn');
    const counterDisplay = element.querySelector('#counter-display');
    const incrementBtn = element.querySelector('#increment-btn');
    const stateSnapshot = element.querySelector('#state-snapshot');
    
    // State
    let currentTheme = 'light';
    let currentUser = null;
    let currentCounter = 0;
    
    // Apply theme
    const applyTheme = (theme) => {
      currentTheme = theme;
      themeDisplay.textContent = theme;
      
      // Update main app styles
      if (theme === 'dark') {
        app.style.backgroundColor = '#1a1a1a';
        app.style.color = '#ffffff';
        toggleThemeBtn.style.backgroundColor = '#f8f9fa';
        toggleThemeBtn.style.color = '#000';
        stateSnapshot.style.backgroundColor = '#333';
        // Update inputs
        nameInput.style.backgroundColor = '#333';
        nameInput.style.color = '#fff';
        emailInput.style.backgroundColor = '#333';
        emailInput.style.color = '#fff';
      } else {
        app.style.backgroundColor = '#ffffff';
        app.style.color = '#000000';
        toggleThemeBtn.style.backgroundColor = '#343a40';
        toggleThemeBtn.style.color = '#fff';
        stateSnapshot.style.backgroundColor = '#f5f5f5';
        // Update inputs
        nameInput.style.backgroundColor = '#fff';
        nameInput.style.color = '#000';
        emailInput.style.backgroundColor = '#fff';
        emailInput.style.color = '#000';
      }
    };
    
    // Update user display
    const updateUserDisplay = (user) => {
      currentUser = user;
      if (user) {
        userDisplaySection.innerHTML = `
          <p><strong>Current User:</strong></p>
          <p>Name: ${user.name}</p>
          <p>Email: ${user.email}</p>
        `;
      } else {
        userDisplaySection.innerHTML = '<p>No user logged in</p>';
      }
    };
    
    // Update counter display
    const updateCounterDisplay = (value) => {
      currentCounter = value;
      counterDisplay.textContent = value;
    };
    
    // Update state snapshot
    const updateStateSnapshot = () => {
      const snapshot = stateManager.getSnapshot();
      stateSnapshot.textContent = JSON.stringify(snapshot, null, 2);
    };
    
    // Initialize with current values
    const initializeState = () => {
      const user = stateManager.get('user');
      const theme = stateManager.get('theme') || 'light';
      const counter = stateManager.get('sharedCounter') || 0;
      
      updateUserDisplay(user);
      applyTheme(theme);
      updateCounterDisplay(counter);
      updateStateSnapshot();
    };
    
    // Event handlers
    updateUserBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      
      if (name && email) {
        stateManager.set('user', { name, email }, 'vanilla-mfe');
        nameInput.value = '';
        emailInput.value = '';
      }
    });
    
    toggleThemeBtn.addEventListener('click', () => {
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      stateManager.set('theme', newTheme, 'vanilla-mfe');
    });
    
    incrementBtn.addEventListener('click', () => {
      stateManager.set('sharedCounter', currentCounter + 1, 'vanilla-mfe');
    });
    
    // Subscribe to state changes
    const unsubscribers = [];
    
    unsubscribers.push(
      stateManager.subscribe('user', (value) => {
        console.log('[Vanilla MFE] User changed:', value);
        updateUserDisplay(value);
      })
    );
    
    unsubscribers.push(
      stateManager.subscribe('theme', (value) => {
        console.log('[Vanilla MFE] Theme changed:', value);
        applyTheme(value || 'light');
      })
    );
    
    unsubscribers.push(
      stateManager.subscribe('sharedCounter', (value) => {
        console.log('[Vanilla MFE] Counter changed:', value);
        updateCounterDisplay(value || 0);
      })
    );
    
    // Subscribe to all changes to update state snapshot
    unsubscribers.push(
      stateManager.subscribeAll((event) => {
        console.log(`[Vanilla MFE] State changed: ${event.key} =`, event.value);
        updateStateSnapshot();
      })
    );
    
    // Initialize
    initializeState();
    
    // Store cleanup function
    element._cleanup = () => {
      // Unsubscribe from all
      unsubscribers.forEach(unsub => unsub());
      // Remove event listeners by replacing element content
      element.innerHTML = '';
    };
  },
  
  unmount: (element) => {
    console.log('[Vanilla State Demo] Unmounting');
    if (element._cleanup) {
      element._cleanup();
      delete element._cleanup;
    }
  }
};

export default StateDemoVanillaMFE;