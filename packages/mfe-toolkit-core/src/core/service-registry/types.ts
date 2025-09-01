/**
 * Service Registry Types
 * Provides type definitions for the service registry system
 */

import type { Logger } from '../../services/types/logger';
import type { EventBus, EventPayload } from '../../services/types/event-bus';

// Re-export for backward compatibility
export type { Logger, EventBus, EventPayload };

/**
 * Service metadata for registry entries
 */
export interface ServiceMetadata {
  /** Service version */
  version?: string;
  /** Whether this service is required */
  required?: boolean;
  /** Services this service depends on */
  dependencies?: string[];
  /** Package name that provides this service */
  package?: string;
  /** Human-readable description */
  description?: string;
  /** Service category */
  category?: 'core' | 'ui' | 'data' | 'integration' | 'utility';
}

/**
 * Service provider interface for lazy initialization
 */
export interface ServiceProvider<T = any> {
  /** Unique name for this service */
  name: string;
  /** Service version */
  version: string;
  /** Services this provider depends on */
  dependencies?: string[];
  /** Create the service instance */
  create(container: ServiceContainer): T | Promise<T>;
  /** Cleanup when service is disposed */
  dispose?: () => void | Promise<void>;
}

/**
 * Service information for discovery
 */
export interface ServiceInfo {
  name: string;
  version?: string;
  status: 'registered' | 'initializing' | 'ready' | 'error';
  metadata?: ServiceMetadata;
  error?: Error;
}

/**
 * Options for service registration
 */
export interface RegisterOptions {
  /** Override existing service */
  override?: boolean;
  /** Metadata for the service */
  metadata?: ServiceMetadata;
}

/**
 * Base service map - extend this interface to add type safety
 */
export interface ServiceMap {
  // Core services always available
  logger: Logger;
  eventBus: EventBus;
  errorReporter?: import('../../types/error-reporter').ErrorReporter;
  
  // UI Services
  modal?: import('../../types/modal').ModalService;
  notification?: import('../../types/notification').NotificationService;
  
  // User Services
  auth?: import('../../types/authentication').AuthService;
  authz?: import('../../types/authorization').AuthorizationService;
  
  // Application Services
  theme?: import('../../types/theme').ThemeService;
  analytics?: import('../../types/analytics').AnalyticsService;
  
  // Extended by service packages via module augmentation
}


/**
 * Service container interface
 */
export interface ServiceContainer {
  /**
   * Get a service by name (returns undefined if not found)
   */
  get<K extends keyof ServiceMap>(name: K): ServiceMap[K] | undefined;

  /**
   * Require a service by name (throws if not found)
   */
  require<K extends keyof ServiceMap>(name: K): ServiceMap[K];

  /**
   * Check if a service exists
   */
  has(name: string): boolean;

  /**
   * List all available services
   */
  listAvailable(): ServiceInfo[];

  /**
   * Get all services as a map
   */
  getAllServices(): ServiceMap;

  /**
   * Create a scoped container with overrides
   */
  createScoped(overrides: Record<string, any>): ServiceContainer;

  /**
   * Dispose of the container and its services
   */
  dispose(): Promise<void>;
}

/**
 * Service registry interface
 */
export interface ServiceRegistry {
  /**
   * Register a service instance
   */
  register<T>(name: string, service: T, options?: RegisterOptions): void;

  /**
   * Register a service provider for lazy initialization
   */
  registerProvider(provider: ServiceProvider, options?: RegisterOptions): void;

  /**
   * Get a service by name
   */
  get<T = any>(name: string): T | undefined;

  /**
   * Check if a service is registered
   */
  has(name: string): boolean;

  /**
   * List all registered services
   */
  listServices(): ServiceInfo[];

  /**
   * Get service metadata
   */
  getMetadata(name: string): ServiceMetadata | undefined;

  /**
   * Initialize all providers
   */
  initialize(): Promise<void>;

  /**
   * Create a service container from this registry
   */
  createContainer(): ServiceContainer;

  /**
   * Dispose of all services
   */
  dispose(): Promise<void>;
}

/**
 * MFE Module interface using the new service container
 */
export interface MFEModule {
  /**
   * Module metadata
   */
  metadata?: {
    name: string;
    version: string;
    requiredServices?: string[];
    optionalServices?: string[];
  };

  /**
   * Mount the MFE
   */
  mount(element: HTMLElement, container: ServiceContainer): void | Promise<void>;

  /**
   * Unmount the MFE
   */
  unmount(container: ServiceContainer): void | Promise<void>;
}
