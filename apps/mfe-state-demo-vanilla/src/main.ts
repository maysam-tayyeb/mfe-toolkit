// Vanilla TypeScript State Demo MFE
import type { MFEServices } from '@mfe-toolkit/core';
import type { StateManager } from '@mfe-toolkit/state';
import type { User, SharedCounter } from '@mfe/shared';

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
      features: ['user-management', 'counter'],
    });

    // Create UI
    element.innerHTML = `
      <div class="space-y-6 p-6">
        <div>
          <h2 class="text-2xl font-bold">Vanilla TypeScript State Demo</h2>
          <p class="text-muted-foreground">Pure Vanilla TypeScript implementation with Universal State Manager</p>
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
    const counterDisplay = element.querySelector('#counter-display') as HTMLDivElement;
    const incrementBtn = element.querySelector('#increment-btn') as HTMLButtonElement;
    const stateSnapshot = element.querySelector('#state-snapshot') as HTMLPreElement;

    // Update functions
    const updateUserDisplay = (user?: User) => {
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

    const updateStateSnapshot = () => {
      const snapshot = stateManager.getSnapshot();
      stateSnapshot.textContent = JSON.stringify(snapshot, null, 2);
    };

    // Initialize with current values
    const currentUser = stateManager.get<User>('user');
    const currentCounter = stateManager.get<SharedCounter>('sharedCounter') || 0;

    updateUserDisplay(currentUser);
    counterDisplay.textContent = String(currentCounter);
    updateStateSnapshot();

    // Subscribe to state changes
    const unsubscribers: Array<() => void> = [];

    unsubscribers.push(
      stateManager.subscribe<User>('user', (value) => {
        updateUserDisplay(value);
        updateStateSnapshot();
      })
    );

    unsubscribers.push(
      stateManager.subscribe<SharedCounter>('sharedCounter', (value) => {
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

    incrementBtn.addEventListener('click', () => {
      const current = stateManager.get<SharedCounter>('sharedCounter') || 0;
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