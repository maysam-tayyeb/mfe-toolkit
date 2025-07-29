<template>
  <div :style="containerStyle">
    <h2>Vue State Demo</h2>
    
    <div style="margin-bottom: 20px">
      <h3>User Info</h3>
      <p v-if="user">Name: {{ user.name }}, Email: {{ user.email }}</p>
      <p v-else>No user set</p>
      <input
        v-model="formData.name"
        type="text"
        placeholder="Name"
        style="margin-right: 10px"
      />
      <input
        v-model="formData.email"
        type="email"
        placeholder="Email"
        style="margin-right: 10px"
      />
      <button @click="updateUser">Update User</button>
    </div>

    <div style="margin-bottom: 20px">
      <h3>Theme: {{ theme }}</h3>
      <button @click="toggleTheme">Toggle Theme</button>
    </div>

    <div>
      <h3>Shared Counter: {{ counter }}</h3>
      <button @click="incrementCounter">Increment</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SimpleApp',
  props: {
    stateManager: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      user: null,
      theme: 'light',
      counter: 0,
      formData: {
        name: '',
        email: ''
      },
      unsubscribers: []
    };
  },
  computed: {
    containerStyle() {
      return {
        padding: '20px',
        backgroundColor: this.theme === 'dark' ? '#1a1a1a' : '#ffffff',
        color: this.theme === 'dark' ? '#ffffff' : '#000000',
        minHeight: '300px',
        borderRadius: '8px'
      };
    }
  },
  mounted() {
    if (!this.stateManager) {
      console.error('No state manager provided');
      return;
    }

    // Initialize with current values
    this.user = this.stateManager.get('user');
    this.theme = this.stateManager.get('theme') || 'light';
    this.counter = this.stateManager.get('sharedCounter') || 0;

    // Subscribe to changes
    const unsubUser = this.stateManager.subscribe('user', (value) => {
      console.log('[Vue MFE] User changed:', value);
      this.user = value;
    });

    const unsubTheme = this.stateManager.subscribe('theme', (value) => {
      console.log('[Vue MFE] Theme changed:', value);
      this.theme = value || 'light';
    });

    const unsubCounter = this.stateManager.subscribe('sharedCounter', (value) => {
      console.log('[Vue MFE] Counter changed:', value);
      this.counter = value || 0;
    });

    this.unsubscribers = [unsubUser, unsubTheme, unsubCounter];
  },
  beforeUnmount() {
    // Cleanup subscriptions
    this.unsubscribers.forEach(unsub => unsub());
  },
  methods: {
    updateUser() {
      if (this.formData.name && this.formData.email) {
        this.stateManager.set('user', { ...this.formData }, 'vue-mfe');
        this.formData.name = '';
        this.formData.email = '';
      }
    },
    toggleTheme() {
      const newTheme = this.theme === 'dark' ? 'light' : 'dark';
      this.stateManager.set('theme', newTheme, 'vue-mfe');
    },
    incrementCounter() {
      this.stateManager.set('sharedCounter', this.counter + 1, 'vue-mfe');
    }
  }
};
</script>