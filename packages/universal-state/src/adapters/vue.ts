import { ref, Ref, onMounted, onUnmounted, reactive, computed } from 'vue';
import { StateManager } from '../types';

export class VueAdapter {
  constructor(private stateManager: StateManager) {}
  
  /**
   * Vue 3 Composition API hook for subscribing to a specific state key
   */
  useGlobalState<T = any>(key: string): {
    value: Ref<T | undefined>;
    setValue: (value: T) => void;
  } {
    const value = ref<T | undefined>(this.stateManager.get(key));
    
    onMounted(() => {
      const unsubscribe = this.stateManager.subscribe(key, (newValue) => {
        value.value = newValue;
      });
      
      onUnmounted(unsubscribe);
    });
    
    const setValue = (newValue: T) => {
      this.stateManager.set(key, newValue, 'vue-composition');
    };
    
    return {
      value: value as Ref<T | undefined>,
      setValue
    };
  }
  
  /**
   * Vue 3 Composition API hook for subscribing to multiple state keys
   */
  useGlobalStates<T extends Record<string, any>>(keys: string[]): {
    state: T;
    setState: (updates: Partial<T>) => void;
  } {
    const state: any = reactive({});
    
    // Initialize state
    keys.forEach(key => {
      state[key] = this.stateManager.get(key);
    });
    
    onMounted(() => {
      const unsubscribes: (() => void)[] = [];
      
      keys.forEach(key => {
        const unsubscribe = this.stateManager.subscribe(key, (value) => {
          state[key] = value;
        });
        unsubscribes.push(unsubscribe);
      });
      
      onUnmounted(() => {
        unsubscribes.forEach(fn => fn());
      });
    });
    
    const setState = (updates: Partial<T>) => {
      Object.entries(updates).forEach(([key, value]) => {
        this.stateManager.set(key, value, 'vue-composition-multi');
      });
    };
    
    return {
      state: state as T,
      setState
    };
  }
  
  /**
   * Vue 3 plugin for global state management
   */
  install(app: any): void {
    // Make state manager available in all components
    app.config.globalProperties.$globalState = this.stateManager;
    
    // Provide helper methods
    app.config.globalProperties.$getGlobalState = (key: string) => {
      return this.stateManager.get(key);
    };
    
    app.config.globalProperties.$setGlobalState = (key: string, value: any) => {
      this.stateManager.set(key, value, 'vue-global');
    };
    
    // Provide composable via app.provide
    app.provide('globalStateManager', this.stateManager);
    app.provide('globalStateAdapter', this);
  }
  
  /**
   * Create a Vuex-like store interface
   */
  createStore() {
    const stateManager = this.stateManager;
    
    return {
      state: reactive(stateManager.getSnapshot()),
      
      getters: {
        get(key: string) {
          return computed(() => stateManager.get(key));
        }
      },
      
      mutations: {
        set(key: string, value: any) {
          stateManager.set(key, value, 'vue-store-mutation');
        },
        
        delete(key: string) {
          stateManager.delete(key);
        }
      },
      
      actions: {
        async set(key: string, value: any) {
          return new Promise<void>((resolve) => {
            stateManager.set(key, value, 'vue-store-action');
            resolve();
          });
        }
      },
      
      subscribe(fn: (mutation: any, state: any) => void) {
        return stateManager.subscribeAll((event) => {
          fn(
            { type: 'set', payload: { key: event.key, value: event.value } },
            stateManager.getSnapshot()
          );
        });
      }
    };
  }
  
  /**
   * Register MFE helper
   */
  useMFERegistration(mfeId: string, metadata?: any): void {
    onMounted(() => {
      this.stateManager.registerMFE(mfeId, {
        ...metadata,
        framework: 'vue'
      });
    });
    
    onUnmounted(() => {
      this.stateManager.unregisterMFE(mfeId);
    });
  }
}

// Default adapter instance
let defaultAdapter: VueAdapter | null = null;

export function setDefaultStateManager(stateManager: StateManager) {
  defaultAdapter = new VueAdapter(stateManager);
}

export function useGlobalState<T = any>(key: string) {
  if (!defaultAdapter) {
    throw new Error('No default state manager set. Call setDefaultStateManager first.');
  }
  return defaultAdapter.useGlobalState<T>(key);
}

export function useGlobalStates<T extends Record<string, any>>(keys: string[]) {
  if (!defaultAdapter) {
    throw new Error('No default state manager set. Call setDefaultStateManager first.');
  }
  return defaultAdapter.useGlobalStates<T>(keys);
}