// Core exports
export { UniversalStateManager } from './core/state-manager';

// Type exports
export * from './types';

// Adapter exports
export { ReactAdapter } from './adapters/react';
export { VueAdapter } from './adapters/vue';

// Factory function for easy setup
import { UniversalStateManager } from './core/state-manager';
import { StateManagerConfig } from './types';

export function createStateManager(config?: StateManagerConfig) {
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
