// Vanilla TypeScript State Demo MFE
import type { MFEServices } from '@mfe/dev-kit';
import type { StateChangeEvent } from '@mfe/universal-state';
import { getButtonClasses } from '@mfe/shared';

interface User {
  name: string;
  email: string;
}

interface VanillaMFE {
  mount: (element: HTMLElement, services: MFEServices) => void;
  unmount: (element: HTMLElement) => void;
}

interface ElementWithCleanup extends HTMLElement {
  _cleanup?: () => void;
}

const StateDemoVanillaMFE: VanillaMFE = {
  mount: (element: ElementWithCleanup, services: MFEServices) => {
    console.log('[Vanilla State Demo] Mounting with services:', services);

    // Get state manager from services
    const stateManager = services.stateManager;
    if (!stateManager) {
      console.error('[Vanilla State Demo] No state manager provided in services');
      element.innerHTML =
        '<div style="padding: 20px; color: red;">Error: No state manager provided</div>';
      return;
    }

    // Create the UI
    element.innerHTML = `
      <div id="vanilla-app" class="space-y-6 p-6">
        <div>
          <h2 class="text-2xl font-bold">Vanilla TypeScript State Demo</h2>
          <p class="text-muted-foreground">Demonstrating cross-framework state synchronization</p>
        </div>
        
        <!-- User Management Card -->
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-4">User Management</h3>
            
            <div id="user-display-section" class="mb-4 p-4 bg-muted rounded-md text-center text-muted-foreground">
              No user logged in
            </div>
            
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <input type="text" id="name-input" placeholder="Name" 
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                <input type="email" id="email-input" placeholder="Email" 
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
              <button id="update-user-btn" class="${getButtonClasses('secondary', 'default', 'w-full')}">Update User</button>
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
                    <p class="text-sm text-muted-foreground">Applies to all MFEs</p>
                  </div>
                  <div id="theme-display" class="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                    <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <button id="toggle-theme-btn" class="${getButtonClasses('outline', 'default', 'w-full')}">Toggle Theme</button>
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
                  <p class="text-sm text-muted-foreground mt-1">Synchronized value</p>
                </div>
                <button id="increment-btn" class="${getButtonClasses('secondary', 'default', 'w-full')}">Increment</button>
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

    // Get UI elements with proper types
    const app = element.querySelector<HTMLDivElement>('#vanilla-app');
    const userDisplaySection = element.querySelector<HTMLDivElement>('#user-display-section');
    const nameInput = element.querySelector<HTMLInputElement>('#name-input');
    const emailInput = element.querySelector<HTMLInputElement>('#email-input');
    const updateUserBtn = element.querySelector<HTMLButtonElement>('#update-user-btn');
    const themeDisplay = element.querySelector<HTMLSpanElement>('#theme-display');
    const toggleThemeBtn = element.querySelector<HTMLButtonElement>('#toggle-theme-btn');
    const counterDisplay = element.querySelector<HTMLSpanElement>('#counter-display');
    const incrementBtn = element.querySelector<HTMLButtonElement>('#increment-btn');
    const stateSnapshot = element.querySelector<HTMLPreElement>('#state-snapshot');

    // Ensure all elements exist
    if (
      !app ||
      !userDisplaySection ||
      !nameInput ||
      !emailInput ||
      !updateUserBtn ||
      !themeDisplay ||
      !toggleThemeBtn ||
      !counterDisplay ||
      !incrementBtn ||
      !stateSnapshot
    ) {
      console.error('[Vanilla State Demo] Failed to find required DOM elements');
      return;
    }

    // State
    let currentTheme: 'light' | 'dark' = 'light';
    let currentCounter = 0;

    // Apply theme
    const applyTheme = (theme: 'light' | 'dark') => {
      currentTheme = theme;
      themeDisplay.innerHTML =
        theme === 'dark'
          ? `<svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>`
          : `<svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>`;
      // The design system handles dark/light mode automatically via CSS variables
    };

    // Update user display
    const updateUserDisplay = (user: User | null) => {
      if (user) {
        userDisplaySection.innerHTML = `
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
        userDisplaySection.classList.remove('text-center', 'text-muted-foreground');
      } else {
        userDisplaySection.innerHTML = 'No user logged in';
        userDisplaySection.classList.add('text-center', 'text-muted-foreground');
      }
    };

    // Update counter display
    const updateCounterDisplay = (value: number) => {
      currentCounter = value;
      counterDisplay.textContent = value.toString();
    };

    // Update state snapshot
    const updateStateSnapshot = () => {
      const snapshot = stateManager.getSnapshot();
      stateSnapshot.textContent = JSON.stringify(snapshot, null, 2);
    };

    // Initialize with current values
    const initializeState = () => {
      const user = stateManager.get('user') as User | null;
      const theme = (stateManager.get('theme') as 'light' | 'dark' | null) || 'light';
      const counter = (stateManager.get('sharedCounter') as number | null) || 0;

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
      const newTheme: 'light' | 'dark' = currentTheme === 'dark' ? 'light' : 'dark';
      stateManager.set('theme', newTheme, 'vanilla-mfe');
    });

    incrementBtn.addEventListener('click', () => {
      stateManager.set('sharedCounter', currentCounter + 1, 'vanilla-mfe');
    });

    // Subscribe to state changes
    const unsubscribers: Array<() => void> = [];

    unsubscribers.push(
      stateManager.subscribe('user', (value: User | null) => {
        console.log('[Vanilla MFE] User changed:', value);
        updateUserDisplay(value);
      })
    );

    unsubscribers.push(
      stateManager.subscribe('theme', (value: 'light' | 'dark' | null) => {
        console.log('[Vanilla MFE] Theme changed:', value);
        applyTheme(value || 'light');
      })
    );

    unsubscribers.push(
      stateManager.subscribe('sharedCounter', (value: number | null) => {
        console.log('[Vanilla MFE] Counter changed:', value);
        updateCounterDisplay(value || 0);
      })
    );

    // Subscribe to all changes to update state snapshot
    unsubscribers.push(
      stateManager.subscribeAll((event: StateChangeEvent) => {
        console.log(`[Vanilla MFE] State changed: ${event.key} =`, event.value);
        updateStateSnapshot();
      })
    );

    // Register this MFE
    stateManager.registerMFE('state-demo-vanilla', {
      version: '1.0.0',
      framework: 'vanilla',
      features: ['user-management', 'theme-switcher', 'counter'],
    });

    // Initialize
    initializeState();

    // Store cleanup function
    element._cleanup = () => {
      // Unsubscribe from all
      unsubscribers.forEach((unsub) => unsub());
      // Unregister MFE
      stateManager.unregisterMFE('state-demo-vanilla');
      // Remove event listeners by replacing element content
      element.innerHTML = '';
    };
  },

  unmount: (element: ElementWithCleanup) => {
    console.log('[Vanilla State Demo] Unmounting');
    if (element._cleanup) {
      element._cleanup();
      delete element._cleanup;
    }
  },
};

export default StateDemoVanillaMFE;
