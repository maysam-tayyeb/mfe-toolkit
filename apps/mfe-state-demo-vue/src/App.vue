<template>
  <div :style="containerStyle">
    <h2>Vue MFE - State Demo</h2>
    <p>This MFE demonstrates framework-agnostic state management using Vue 3.</p>
    
    <!-- User Management Section -->
    <div class="section">
      <h3>User Management</h3>
      <div v-if="user">
        <p><strong>Current User:</strong></p>
        <p>Name: {{ user.name }}</p>
        <p>Email: {{ user.email }}</p>
      </div>
      <p v-else>No user logged in</p>
      
      <div class="form-group">
        <input
          v-model="formData.name"
          type="text"
          placeholder="Name"
          :style="inputStyle"
        />
        <input
          v-model="formData.email"
          type="email"
          placeholder="Email"
          :style="inputStyle"
        />
        <button @click="updateUser" class="btn btn-primary">
          Update User
        </button>
      </div>
    </div>
    
    <!-- Theme Switcher Section -->
    <div class="section">
      <h3>Theme Switcher</h3>
      <p>Current theme: <strong>{{ theme || 'light' }}</strong></p>
      <button @click="toggleTheme" :class="['btn', theme === 'dark' ? 'btn-light' : 'btn-dark']">
        Toggle Theme
      </button>
    </div>
    
    <!-- Shared Counter Section -->
    <div class="section">
      <h3>Shared Counter</h3>
      <p>This counter is shared across all MFEs:</p>
      <p class="counter">{{ counter || 0 }}</p>
      <button @click="incrementCounter" class="btn btn-success">
        Increment
      </button>
    </div>
    
    <!-- Shopping Cart Demo -->
    <div class="section">
      <h3>Shopping Cart (Vue-specific)</h3>
      <p>Cart items: {{ cartItems?.length || 0 }}</p>
      <div class="form-group">
        <input
          v-model="newItem"
          type="text"
          placeholder="Item name"
          :style="inputStyle"
        />
        <button @click="addToCart" class="btn btn-primary">
          Add to Cart
        </button>
      </div>
      <ul v-if="cartItems?.length">
        <li v-for="(item, index) in cartItems" :key="index">
          {{ item }}
          <button @click="removeFromCart(index)" class="btn-small">Remove</button>
        </li>
      </ul>
    </div>
    
    <!-- State Snapshot -->
    <div class="section">
      <h3>Current State Snapshot</h3>
      <pre :style="preStyle">{{ stateSnapshot }}</pre>
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

// Computed styles
const containerStyle = computed(() => ({
  padding: '20px',
  backgroundColor: theme.value === 'dark' ? '#1a1a1a' : '#ffffff',
  color: theme.value === 'dark' ? '#ffffff' : '#000000',
  minHeight: '400px',
  borderRadius: '8px',
  transition: 'all 0.3s ease'
}));

const inputStyle = computed(() => ({
  padding: '5px',
  marginRight: '10px',
  backgroundColor: theme.value === 'dark' ? '#333' : '#fff',
  color: theme.value === 'dark' ? '#fff' : '#000',
  border: '1px solid #ccc',
  borderRadius: '4px'
}));

const preStyle = computed(() => ({
  backgroundColor: theme.value === 'dark' ? '#333' : '#f5f5f5',
  padding: '10px',
  borderRadius: '4px',
  overflow: 'auto',
  fontSize: '12px'
}));

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

<style scoped>
.section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group {
  margin-top: 10px;
}

.btn {
  padding: 5px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-light {
  background-color: #f8f9fa;
  color: #000;
}

.btn-dark {
  background-color: #343a40;
  color: #fff;
}

.btn-small {
  padding: 2px 8px;
  font-size: 12px;
  margin-left: 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.counter {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}

input {
  outline: none;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 5px 0;
}
</style>