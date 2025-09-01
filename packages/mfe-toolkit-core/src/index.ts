// Core Infrastructure
// Service Registry (New Architecture)
export * from './core/service-registry';

// MFE Management
export {
  createMFERegistry,
  MFERegistryService,
  type RegistryConfig,
  type RegistryOptions,
  ManifestValidator,
  manifestValidator,
  type ValidationResult,
} from './core/mfe-management';

// Utilities
export * from './core/utils';

// Types and Interfaces (used by MFEs - zero runtime cost)
export * from './types/events';
export * from './types';
export * from './types/error-reporter';
export * from './types/modal';
export * from './types/notification';
export * from './types/authentication';
export * from './types/authorization';
export * from './types/theme';
export * from './types/analytics';

// Service Types (new location)
export * from './services/types';

// Service Implementations (tree-shakable - only used ones get bundled)
// These are reference implementations that containers can use or replace
export * from './implementations';
