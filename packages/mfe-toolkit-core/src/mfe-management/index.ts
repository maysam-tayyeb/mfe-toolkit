/**
 * MFE Management Module
 * Provides utilities for MFE configuration, validation, and registry management
 */

// Export MFE Registry
export {
  MFERegistryService,
  createMFERegistry,
  type RegistryConfig,
  type RegistryOptions,
} from './mfe-registry';

// Export Manifest Validator
export {
  ManifestValidator,
  manifestValidator,
  type ValidationResult,
} from './manifest-validator';