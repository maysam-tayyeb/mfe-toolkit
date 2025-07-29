<template>
  <div class="space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">💚 Vue State Demo</h2>
      <p class="text-muted-foreground mt-2">This MFE demonstrates framework-agnostic state management.</p>
    </div>
    
    <!-- User Management Section -->
    <div class="border rounded-lg p-6 space-y-4">
      <h2 class="text-xl font-semibold">User Management</h2>
      <div class="bg-muted/50 rounded-lg p-4">
        <div v-if="user" class="space-y-1">
          <p class="text-sm font-medium">Current User:</p>
          <p class="text-sm text-muted-foreground">Name: {{ user.name }}</p>
          <p class="text-sm text-muted-foreground">Email: {{ user.email }}</p>
        </div>
        <p v-else class="text-sm text-muted-foreground">No user logged in</p>
      </div>
      
      <div class="flex flex-wrap gap-2">
        <input
          v-model="formData.name"
          type="text"
          placeholder="Name"
          class="w-full px-3 py-2 border rounded-md text-sm flex-1 min-w-[150px]"
        />
        <input
          v-model="formData.email"
          type="email"
          placeholder="Email"
          class="w-full px-3 py-2 border rounded-md text-sm flex-1 min-w-[150px]"
        />
        <button 
          @click="updateUser" 
          class="inline-flex items-center justify-center h-9 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Update User
        </button>
      </div>
    </div>
    
    <!-- Theme Switcher Section -->
    <div class="border rounded-lg p-6 space-y-4">
      <h2 class="text-xl font-semibold">Theme Settings</h2>
      <div class="flex items-center gap-3">
        <span class="text-sm text-muted-foreground">Current theme:</span>
        <span class="text-sm font-medium">
          {{ theme === 'dark' ? '🌙 Dark' : '☀️ Light' }}
        </span>
      </div>
      <button 
        @click="toggleTheme" 
        class="inline-flex items-center justify-center h-9 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
      >
        Toggle Theme
      </button>
    </div>
    
    <!-- Shared Counter Section -->
    <div class="border rounded-lg p-6 space-y-4">
      <h2 class="text-xl font-semibold">Shared Counter</h2>
      <p class="text-sm text-muted-foreground">This counter is shared across all MFEs:</p>
      <div class="flex items-center gap-4">
        <span class="text-sm text-muted-foreground">Value:</span>
        <span class="text-3xl font-bold min-w-[40px] text-center">{{ counter || 0 }}</span>
        <button 
          @click="incrementCounter" 
          class="inline-flex items-center justify-center h-9 px-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Increment
        </button>
      </div>
    </div>
    
    <!-- State Snapshot -->
    <div class="border rounded-lg p-6 space-y-4">
      <h2 class="text-xl font-semibold">Current State Snapshot</h2>
      <pre class="w-full px-3 py-2 border rounded-md text-sm font-mono text-xs h-32 overflow-auto">{{ stateSnapshot }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue';
import { VueAdapter } from '@mfe/universal-state';
import type { StateManager } from '@mfe/universal-state';

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

