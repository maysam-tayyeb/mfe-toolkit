// Vanilla TypeScript State Demo MFE
import type { MFEServices } from '@mfe/dev-kit';
import type { StateManager } from '@mfe/universal-state';

interface MFEModule {
  mount: (element: HTMLElement, services: MFEServices) => void;
  unmount: (element: HTMLElement) => void;
}

// Pure vanilla implementation using only the StateManager interface
const StateDemoVanillaMFE: MFEModule = {
  mount: (element: HTMLElement, services: MFEServices) => {
    console.log('[Vanilla State Demo] Mounting with services:', services);

    // Get state manager from services
    const stateManager = services.stateManager as StateManager;
    if (!stateManager) {
      console.error('[Vanilla State Demo] No state manager provided in services');
      element.innerHTML = '<div style="padding: 20px; color: red;">Error: No state manager provided</div>';
      return;
    }

    // Register this MFE
    stateManager.registerMFE('state-demo-vanilla', {
      version: '1.0.0',
      framework: 'vanilla',
      features: ['user-management', 'theme-switcher', 'counter'],
    });

    // Create UI
    element.innerHTML = `
      <div class="space-y-6 p-6">
        <div>
          <h2 class="text-2xl font-bold">Vanilla TypeScript State Demo</h2>
          <p class="text-muted-foreground">Pure JavaScript implementation with Universal State Manager</p>
        </div>

        <!-- User Management Card -->
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-4">User Management</h3>
            
            <div id="user-display" class="mb-4"></div>
            
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <input
                  id="name-input"
                  type="text"
                  placeholder="Name"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <input
                  id="email-input"
                  type="email"
                  placeholder="Email"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <button
                id="update-user-btn"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
              >
                Update User
              </button>
            </div>
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Theme Settings Card -->
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-4">Theme Settings</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">Current Theme</p>
                    <p class="text-sm text-muted-foreground">Click to toggle</p>
                  </div>
                  <div id="theme-icon" class="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                    <!-- Icon will be inserted here -->
                  </div>
                </div>
                <button
                  id="toggle-theme-btn"
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                >
                  Toggle Theme
                </button>
              </div>
            </div>
          </div>

          <!-- Shared Counter Card -->
          <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div class="p-6">
              <h3 class="text-lg font-semibold mb-4">Shared Counter</h3>
              <div class="space-y-4">
                <div class="text-center">
                  <div id="counter-display" class="text-4xl font-bold tabular-nums">0</div>
                  <p class="text-sm text-muted-foreground mt-1">Synchronized across all MFEs</p>
                </div>
                <button
                  id="increment-btn"
                  class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full"
                >
                  Increment
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- State Snapshot Card -->
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-4">State Snapshot</h3>
            <pre id="state-snapshot" class="p-4 rounded-md bg-muted text-sm font-mono overflow-auto max-h-48"></pre>
          </div>
        </div>
      </div>
    `;

    // Get DOM elements
    const userDisplay = element.querySelector('#user-display') as HTMLDivElement;
    const nameInput = element.querySelector('#name-input') as HTMLInputElement;
    const emailInput = element.querySelector('#email-input') as HTMLInputElement;
    const updateUserBtn = element.querySelector('#update-user-btn') as HTMLButtonElement;
    const themeIcon = element.querySelector('#theme-icon') as HTMLDivElement;
    const toggleThemeBtn = element.querySelector('#toggle-theme-btn') as HTMLButtonElement;
    const counterDisplay = element.querySelector('#counter-display') as HTMLDivElement;
    const incrementBtn = element.querySelector('#increment-btn') as HTMLButtonElement;
    const stateSnapshot = element.querySelector('#state-snapshot') as HTMLPreElement;

    // Update functions
    const updateUserDisplay = (user?: { name: string; email: string }) => {
      if (user) {
        userDisplay.innerHTML = `
          <div class="flex items-center gap-3 p-3 bg-muted rounded-md">
            <div class="h-10 w-10 rounded-full bg-muted-foreground/20 flex items-center justify-center font-semibold">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p class="font-medium">${user.name}</p>
              <p class="text-sm text-muted-foreground">${user.email}</p>
            </div>
          </div>
        `;
      } else {
        userDisplay.innerHTML = `
          <div class="p-4 bg-muted rounded-md text-center text-muted-foreground">
            No user logged in
          </div>
        `;
      }
    };

    const updateThemeIcon = (theme: string) => {
      if (theme === 'dark') {
        themeIcon.innerHTML = `
          <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
        `;
      } else {
        themeIcon.innerHTML = `
          <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        `;
      }
    };

    const updateStateSnapshot = () => {
      const snapshot = stateManager.getSnapshot();
      stateSnapshot.textContent = JSON.stringify(snapshot, null, 2);
    };

    // Initialize with current values
    const currentUser = stateManager.get<{ name: string; email: string }>('user');
    const currentTheme = stateManager.get<string>('theme') || 'light';
    const currentCounter = stateManager.get<number>('sharedCounter') || 0;

    updateUserDisplay(currentUser);
    updateThemeIcon(currentTheme);
    counterDisplay.textContent = String(currentCounter);
    updateStateSnapshot();

    // Subscribe to state changes
    const unsubscribers: Array<() => void> = [];

    unsubscribers.push(
      stateManager.subscribe<{ name: string; email: string }>('user', (value) => {
        updateUserDisplay(value);
        updateStateSnapshot();
      })
    );

    unsubscribers.push(
      stateManager.subscribe<string>('theme', (value) => {
        updateThemeIcon(value || 'light');
        updateStateSnapshot();
      })
    );

    unsubscribers.push(
      stateManager.subscribe<number>('sharedCounter', (value) => {
        counterDisplay.textContent = String(value || 0);
        updateStateSnapshot();
      })
    );

    // Event handlers
    updateUserBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      
      if (name && email) {
        stateManager.set('user', { name, email }, 'vanilla-demo');
        nameInput.value = '';
        emailInput.value = '';
      }
    });

    toggleThemeBtn.addEventListener('click', () => {
      const currentTheme = stateManager.get<string>('theme') || 'light';
      stateManager.set('theme', currentTheme === 'dark' ? 'light' : 'dark', 'vanilla-demo');
    });

    incrementBtn.addEventListener('click', () => {
      const current = stateManager.get<number>('sharedCounter') || 0;
      stateManager.set('sharedCounter', current + 1, 'vanilla-demo');
    });

    // Store cleanup function
    (element as any).__cleanup = () => {
      unsubscribers.forEach(unsub => unsub());
      stateManager.unregisterMFE('state-demo-vanilla');
    };
  },

  unmount: (element: HTMLElement) => {
    // Call cleanup if it exists
    const cleanup = (element as any).__cleanup;
    if (cleanup) {
      cleanup();
      delete (element as any).__cleanup;
    }
    
    // Clear the element
    element.innerHTML = '';
  },
};

export default StateDemoVanillaMFE;