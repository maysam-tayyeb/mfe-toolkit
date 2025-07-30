// Valtio-Enhanced Vanilla TypeScript State Demo MFE
import type { MFEServices } from '@mfe/dev-kit';
import { ValtioStateManager } from '@mfe/universal-state';
import { getButtonClasses } from '@mfe/shared';
import { subscribe, snapshot } from 'valtio';

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

export const createValtioVanillaMFE = (): VanillaMFE => ({
  mount: (element: ElementWithCleanup, services: MFEServices) => {
    console.log('[Valtio Vanilla State Demo] Mounting with services:', services);

    // Get state manager from services
    const stateManager = services.stateManager as ValtioStateManager;
    if (!stateManager || !(stateManager instanceof ValtioStateManager)) {
      console.error('[Valtio Vanilla State Demo] No Valtio state manager provided');
      element.innerHTML =
        '<div style="padding: 20px; color: red;">Error: Valtio state manager required</div>';
      return;
    }

    // Get direct access to proxy store for reactive updates
    const proxyStore = stateManager.getProxyStore();

    // Create the UI
    element.innerHTML = `
      <div id="valtio-vanilla-app" class="space-y-6 p-6">
        <div>
          <h2 class="text-2xl font-bold">Vanilla TypeScript State Demo (Valtio Enhanced)</h2>
          <p class="text-muted-foreground">Using Valtio proxy for reactive state</p>
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
                    <p class="text-sm text-muted-foreground">Direct proxy updates</p>
                  </div>
                  <div id="theme-display" class="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                    <!-- Icon will be inserted here -->
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
                  <p class="text-sm text-muted-foreground mt-1">Reactive updates</p>
                </div>
                <button id="increment-btn" class="${getButtonClasses('secondary', 'default', 'w-full')}">Increment</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Valtio Features Card -->
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-4">Valtio Benefits in Vanilla JS</h3>
            <div class="grid gap-3 text-sm">
              <div class="flex items-start gap-2">
                <span class="text-green-500">✓</span>
                <div>
                  <strong>Direct Proxy Access:</strong> No framework needed for reactivity
                </div>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-green-500">✓</span>
                <div>
                  <strong>Automatic Updates:</strong> Subscribe to proxy changes directly
                </div>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-green-500">✓</span>
                <div>
                  <strong>Type Safety:</strong> Full TypeScript support without annotations
                </div>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-green-500">✓</span>
                <div>
                  <strong>Clean Encapsulation:</strong> No globals, pure functional approach
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- State Snapshot Card -->
        <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-4">Live State Snapshot</h3>
            <pre id="state-snapshot" class="p-4 rounded-md bg-muted text-sm font-mono overflow-auto max-h-48"></pre>
          </div>
        </div>
      </div>
    `;

    // Get UI elements
    const elements = {
      userDisplay: element.querySelector<HTMLDivElement>('#user-display-section')!,
      nameInput: element.querySelector<HTMLInputElement>('#name-input')!,
      emailInput: element.querySelector<HTMLInputElement>('#email-input')!,
      updateUserBtn: element.querySelector<HTMLButtonElement>('#update-user-btn')!,
      themeDisplay: element.querySelector<HTMLDivElement>('#theme-display')!,
      toggleThemeBtn: element.querySelector<HTMLButtonElement>('#toggle-theme-btn')!,
      counterDisplay: element.querySelector<HTMLDivElement>('#counter-display')!,
      incrementBtn: element.querySelector<HTMLButtonElement>('#increment-btn')!,
      stateSnapshot: element.querySelector<HTMLPreElement>('#state-snapshot')!,
    };

    // Update functions
    const updateUI = () => {
      const snap = snapshot(proxyStore);
      
      // Update user display
      const user = snap.user as User | undefined;
      if (user) {
        elements.userDisplay.innerHTML = `
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
        elements.userDisplay.classList.remove('text-center', 'text-muted-foreground');
      } else {
        elements.userDisplay.innerHTML = 'No user logged in';
        elements.userDisplay.classList.add('text-center', 'text-muted-foreground');
      }
      
      // Update theme display
      const theme = snap.theme as 'light' | 'dark' || 'light';
      elements.themeDisplay.innerHTML = theme === 'dark'
        ? `<svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>`
        : `<svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>`;
      
      // Update counter
      elements.counterDisplay.textContent = String(snap.sharedCounter || 0);
      
      // Update state snapshot
      elements.stateSnapshot.textContent = JSON.stringify(snap, null, 2);
    };

    // Event handlers using direct proxy updates
    elements.updateUserBtn.addEventListener('click', () => {
      const name = elements.nameInput.value.trim();
      const email = elements.emailInput.value.trim();

      if (name && email) {
        // Direct proxy update - Valtio handles the rest!
        proxyStore.user = { name, email };
        elements.nameInput.value = '';
        elements.emailInput.value = '';
      }
    });

    elements.toggleThemeBtn.addEventListener('click', () => {
      const currentTheme = proxyStore.theme as 'light' | 'dark' || 'light';
      proxyStore.theme = currentTheme === 'dark' ? 'light' : 'dark';
    });

    elements.incrementBtn.addEventListener('click', () => {
      const currentCounter = proxyStore.sharedCounter as number || 0;
      proxyStore.sharedCounter = currentCounter + 1;
    });

    // Subscribe to proxy changes
    const unsubscribe = subscribe(proxyStore, updateUI);

    // Register this MFE
    stateManager.registerMFE('state-demo-vanilla-valtio', {
      version: '2.0.0',
      framework: 'vanilla',
      features: ['valtio-proxy', 'reactive-updates', 'direct-mutations'],
    });

    // Initial update
    updateUI();

    // Store cleanup function
    element._cleanup = () => {
      unsubscribe();
      stateManager.unregisterMFE('state-demo-vanilla-valtio');
      element.innerHTML = '';
    };
  },

  unmount: (element: ElementWithCleanup) => {
    console.log('[Valtio Vanilla State Demo] Unmounting');
    if (element._cleanup) {
      element._cleanup();
      delete element._cleanup;
    }
  },
});

export default createValtioVanillaMFE();