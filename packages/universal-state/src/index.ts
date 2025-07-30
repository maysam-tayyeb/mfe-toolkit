// Core exports - UniversalStateManager with Valtio implementation
export { UniversalStateManager } from './core/universal-state-manager';
export { UniversalStateManager as StateManager } from './core/universal-state-manager';
// Legacy export for backward compatibility
export { UniversalStateManager as ValtioStateManager } from './core/universal-state-manager';

// Type exports
export * from './types';

// Adapter exports
export { ReactAdapter } from './adapters/react';
export { VueAdapter } from './adapters/vue';

// Valtio adapter exports with specific names to avoid conflicts
export type { ValtioReactAdapter } from './adapters/valtio-react';
export {
  createValtioReactAdapter,
  setGlobalValtioStateManager as setGlobalValtioStateManagerReact,
  useValtioGlobalState,
  useValtioGlobalStates,
  useValtioGlobalStateListener,
  useValtioMFERegistration,
  useValtioStore,
} from './adapters/valtio-react';

export type { ValtioVueAdapter } from './adapters/valtio-vue';
export {
  createValtioVueAdapter,
  setGlobalValtioStateManager as setGlobalValtioStateManagerVue,
  useValtioGlobalState as useValtioGlobalStateVue,
  useValtioGlobalStates as useValtioGlobalStatesVue,
  useValtioGlobalStateListener as useValtioGlobalStateListenerVue,
  useValtioMFERegistration as useValtioMFERegistrationVue,
  useValtioStore as useValtioStoreVue,
} from './adapters/valtio-vue';

// Factory function for easy setup
import { UniversalStateManager } from './core/universal-state-manager';
import { StateManagerConfig } from './types';

export function createStateManager(config?: StateManagerConfig): UniversalStateManager {
  return new UniversalStateManager(config);
}

// Global singleton instance (optional)
let globalInstance: UniversalStateManager | null = null;

export function getGlobalStateManager(config?: StateManagerConfig): UniversalStateManager {
  if (!globalInstance) {
    globalInstance = new UniversalStateManager(config);
  }
  return globalInstance;
}

// Middleware helpers
export const loggingMiddleware = (event: any, next: () => void) => {
  console.log('[State Change]', event);
  next();
};

export const validationMiddleware = (validators: Record<string, (value: any) => boolean>) => {
  return (event: any, next: () => void) => {
    const validator = validators[event.key];
    if (validator && !validator(event.value)) {
      console.error(`Validation failed for key "${event.key}":`, event.value);
      return;
    }
    next();
  };
};
