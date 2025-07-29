<template>
  <div class="space-y-6 p-6">
    <div>
      <h2 class="text-2xl font-bold">Vue State Demo</h2>
      <p class="text-muted-foreground">Demonstrating cross-framework state synchronization</p>
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
                <p class="text-sm text-muted-foreground">Applies to all MFEs</p>
              </div>
              <div class="text-2xl">
                {{ theme === 'dark' ? '🌙' : '☀️' }}
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
              <p class="text-sm text-muted-foreground mt-1">Synchronized value</p>
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
    
    <!-- State Snapshot Card -->
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">State Snapshot</h3>
        <pre class="p-4 rounded-md bg-muted text-sm font-mono overflow-auto max-h-48">{{ stateSnapshot }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue';
import { VueAdapter } from '@mfe/universal-state';
import type { StateManager } from '@mfe/universal-state';
import { getButtonClasses } from '@mfe/shared';

// Props
const props = defineProps<{
  stateManager: StateManager;
}>();

// Create adapter
const adapter = new VueAdapter(props.stateManager);

// Use global states
const userState = adapter.useGlobalState<{ name: string; email: string }>('user');
const user = userState.value;
const setUser = userState.setValue;

const themeState = adapter.useGlobalState<'light' | 'dark'>('theme');
const theme = themeState.value;
const setTheme = themeState.setValue;

const counterState = adapter.useGlobalState<number>('sharedCounter');
const counter = counterState.value;
const setCounter = counterState.setValue;

// Local state
const formData = reactive({ name: '', email: '' });
const stateSnapshot = ref('');

// Register MFE
adapter.useMFERegistration('state-demo-vue', {
  version: '1.0.0',
  features: ['user-management', 'theme-switcher', 'counter']
});

// Update state snapshot
const updateStateSnapshot = () => {
  stateSnapshot.value = JSON.stringify(props.stateManager.getSnapshot(), null, 2);
};

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

// Initialize and subscribe to state changes
onMounted(() => {
  // Initialize state snapshot
  updateStateSnapshot();
  
  // Subscribe to all state changes to update snapshot
  props.stateManager.subscribeAll((event) => {
    console.log(`[Vue MFE] State changed: ${event.key} =`, event.value);
    updateStateSnapshot();
  });
});
</script>

