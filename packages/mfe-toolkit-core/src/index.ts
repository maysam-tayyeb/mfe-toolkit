// Service Registry (New Architecture)
export * from './services/registry';

// Types and Interfaces (used by MFEs - zero runtime cost)
export * from './types/events';
export * from './types';
export * from './types/error-reporter';

// Service Implementations (tree-shakable - only used ones get bundled)
// These are reference implementations that containers can use or replace
export * from './implementations';

// MFE Registry (Not deprecated - this is configuration, not a service)
export {
  createMFERegistry,
  MFERegistryService,
  type RegistryConfig,
  type RegistryOptions,
} from './services/mfe-registry';
export {
  ManifestValidator,
  manifestValidator,
  type ValidationResult,
} from './services/manifest-validator';

// Utilities
export * from './utils';
