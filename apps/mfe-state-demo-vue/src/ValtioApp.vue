<template>
  <div class="space-y-6 p-6">
    <div>
      <h2 class="text-2xl font-bold">Vue State Demo (Valtio Enhanced)</h2>
      <p class="text-muted-foreground">Using Valtio reactive state management</p>
    </div>
    
    <!-- User Management Card -->
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">User Management</h3>
        
        <div v-if="user" class="flex items-center gap-3 mb-4 p-3 bg-muted rounded-md">
          <div class="h-10 w-10 rounded-full bg-muted-foreground/20 flex items-center justify-center font-semibold">
            {{ user.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="font-medium">{{ user.name }}</p>
            <p class="text-sm text-muted-foreground">{{ user.email }}</p>
          </div>
        </div>
        <div v-else class="mb-4 p-4 bg-muted rounded-md text-center text-muted-foreground">
          No user logged in
        </div>
        
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <input
              v-model="formData.name"
              type="text"
              placeholder="Name"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <input
              v-model="formData.email"
              type="email"
              placeholder="Email"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <button 
            @click="updateUser" 
            :class="getButtonClasses('secondary', 'default', 'w-full')"
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
                <p class="text-sm text-muted-foreground">Reactive updates with Valtio</p>
              </div>
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                <svg v-if="theme === 'dark'" class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg v-else class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <button 
              @click="toggleTheme" 
              :class="getButtonClasses('outline', 'default', 'w-full')"
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
              <div class="text-4xl font-bold tabular-nums">{{ counter || 0 }}</div>
              <p class="text-sm text-muted-foreground mt-1">Fine-grained updates</p>
            </div>
            <button 
              @click="incrementCounter" 
              :class="getButtonClasses('secondary', 'default', 'w-full')"
            >
              Increment
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Valtio Features Card -->
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Valtio Benefits in Vue</h3>
        <div class="grid gap-3 text-sm">
          <div class="flex items-start gap-2">
            <span class="text-green-500">✓</span>
            <div>
              <strong>Reactive Integration:</strong> Seamless with Vue's reactivity system
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-500">✓</span>
            <div>
              <strong>Cross-Framework Sync:</strong> State shared with React and Vanilla MFEs
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-500">✓</span>
            <div>
              <strong>TypeScript Support:</strong> Full type inference without annotations
            </div>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-500">✓</span>
            <div>
              <strong>No Global Pollution:</strong> Clean encapsulation via adapters
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- State Snapshot Card -->
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Live State Snapshot</h3>
        <pre class="p-4 rounded-md bg-muted text-sm font-mono overflow-auto max-h-48">{{ stateSnapshot }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue';
import { ValtioStateManager, createValtioVueAdapter } from '@mfe/universal-state';
import type { ValtioVueAdapter } from '@mfe/universal-state';
import { getButtonClasses } from '@mfe/shared';

// Props
const props = defineProps<{
  stateManager: ValtioStateManager;
}>();

// Create adapter instance for this component
const adapter: ValtioVueAdapter = createValtioVueAdapter(props.stateManager);

// Use Valtio-enhanced state
const { value: user, setValue: setUser } = adapter.useGlobalState<{ name: string; email: string }>('user');
const { value: theme, setValue: setTheme } = adapter.useGlobalState<'light' | 'dark'>('theme');
const { value: counter, setValue: setCounter } = adapter.useGlobalState<number>('sharedCounter');
const store = adapter.useStore();

// Local state
const formData = reactive({ name: '', email: '' });
const stateSnapshot = store;

// Register MFE on mount, cleanup on unmount
onMounted(() => {
  props.stateManager.registerMFE('state-demo-vue-valtio', {
    version: '2.0.0',
    framework: 'vue',
    features: ['valtio-adapter', 'reactive-store', 'type-safe'],
  });
});

onUnmounted(() => {
  props.stateManager.unregisterMFE('state-demo-vue-valtio');
});

// Methods
const updateUser = () => {
  if (formData.name && formData.email) {
    setUser({ name: formData.name, email: formData.email });
    formData.name = '';
    formData.email = '';
  }
};

const toggleTheme = () => {
  setTheme(theme.value === 'dark' ? 'light' : 'dark');
};

const incrementCounter = () => {
  setCounter((counter.value || 0) + 1);
};
</script>