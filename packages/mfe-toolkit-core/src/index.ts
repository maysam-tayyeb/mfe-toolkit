// Core Infrastructure
// Service Registry
export * from './registry';

// MFE Management
export {
  createMFERegistry,
  MFERegistryService,
  type RegistryConfig,
  type RegistryOptions,
  ManifestValidator,
  manifestValidator,
  type ValidationResult,
} from './mfe-management';

// Utilities
export * from './utils';

// Domain Types (data/configuration types - used by MFEs)
export * from './domain';

// Service Types (interface definitions - zero runtime cost)
export * from './services/types';

// Service Implementations (tree-shakable - only used ones get bundled)
// These are reference implementations that containers can use or replace
export * from './services/implementations';
