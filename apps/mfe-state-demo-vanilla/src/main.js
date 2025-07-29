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
      <div id="vanilla-app" class="p-6 rounded-lg transition-colors bg-gray-50 text-gray-900">
        <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
          <span class="text-2xl">🟨</span>
          Vanilla JS State Demo  
        </h2>
        
        <div class="mb-6 p-4 rounded-md bg-white shadow-sm">
          <h3 class="text-lg font-medium mb-3">User Info</h3>
          <div class="mb-3 p-3 rounded bg-gray-100">
            <p id="user-display" class="text-gray-500">No user set</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <input type="text" id="name-input" placeholder="Name" 
              class="flex-1 min-w-[150px] px-3 py-2 rounded-md border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors" />
            <input type="email" id="email-input" placeholder="Email" 
              class="flex-1 min-w-[150px] px-3 py-2 rounded-md border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors" />
            <button id="update-user-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">Update User</button>
          </div>
        </div>
        
        <div class="mb-6 p-4 rounded-md bg-white shadow-sm">
          <h3 class="text-lg font-medium mb-3">Theme Settings</h3>
          <div class="flex items-center gap-3 mb-3">
            <span class="text-gray-600">Current theme:</span>
            <span class="font-medium flex items-center gap-2">
              <span id="theme-display">☀️ light</span>
            </span>
          </div>
          <button id="toggle-theme-btn" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors">Toggle Theme</button>
        </div>
        
        <div class="p-4 rounded-md bg-white shadow-sm">
          <h3 class="text-lg font-medium mb-3">Shared Counter</h3>
          <div class="flex items-center gap-4">
            <span class="text-gray-600">Value:</span>
            <span id="counter-display" class="text-2xl font-bold min-w-[40px] text-center">0</span>
            <button id="increment-btn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">Increment</button>
          </div>
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
      themeDisplay.textContent = theme === 'dark' ? '🌙 dark' : '☀️ light';
      
      // Update main container classes
      if (theme === 'dark') {
        app.className = 'p-6 rounded-lg transition-colors bg-gray-800 text-gray-100';
        // Update sections
        const sections = app.querySelectorAll('.mb-6, .p-4');
        sections.forEach(section => {
          if (section.classList.contains('mb-6')) {
            section.className = 'mb-6 p-4 rounded-md bg-gray-700';
          } else if (section.classList.contains('p-4') && !section.classList.contains('mb-6')) {
            section.className = 'p-4 rounded-md bg-gray-700';  
          }
        });
        // Update user display area
        const userArea = app.querySelector('.mb-3');
        if (userArea) userArea.className = 'mb-3 p-3 rounded bg-gray-800';
        // Update inputs
        const inputs = app.querySelectorAll('input');
        inputs.forEach(input => {
          input.className = 'flex-1 min-w-[150px] px-3 py-2 rounded-md border bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors';
        });
        // Update theme display spans
        const themeSpans = app.querySelectorAll('.text-gray-600');
        themeSpans.forEach(span => {
          span.className = 'text-gray-400';
        });
      } else {
        app.className = 'p-6 rounded-lg transition-colors bg-gray-50 text-gray-900';
        // Update sections
        const sections = app.querySelectorAll('.mb-6, .p-4');
        sections.forEach(section => {
          if (section.classList.contains('mb-6') || section.className.includes('mb-6')) {
            section.className = 'mb-6 p-4 rounded-md bg-white shadow-sm';
          } else {
            section.className = 'p-4 rounded-md bg-white shadow-sm';
          }
        });
        // Update user display area  
        const userArea = app.querySelector('.mb-3, .bg-gray-800');
        if (userArea) userArea.className = 'mb-3 p-3 rounded bg-gray-100';
        // Update inputs
        const inputs = app.querySelectorAll('input');
        inputs.forEach(input => {
          input.className = 'flex-1 min-w-[150px] px-3 py-2 rounded-md border bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors';
        });
        // Update theme display spans
        const graySpans = app.querySelectorAll('.text-gray-400');
        graySpans.forEach(span => {
          span.className = 'text-gray-600';
        });
      }
    };
    
    // Update user display
    const updateUserDisplay = (user) => {
      currentUser = user;
      if (user) {
        userDisplay.innerHTML = `<span>👤</span> <span style="font-weight: 500;">${user.name}</span> <span style="font-size: 0.875rem; opacity: 0.75;">(${user.email})</span>`;
        userDisplay.className = 'flex items-center gap-2';
      } else {
        userDisplay.textContent = 'No user set';
        userDisplay.className = 'text-gray-500';
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