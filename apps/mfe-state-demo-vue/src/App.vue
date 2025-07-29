<template>
  <div :style="{
    padding: '20px',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    minHeight: '400px',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  }">
    <h2>Vue MFE - State Demo</h2>
    <p>This MFE demonstrates framework-agnostic state management.</p>
    
    <!-- User Management Section -->
    <div :style="{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }">
      <h3>User Management</h3>
      <div v-if="user">
        <p><strong>Current User:</strong></p>
        <p>Name: {{ user.name }}</p>
        <p>Email: {{ user.email }}</p>
      </div>
      <p v-else>No user logged in</p>
      
      <div :style="{ marginTop: '10px' }">
        <input
          v-model="formData.name"
          type="text"
          placeholder="Name"
          :style="{
            padding: '5px',
            marginRight: '10px',
            backgroundColor: theme === 'dark' ? '#333' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            border: '1px solid #ccc'
          }"
        />
        <input
          v-model="formData.email"
          type="email"
          placeholder="Email"
          :style="{
            padding: '5px',
            marginRight: '10px',
            backgroundColor: theme === 'dark' ? '#333' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            border: '1px solid #ccc'
          }"
        />
        <button @click="updateUser" :style="{
          padding: '5px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }">
          Update User
        </button>
      </div>
    </div>
    
    <!-- Theme Switcher Section -->
    <div :style="{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }">
      <h3>Theme Switcher</h3>
      <p>Current theme: <strong>{{ theme }}</strong></p>
      <button @click="toggleTheme" :style="{
        padding: '5px 15px',
        backgroundColor: theme === 'dark' ? '#f8f9fa' : '#343a40',
        color: theme === 'dark' ? '#000' : '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }">
        Toggle Theme
      </button>
    </div>
    
    <!-- Shared Counter Section -->
    <div :style="{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }">
      <h3>Shared Counter</h3>
      <p>This counter is shared across all MFEs:</p>
      <p :style="{ fontSize: '24px', fontWeight: 'bold' }">{{ counter || 0 }}</p>
      <button @click="incrementCounter" :style="{
        padding: '5px 15px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }">
        Increment
      </button>
    </div>
    
    <!-- State Snapshot -->
    <div :style="{ padding: '15px', border: '1px solid #ccc', borderRadius: '4px' }">
      <h3>Current State Snapshot</h3>
      <pre :style="{
        backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
        padding: '10px',
        borderRadius: '4px',
        overflow: 'auto'
      }">{{ stateSnapshot }}</pre>
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

// Register MFE
adapter.useMFERegistration('state-demo-vue', {
  version: '1.0.0',
  features: ['user-management', 'theme-switcher', 'counter']
});

const stateSnapshot = computed(() => {
  return JSON.stringify(props.stateManager.getSnapshot(), null, 2);
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

// Log state changes
onMounted(() => {
  props.stateManager.subscribeAll((event) => {
    console.log(`[Vue MFE] State changed: ${event.key} =`, event.value);
  });
});
</script>

