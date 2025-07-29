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
      <div id="vanilla-app" style="padding: 20px; min-height: 300px; border-radius: 8px;">
        <h2>Vanilla JS State Demo</h2>
        
        <div style="margin-bottom: 20px;">
          <h3>User Info</h3>
          <p id="user-display">No user set</p>
          <input type="text" id="name-input" placeholder="Name" style="margin-right: 10px;" />
          <input type="email" id="email-input" placeholder="Email" style="margin-right: 10px;" />
          <button id="update-user-btn">Update User</button>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3>Theme: <span id="theme-display">light</span></h3>
          <button id="toggle-theme-btn">Toggle Theme</button>
        </div>
        
        <div>
          <h3>Shared Counter: <span id="counter-display">0</span></h3>
          <button id="increment-btn">Increment</button>
        </div>
      </div>
    `;
    
    // Get UI elements
    const app = element.querySelector('#vanilla-app');
    const userDisplay = element.querySelector('#user-display');
    const nameInput = element.querySelector('#name-input');
    const emailInput = element.querySelector('#email-input');
    const updateUserBtn = element.querySelector('#update-user-btn');
    const themeDisplay = element.querySelector('#theme-display');
    const toggleThemeBtn = element.querySelector('#toggle-theme-btn');
    const counterDisplay = element.querySelector('#counter-display');
    const incrementBtn = element.querySelector('#increment-btn');
    
    // State
    let currentTheme = 'light';
    let currentUser = null;
    let currentCounter = 0;
    
    // Apply theme
    const applyTheme = (theme) => {
      currentTheme = theme;
      themeDisplay.textContent = theme;
      if (theme === 'dark') {
        app.style.backgroundColor = '#1a1a1a';
        app.style.color = '#ffffff';
      } else {
        app.style.backgroundColor = '#ffffff';
        app.style.color = '#000000';
      }
    };
    
    // Update user display
    const updateUserDisplay = (user) => {
      currentUser = user;
      if (user) {
        userDisplay.textContent = `Name: ${user.name}, Email: ${user.email}`;
      } else {
        userDisplay.textContent = 'No user set';
      }
    };
    
    // Update counter display
    const updateCounterDisplay = (value) => {
      currentCounter = value;
      counterDisplay.textContent = value;
    };
    
    // Initialize with current values
    const initializeState = () => {
      const user = stateManager.get('user');
      const theme = stateManager.get('theme') || 'light';
      const counter = stateManager.get('sharedCounter') || 0;
      
      updateUserDisplay(user);
      applyTheme(theme);
      updateCounterDisplay(counter);
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