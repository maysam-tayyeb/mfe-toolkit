/**
 * MFE Manifest Types
 *
 * Comprehensive type definitions for MFE manifests with full type safety,
 * validation support, and extensibility.
 */

/**
 * Semantic version string (e.g., "1.2.3", "2.0.0-beta.1")
 */
type SemanticVersion = string;

/**
 * Version range string (e.g., "^1.0.0", ">=2.0.0 <3.0.0")
 */
type VersionRange = string;

/**
 * MFE dependency information
 */
export interface MFEDependencies {
  /** Runtime dependencies required for the MFE to function */
  runtime: Record<string, VersionRange>;

  /** Peer dependencies that must be provided by the container */
  peer: Record<string, VersionRange>;

  /** Optional dependencies that enhance functionality if available */
  optional?: Record<string, VersionRange>;

  /** Development dependencies (for documentation purposes) */
  dev?: Record<string, VersionRange>;
}

/**
 * Browser and environment compatibility
 */
export interface MFECompatibility {
  /** Minimum container version required */
  container: VersionRange;

  /** Browser compatibility requirements */
  browsers?: {
    chrome?: string;
    firefox?: string;
    safari?: string;
    edge?: string;
  };

  /** Node.js version for SSR support */
  node?: VersionRange;

  /** Framework versions */
  frameworks?: {
    react?: VersionRange;
    vue?: VersionRange;
    angular?: VersionRange;
    'solid-js'?: VersionRange;
  };
}

/**
 * MFE capabilities declaration
 */
export interface MFECapabilities {
  /** Services this MFE provides to other MFEs */
  provides?: {
    services?: string[];
    components?: string[];
    hooks?: string[];
  };

  /** Events this MFE emits */
  emits?: string[];

  /** Events this MFE listens to */
  listens?: string[];

  /** Routes this MFE manages */
  routes?: Array<{
    path: string;
    exact?: boolean;
    public?: boolean;
  }>;

  /** Features this MFE implements */
  features?: string[];
}

/**
 * MFE requirements from the container
 */
export interface MFERequirements {
  /** Required container services */
  services: Array<{
    name: string;
    version?: VersionRange;
    optional?: boolean;
  }>;

  /** Required permissions */
  permissions?: string[];

  /** Resource limits */
  resources?: {
    memory?: string; // e.g., "100MB"
    cpu?: number; // e.g., 0.5 for 50% of one CPU
    storage?: string; // e.g., "10MB"
  };

  /** Required container features */
  features?: string[];
}

/**
 * MFE metadata for display and documentation
 */
export interface MFEMetadata {
  /** Display name for UI */
  displayName: string;

  /** Short description */
  description: string;

  /** Icon (emoji, URL, or icon name) */
  icon?: string;

  /** Author information */
  author?: {
    name: string;
    email?: string;
    url?: string;
  };

  /** License */
  license?: string;

  /** Repository URL */
  repository?: string;

  /** Documentation URL */
  documentation?: string;

  /** Tags for categorization */
  tags?: string[];

  /** Category */
  category?: string;

  /** Preview image URL */
  preview?: string;
}

/**
 * MFE configuration options
 */
export interface MFEConfig {
  /** Loading configuration */
  loading?: {
    /** Loading timeout in milliseconds */
    timeout?: number;

    /** Number of retry attempts */
    retries?: number;

    /** Retry delay in milliseconds */
    retryDelay?: number;

    /** Loading priority (higher = load first) */
    priority?: number;

    /** Preload this MFE */
    preload?: boolean;

    /** Load on demand only */
    lazy?: boolean;
  };

  /** Runtime configuration */
  runtime?: {
    /** Isolation mode */
    isolation?: 'none' | 'iframe' | 'shadow-dom' | 'web-component';

    /** Sandbox restrictions (for iframe isolation) */
    sandbox?: string[];

    /** Keep alive when not visible */
    keepAlive?: boolean;

    /** Single instance only */
    singleton?: boolean;
  };

  /** Communication configuration */
  communication?: {
    /** Event namespacing */
    eventNamespace?: string;

    /** Allowed event patterns */
    allowedEvents?: string[];

    /** Message timeout */
    messageTimeout?: number;
  };

  /** Custom configuration */
  custom?: Record<string, unknown>;
}

/**
 * MFE security configuration
 */
export interface MFESecurity {
  /** Content Security Policy directives */
  csp?: {
    'default-src'?: string[];
    'script-src'?: string[];
    'style-src'?: string[];
    'connect-src'?: string[];
    'img-src'?: string[];
    'font-src'?: string[];
    'frame-src'?: string[];
  };

  /** Allowed origins for CORS */
  allowedOrigins?: string[];

  /** Required permissions */
  permissions?: {
    required: string[];
    optional?: string[];
  };

  /** Integrity hash for verification */
  integrity?: string;

  /** Signature for authenticity verification */
  signature?: string;
}

/**
 * MFE lifecycle hooks configuration
 */
export interface MFELifecycle {
  /** Pre-load hook URL */
  preLoad?: string;

  /** Post-load hook URL */
  postLoad?: string;

  /** Pre-mount hook */
  preMount?: {
    url?: string;
    timeout?: number;
  };

  /** Post-mount hook */
  postMount?: {
    url?: string;
    timeout?: number;
  };

  /** Pre-unmount hook */
  preUnmount?: {
    url?: string;
    timeout?: number;
  };

  /** Health check endpoint */
  healthCheck?: {
    url: string;
    interval?: number;
    timeout?: number;
  };
}

/**
 * Complete MFE Manifest
 */
export interface MFEManifest {
  /** Manifest schema version */
  $schema?: string;

  /** Unique MFE identifier */
  name: string;

  /** MFE version (semantic versioning) */
  version: SemanticVersion;

  /** MFE bundle URL */
  url: string;

  /** Alternative URLs for fallback */
  alternativeUrls?: string[];

  /** Dependencies and compatibility */
  dependencies: MFEDependencies;
  compatibility: MFECompatibility;

  /** Capabilities and requirements */
  capabilities?: MFECapabilities;
  requirements: MFERequirements;

  /** Metadata for display */
  metadata: MFEMetadata;

  /** Configuration options */
  config?: MFEConfig;

  /** Security settings */
  security?: MFESecurity;

  /** Lifecycle hooks */
  lifecycle?: MFELifecycle;

  /** Build information */
  build?: {
    time?: string;
    hash?: string;
    env?: string;
  };

  /** Deprecation information */
  deprecated?: {
    since: SemanticVersion;
    removeAt?: SemanticVersion;
    migration?: string;
    replacement?: string;
  };
}



/**
 * MFE Registry containing multiple manifests
 */
export interface MFERegistry {
  /** Registry schema version */
  $schema?: string;

  /** Registry version */
  version: SemanticVersion;

  /** Environment (development, staging, production) */
  environment?: string;

  /** Last update timestamp */
  lastUpdated: string;

  /** MFE manifests */
  mfes: MFEManifest[];

  /** Global configuration */
  config?: {
    /** Default loading configuration */
    defaultLoading?: MFEConfig['loading'];

    /** Default security policy */
    defaultSecurity?: MFESecurity;

    /** Feature flags */
    features?: Record<string, boolean>;
  };
}
