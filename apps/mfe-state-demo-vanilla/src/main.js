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
      <div id="vanilla-app" class="space-y-6 p-6">
        <div class="space-y-2">
          <h2 class="text-2xl font-bold">🟨 Vanilla JS State Demo</h2>
          <p class="text-muted-foreground mt-2">This MFE demonstrates framework-agnostic state management.</p>
        </div>
        
        <div class="border rounded-lg p-6 space-y-4">
          <h2 class="text-xl font-semibold">User Management</h2>
          <div id="user-display-section" class="bg-muted/50 rounded-lg p-4">
            <p class="text-sm text-muted-foreground">No user logged in</p>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <input type="text" id="name-input" placeholder="Name" 
              class="w-full px-3 py-2 border rounded-md text-sm flex-1 min-w-[150px]" />
            <input type="email" id="email-input" placeholder="Email" 
              class="w-full px-3 py-2 border rounded-md text-sm flex-1 min-w-[150px]" />
            <button id="update-user-btn" class="inline-flex items-center justify-center h-9 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">Update User</button>
          </div>
        </div>
        
        <div class="border rounded-lg p-6 space-y-4">
          <h2 class="text-xl font-semibold">Theme Settings</h2>
          <div class="flex items-center gap-3">
            <span class="text-sm text-muted-foreground">Current theme:</span>
            <span id="theme-display" class="text-sm font-medium">light</span>
          </div>
          <button id="toggle-theme-btn" class="inline-flex items-center justify-center h-9 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium">Toggle Theme</button>
        </div>
        
        <div class="border rounded-lg p-6 space-y-4">
          <h2 class="text-xl font-semibold">Shared Counter</h2>
          <p class="text-sm text-muted-foreground">This counter is shared across all MFEs:</p>
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground">Value:</span>
            <span id="counter-display" class="text-3xl font-bold min-w-[40px] text-center">0</span>
            <button id="increment-btn" class="inline-flex items-center justify-center h-9 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">Increment</button>
          </div>
        </div>
        
        <div class="border rounded-lg p-6 space-y-4">
          <h2 class="text-xl font-semibold">Current State Snapshot</h2>
          <pre id="state-snapshot" class="w-full px-3 py-2 border rounded-md text-sm font-mono text-xs h-32 overflow-auto"></pre>
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
      themeDisplay.textContent = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
      // The design system handles dark/light mode automatically via CSS variables
    };
    
    // Update user display
    const updateUserDisplay = (user) => {
      currentUser = user;
      if (user) {
        userDisplaySection.innerHTML = `
          <div class="space-y-1">
            <p class="text-sm font-medium">Current User:</p>
            <p class="text-sm text-muted-foreground">Name: ${user.name}</p>
            <p class="text-sm text-muted-foreground">Email: ${user.email}</p>
          </div>
        `;
      } else {
        userDisplaySection.innerHTML = '<p class="text-sm text-muted-foreground">No user logged in</p>';
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