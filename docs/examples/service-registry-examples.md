# Service Registry Examples

This document provides practical examples of using the Service Registry architecture in various scenarios.

## Table of Contents

1. [MFE-Specific Service Isolation](#mfe-specific-service-isolation)
2. [Testing with Mocked Services](#testing-with-mocked-services)
3. [Multi-Tenant Configuration](#multi-tenant-configuration)
4. [Performance Monitoring](#performance-monitoring)
5. [Debug Mode](#debug-mode)
6. [Feature Flags](#feature-flags)
7. [A/B Testing](#ab-testing)
8. [Service Decoration](#service-decoration)

## MFE-Specific Service Isolation

Each MFE can have its own isolated set of services, preventing interference between MFEs:

```typescript
import { 
  createServiceRegistry,
  createLogger,
  createEventBus,
  createErrorReporter
} from '@mfe-toolkit/core';

// Main container setup
const registry = createServiceRegistry();
registry.register('logger', createLogger('container'));
registry.register('eventBus', createEventBus());
registry.register('errorReporter', createErrorReporter());

const mainContainer = registry.createContainer();

// Function to mount MFEs with isolation
async function mountMFE(mfeName: string, element: HTMLElement, mfeModule: any) {
  // Create isolated container for this MFE
  const mfeContainer = mainContainer.createScoped({
    // MFE-specific logger with contextual prefix
    logger: createLogger(`[${mfeName}]`),
    
    // Scoped error reporter with MFE context
    errorReporter: createErrorReporter({
      context: {
        mfe: mfeName,
        version: mfeModule.version,
        mountTime: new Date().toISOString()
      }
    }),
    
    // Isolated event bus channel
    eventBus: mainContainer.get('eventBus').createChannel(mfeName),
    
    // MFE-specific configuration
    config: {
      apiUrl: `/api/mfe/${mfeName}`,
      features: getFeatureFlagsForMFE(mfeName)
    }
  });
  
  // Mount MFE with its isolated container
  await mfeModule.mount(element, mfeContainer);
  
  // Track mounted MFE
  mfeContainer.get('logger').info(`MFE ${mfeName} mounted successfully`);
  
  return () => {
    // Cleanup on unmount
    mfeModule.unmount(mfeContainer);
    mfeContainer.dispose();
  };
}
```

## Testing with Mocked Services

Create test containers with mocked services for unit and integration testing:

```typescript
import { createServiceContainer } from '@mfe-toolkit/core';

// Test utilities
export function createTestContainer(overrides = {}) {
  // Base mock services
  const mockServices = {
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    },
    
    eventBus: {
      emit: jest.fn(),
      on: jest.fn(() => jest.fn()), // Returns unsubscribe function
      off: jest.fn(),
      once: jest.fn()
    },
    
    notification: {
      show: jest.fn(),
      hide: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    },
    
    modal: {
      open: jest.fn(),
      close: jest.fn(),
      confirm: jest.fn(() => Promise.resolve(true))
    },
    
    auth: {
      isAuthenticated: jest.fn(() => true),
      getUser: jest.fn(() => ({ id: 'test-user', name: 'Test User' })),
      login: jest.fn(() => Promise.resolve()),
      logout: jest.fn()
    },
    
    ...overrides
  };
  
  return createServiceContainer(mockServices);
}

// Example test
describe('UserProfile Component', () => {
  let container;
  let component;
  
  beforeEach(() => {
    container = createTestContainer({
      // Override specific services for this test
      auth: {
        isAuthenticated: jest.fn(() => true),
        getUser: jest.fn(() => ({
          id: '123',
          name: 'John Doe',
          email: 'john@example.com'
        }))
      }
    });
  });
  
  it('should display user information', () => {
    component = new UserProfile(container);
    component.render();
    
    const auth = container.get('auth');
    expect(auth.getUser).toHaveBeenCalled();
    expect(component.getUserName()).toBe('John Doe');
  });
  
  it('should handle logout', async () => {
    component = new UserProfile(container);
    await component.logout();
    
    const auth = container.get('auth');
    const notification = container.get('notification');
    
    expect(auth.logout).toHaveBeenCalled();
    expect(notification.info).toHaveBeenCalledWith('You have been logged out');
  });
});
```

## Multi-Tenant Configuration

Configure services differently based on tenant context:

```typescript
import { 
  createServiceRegistry,
  createSingletonProvider 
} from '@mfe-toolkit/core';

// Tenant configuration
interface TenantConfig {
  id: string;
  name: string;
  apiUrl: string;
  theme: Theme;
  features: string[];
  limits: {
    maxUsers: number;
    maxStorage: number;
  };
}

// Create tenant-specific container
function createTenantContainer(tenant: TenantConfig, userId: string) {
  const registry = createServiceRegistry();
  
  // Register tenant-specific API client
  registry.registerProvider(createSingletonProvider({
    name: 'api',
    version: '1.0.0',
    factory: () => {
      return new ApiClient({
        baseUrl: tenant.apiUrl,
        headers: {
          'X-Tenant-ID': tenant.id,
          'X-User-ID': userId
        },
        timeout: 30000
      });
    }
  }));
  
  // Register tenant-specific auth service
  registry.registerProvider(createSingletonProvider({
    name: 'auth',
    version: '1.0.0',
    dependencies: ['api'],
    factory: (container) => {
      const api = container.require('api');
      return new TenantAuthService({
        api,
        tenantId: tenant.id,
        userId,
        permissions: getTenantPermissions(tenant.id, userId)
      });
    }
  }));
  
  // Register tenant theme service
  registry.register('theme', new ThemeService(tenant.theme));
  
  // Register feature flag service
  registry.register('features', new FeatureFlagService(tenant.features));
  
  // Register tenant-specific storage with limits
  registry.registerProvider(createSingletonProvider({
    name: 'storage',
    version: '1.0.0',
    factory: () => {
      return new QuotaStorage({
        maxSize: tenant.limits.maxStorage,
        namespace: `tenant:${tenant.id}:user:${userId}`
      });
    }
  }));
  
  // Initialize and return container
  await registry.initialize();
  return registry.createContainer();
}

// Usage in application
async function initializeApp(tenantId: string, userId: string) {
  const tenant = await fetchTenantConfig(tenantId);
  const container = await createTenantContainer(tenant, userId);
  
  // All services are now tenant-aware
  const auth = container.require('auth');
  const theme = container.require('theme');
  const features = container.require('features');
  
  // Apply tenant theme
  theme.apply();
  
  // Check tenant-specific features
  if (features.isEnabled('advanced-analytics')) {
    loadAnalyticsModule(container);
  }
  
  return container;
}
```

## Performance Monitoring

Wrap services with performance monitoring:

```typescript
import { createServiceContainer } from '@mfe-toolkit/core';

// Performance monitor wrapper
function withPerformanceMonitoring<T extends object>(
  service: T,
  serviceName: string,
  monitor: PerformanceMonitor
): T {
  return new Proxy(service, {
    get(target, prop) {
      const value = target[prop as keyof T];
      
      if (typeof value === 'function') {
        return async (...args: any[]) => {
          const startTime = performance.now();
          const traceId = generateTraceId();
          
          monitor.startTrace(traceId, {
            service: serviceName,
            method: String(prop),
            args: args.length
          });
          
          try {
            const result = await value.apply(target, args);
            
            const duration = performance.now() - startTime;
            monitor.endTrace(traceId, {
              duration,
              success: true
            });
            
            // Alert on slow operations
            if (duration > 1000) {
              monitor.reportSlowOperation({
                service: serviceName,
                method: String(prop),
                duration
              });
            }
            
            return result;
          } catch (error) {
            const duration = performance.now() - startTime;
            monitor.endTrace(traceId, {
              duration,
              success: false,
              error: error.message
            });
            throw error;
          }
        };
      }
      
      return value;
    }
  });
}

// Create container with performance monitoring
function createMonitoredContainer(baseContainer: ServiceContainer) {
  const monitor = new PerformanceMonitor({
    sampleRate: 0.1, // Sample 10% of operations
    reportInterval: 60000 // Report every minute
  });
  
  return baseContainer.createScoped({
    // Wrap services with monitoring
    api: withPerformanceMonitoring(
      baseContainer.require('api'),
      'api',
      monitor
    ),
    
    database: withPerformanceMonitoring(
      baseContainer.require('database'),
      'database',
      monitor
    ),
    
    // Add the monitor itself as a service
    performanceMonitor: monitor
  });
}

// Usage
const monitoredContainer = createMonitoredContainer(mainContainer);

// Access performance metrics
const monitor = monitoredContainer.get('performanceMonitor');
const metrics = monitor.getMetrics();
console.log('Average API call duration:', metrics.api.avgDuration);
console.log('Database query count:', metrics.database.callCount);
```

## Debug Mode

Enhanced debugging capabilities in development:

```typescript
import { 
  createServiceRegistry,
  createLogger,
  createEventBus 
} from '@mfe-toolkit/core';

// Debug event bus that logs all events
class DebugEventBus {
  constructor(
    private eventBus: EventBus,
    private logger: Logger
  ) {}
  
  emit(event: string, data: any) {
    this.logger.debug(`📤 Event emitted: ${event}`, data);
    
    // Validate event structure in debug mode
    if (!event || typeof event !== 'string') {
      throw new Error(`Invalid event name: ${event}`);
    }
    
    // Track event frequency
    this.trackEventFrequency(event);
    
    return this.eventBus.emit(event, data);
  }
  
  on(event: string, handler: Function) {
    this.logger.debug(`👂 Listener registered: ${event}`);
    
    // Wrap handler to log when it's called
    const debugHandler = (data: any) => {
      this.logger.debug(`📥 Event received: ${event}`, data);
      const start = performance.now();
      
      try {
        const result = handler(data);
        const duration = performance.now() - start;
        
        if (duration > 100) {
          this.logger.warn(`Slow event handler for ${event}: ${duration}ms`);
        }
        
        return result;
      } catch (error) {
        this.logger.error(`Error in event handler for ${event}:`, error);
        throw error;
      }
    };
    
    return this.eventBus.on(event, debugHandler);
  }
  
  private eventFrequency = new Map<string, number>();
  
  private trackEventFrequency(event: string) {
    const count = (this.eventFrequency.get(event) || 0) + 1;
    this.eventFrequency.set(event, count);
    
    // Warn about potential event storms
    if (count > 100) {
      this.logger.warn(`Event storm detected: ${event} fired ${count} times`);
    }
  }
  
  getEventStats() {
    return Array.from(this.eventFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([event, count]) => ({ event, count }));
  }
}

// Create debug container
function createDebugContainer() {
  const registry = createServiceRegistry();
  
  // Enhanced debug logger
  const debugLogger = createLogger('DEBUG', {
    level: 'debug',
    showTimestamp: true,
    showCaller: true,
    colorize: true
  });
  
  registry.register('logger', debugLogger);
  
  // Debug event bus
  const eventBus = createEventBus();
  const debugEventBus = new DebugEventBus(eventBus, debugLogger);
  registry.register('eventBus', debugEventBus);
  
  // Service call tracer
  registry.register('tracer', new ServiceCallTracer());
  
  // Memory monitor
  registry.register('memoryMonitor', new MemoryMonitor({
    checkInterval: 5000,
    onLeak: (info) => {
      debugLogger.error('Potential memory leak detected:', info);
    }
  }));
  
  // State inspector
  registry.register('stateInspector', new StateInspector({
    maxDepth: 10,
    showHidden: true
  }));
  
  return registry.createContainer();
}

// Use debug container in development
const container = import.meta.env.DEV 
  ? createDebugContainer() 
  : createProductionContainer();
```

## Feature Flags

Dynamic feature enablement using scoped containers:

```typescript
interface FeatureFlags {
  newUI: boolean;
  betaFeatures: boolean;
  experimentalApi: boolean;
  performanceMode: boolean;
}

// Create container with feature-specific services
function createFeatureContainer(
  baseContainer: ServiceContainer,
  features: FeatureFlags,
  userId: string
) {
  const overrides: Record<string, any> = {};
  
  // New UI components
  if (features.newUI) {
    overrides.uiComponents = new ModernUIComponents();
    overrides.theme = new ModernTheme();
  } else {
    overrides.uiComponents = new LegacyUIComponents();
    overrides.theme = new ClassicTheme();
  }
  
  // Beta features
  if (features.betaFeatures) {
    overrides.betaService = new BetaFeatureService();
    overrides.analytics = new EnhancedAnalytics();
  }
  
  // Experimental API
  if (features.experimentalApi) {
    overrides.api = new ExperimentalApiClient({
      baseUrl: '/api/v2',
      features: ['graphql', 'websocket', 'batch']
    });
  }
  
  // Performance mode
  if (features.performanceMode) {
    overrides.cache = new AggressiveCache({
      maxSize: 100 * 1024 * 1024, // 100MB
      ttl: 3600000 // 1 hour
    });
    overrides.optimizer = new PerformanceOptimizer();
  }
  
  // Create scoped container with feature-specific services
  return baseContainer.createScoped(overrides);
}

// Usage
async function initializeUserSession(userId: string) {
  const features = await fetchUserFeatureFlags(userId);
  const container = createFeatureContainer(mainContainer, features, userId);
  
  // Services are now feature-aware
  const ui = container.get('uiComponents');
  const api = container.get('api');
  
  if (container.has('betaService')) {
    const beta = container.get('betaService');
    beta.initialize();
  }
  
  return container;
}
```

## A/B Testing

Run experiments with different service configurations:

```typescript
interface Experiment {
  id: string;
  name: string;
  variants: Array<{
    id: string;
    weight: number;
    config: Record<string, any>;
  }>;
}

class ExperimentManager {
  constructor(private baseContainer: ServiceContainer) {}
  
  createExperimentContainer(
    experiment: Experiment,
    userId: string
  ): ServiceContainer {
    // Determine variant for user
    const variant = this.selectVariant(experiment, userId);
    
    // Log experiment assignment
    this.logAssignment(userId, experiment.id, variant.id);
    
    // Create container with variant configuration
    return this.baseContainer.createScoped({
      ...variant.config,
      
      // Add experiment tracking
      analytics: new ExperimentAnalytics({
        experimentId: experiment.id,
        variantId: variant.id,
        userId,
        originalAnalytics: this.baseContainer.get('analytics')
      })
    });
  }
  
  private selectVariant(experiment: Experiment, userId: string) {
    // Consistent hashing for user assignment
    const hash = this.hashUserId(userId, experiment.id);
    const normalized = hash / 0xFFFFFFFF;
    
    let cumulative = 0;
    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (normalized < cumulative) {
        return variant;
      }
    }
    
    return experiment.variants[0];
  }
  
  private hashUserId(userId: string, salt: string): number {
    // Simple hash function for demonstration
    const str = `${userId}:${salt}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  private logAssignment(userId: string, experimentId: string, variantId: string) {
    // Log to analytics or experiment platform
    console.log(`User ${userId} assigned to ${variantId} in ${experimentId}`);
  }
}

// Example A/B test configuration
const searchExperiment: Experiment = {
  id: 'search-algorithm-v2',
  name: 'Search Algorithm Test',
  variants: [
    {
      id: 'control',
      weight: 0.5,
      config: {
        searchService: new StandardSearchService()
      }
    },
    {
      id: 'ml-powered',
      weight: 0.25,
      config: {
        searchService: new MLSearchService({
          model: 'bert-base',
          threshold: 0.8
        })
      }
    },
    {
      id: 'hybrid',
      weight: 0.25,
      config: {
        searchService: new HybridSearchService({
          primary: new MLSearchService(),
          fallback: new StandardSearchService()
        })
      }
    }
  ]
};

// Usage
const experimentManager = new ExperimentManager(mainContainer);
const userContainer = experimentManager.createExperimentContainer(
  searchExperiment,
  userId
);

// User gets variant-specific search service
const search = userContainer.get('searchService');
const results = await search.query('test query');
```

## Service Decoration

Add cross-cutting concerns to services:

```typescript
// Retry decorator
function withRetry<T extends object>(
  service: T,
  options = { maxAttempts: 3, delay: 1000 }
): T {
  return new Proxy(service, {
    get(target, prop) {
      const value = target[prop as keyof T];
      
      if (typeof value === 'function') {
        return async (...args: any[]) => {
          let lastError;
          
          for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
            try {
              return await value.apply(target, args);
            } catch (error) {
              lastError = error;
              
              if (attempt < options.maxAttempts) {
                console.log(`Retry attempt ${attempt} after error:`, error);
                await new Promise(resolve => setTimeout(resolve, options.delay));
              }
            }
          }
          
          throw lastError;
        };
      }
      
      return value;
    }
  });
}

// Circuit breaker decorator
function withCircuitBreaker<T extends object>(
  service: T,
  options = { threshold: 5, timeout: 60000 }
): T {
  const failures = new Map<string, number>();
  const lastFailure = new Map<string, number>();
  
  return new Proxy(service, {
    get(target, prop) {
      const value = target[prop as keyof T];
      const methodName = String(prop);
      
      if (typeof value === 'function') {
        return async (...args: any[]) => {
          // Check if circuit is open
          const failureCount = failures.get(methodName) || 0;
          const lastFailureTime = lastFailure.get(methodName) || 0;
          
          if (failureCount >= options.threshold) {
            if (Date.now() - lastFailureTime < options.timeout) {
              throw new Error(`Circuit breaker open for ${methodName}`);
            } else {
              // Reset circuit after timeout
              failures.delete(methodName);
              lastFailure.delete(methodName);
            }
          }
          
          try {
            const result = await value.apply(target, args);
            
            // Reset on success
            failures.delete(methodName);
            return result;
          } catch (error) {
            // Track failure
            failures.set(methodName, failureCount + 1);
            lastFailure.set(methodName, Date.now());
            throw error;
          }
        };
      }
      
      return value;
    }
  });
}

// Caching decorator
function withCache<T extends object>(
  service: T,
  cache: Map<string, any> = new Map()
): T {
  return new Proxy(service, {
    get(target, prop) {
      const value = target[prop as keyof T];
      
      if (typeof value === 'function') {
        return (...args: any[]) => {
          const cacheKey = `${String(prop)}:${JSON.stringify(args)}`;
          
          if (cache.has(cacheKey)) {
            console.log(`Cache hit for ${String(prop)}`);
            return cache.get(cacheKey);
          }
          
          const result = value.apply(target, args);
          
          // Cache promise or value
          cache.set(cacheKey, result);
          
          // Clear cache entry after TTL
          setTimeout(() => cache.delete(cacheKey), 300000); // 5 minutes
          
          return result;
        };
      }
      
      return value;
    }
  });
}

// Combine decorators
function createResilientContainer(baseContainer: ServiceContainer) {
  const api = baseContainer.require('api');
  
  // Apply multiple decorators
  const resilientApi = withCache(
    withCircuitBreaker(
      withRetry(api)
    )
  );
  
  return baseContainer.createScoped({
    api: resilientApi
  });
}
```

## Summary

These examples demonstrate the flexibility and power of the Service Registry architecture:

1. **Isolation** - Each MFE or component can have its own service configuration
2. **Testing** - Easy to mock services for unit and integration tests
3. **Multi-tenancy** - Configure services per tenant or user
4. **Monitoring** - Wrap services with performance tracking
5. **Debugging** - Enhanced debugging capabilities in development
6. **Feature Flags** - Dynamic service configuration based on features
7. **A/B Testing** - Run experiments with different service variants
8. **Decoration** - Add cross-cutting concerns like retry, caching, circuit breaking

The scoped container pattern enables all these scenarios while maintaining type safety and preventing global state pollution.