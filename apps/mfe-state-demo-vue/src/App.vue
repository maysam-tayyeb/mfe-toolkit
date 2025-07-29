<template>
  <div :class="`p-6 rounded-lg transition-colors ${
    theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-900'
  }`">
    <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
      <span class="text-2xl">💚</span>
      Vue State Demo
    </h2>
    
    <!-- User Management Section -->
    <div :class="`mb-6 p-4 rounded-md ${
      theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm'
    }`">
      <h3 class="text-lg font-medium mb-3">User Info</h3>
      <div :class="`mb-3 p-3 rounded ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
      }`">
        <div v-if="user" class="flex items-center gap-2">
          <span>👤</span>
          <span class="font-medium">{{ user.name }}</span>
          <span class="text-sm opacity-75">({{ user.email }})</span>
        </div>
        <p v-else class="text-gray-500">No user set</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <input
          v-model="formData.name"
          type="text"
          placeholder="Name"
          :class="`flex-1 min-w-[150px] px-3 py-2 rounded-md border transition-colors ${
            theme === 'dark' 
              ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`"
        />
        <input
          v-model="formData.email"
          type="email"
          placeholder="Email"
          :class="`flex-1 min-w-[150px] px-3 py-2 rounded-md border transition-colors ${
            theme === 'dark' 
              ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`"
        />
        <button @click="updateUser" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
          Update User
        </button>
      </div>
    </div>
    
    <!-- Theme Switcher Section -->
    <div :class="`mb-6 p-4 rounded-md ${
      theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm'
    }`">
      <h3 class="text-lg font-medium mb-3">Theme Settings</h3>
      <div class="flex items-center gap-3 mb-3">
        <span class="text-gray-600 dark:text-gray-400">Current theme:</span>
        <span class="font-medium flex items-center gap-2">
          <template v-if="theme === 'dark'">🌙 Dark</template>
          <template v-else>☀️ Light</template>
        </span>
      </div>
      <button @click="toggleTheme" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors">
        Toggle Theme
      </button>
    </div>
    
    <!-- Shared Counter Section -->
    <div :class="`p-4 rounded-md ${
      theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-sm'
    }`">
      <h3 class="text-lg font-medium mb-3">Shared Counter</h3>
      <div class="flex items-center gap-4">
        <span class="text-gray-600 dark:text-gray-400">Value:</span>
        <span class="text-2xl font-bold min-w-[40px] text-center">{{ counter || 0 }}</span>
        <button @click="incrementCounter" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
          Increment
        </button>
      </div>
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

const cartState = adapter.useGlobalState<string[]>('cartItems');
const cartItems = cartState.value;
const setCartItems = cartState.setValue;

// Local state
const formData = reactive({ name: '', email: '' });
const newItem = ref('');

// Register MFE
adapter.useMFERegistration('state-demo-vue', {
  version: '1.0.0',
  features: ['user-management', 'theme-switcher', 'counter', 'shopping-cart']
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

const addToCart = () => {
  if (newItem.value) {
    const currentItems = cartItems.value || [];
    setCartItems([...currentItems, newItem.value]);
    newItem.value = '';
  }
};

const removeFromCart = (index: number) => {
  const currentItems = cartItems.value || [];
  setCartItems(currentItems.filter((_, i) => i !== index));
};

// Log state changes
onMounted(() => {
  props.stateManager.subscribeAll((event) => {
    console.log(`[Vue MFE] State changed: ${event.key} =`, event.value);
  });
});
</script>

