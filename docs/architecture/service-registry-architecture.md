# Service Registry Architecture

## Overview

The Service Registry architecture in `@mfe-toolkit/core` provides a powerful dependency injection system that separates service definition from runtime access. With the simplified single-package approach, all service interfaces and tree-shakable reference implementations are now available from `@mfe-toolkit/core`, making it easier to get started while maintaining flexibility for advanced scenarios like MFE isolation, testing with mocked services, and multi-tenant configurations.

## Core Concepts

### Service Registry vs Service Container

The architecture deliberately separates two concerns:

1. **Service Registry** - The catalog of available services
   - Manages service definitions and metadata
   - Handles service providers for lazy initialization
   - Resolves dependencies between services
   - Controls service lifecycle (initialization/disposal)
   - Single source of truth for what services exist

2. **Service Container** - The runtime context for accessing services
   - Provides type-safe access to services
   - Enables scoping and isolation
   - Allows creation of child containers with overrides
   - Lightweight wrapper around services
   - Can be instantiated multiple times from the same registry

```typescript
// Import everything from single package - tree-shakable
import { 
  createServiceRegistry,
  createLogger,           // Generic name for easy swapping
  createEventBus,
  authServiceProvider,
  modalServiceProvider
} from '@mfe-toolkit/core';

// Registry manages definitions
const registry = createServiceRegistry();
registry.register('logger', createLogger('app'));
registry.register('eventBus', createEventBus());
registry.registerProvider(authServiceProvider);
registry.registerProvider(modalServiceProvider);

// Container provides runtime access
const container = registry.createContainer();
const logger = container.get('logger');
```

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Service Registry                      │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  Services   │  │   Providers  │  │    Metadata    │   │
│  │    Map      │  │     Map      │  │      Map       │   │
│  └─────────────┘  └──────────────┘  └────────────────┘   │
│                                                          │
│  • register()           • initialize()                   │
│  • registerProvider()   • topologicalSort()              │
│  • getMetadata()        • dispose()                      │
└──────────────────────────────────────────────────────────┘
                            │
                    createContainer()
                            ↓
┌──────────────────────────────────────────────────────────┐
│                   Service Container                      │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Parent Services Map                    │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  • get<T>(name)         • listAvailable()                │
│  • require<T>(name)     • getAllServices()               │
│  • has(name)            • dispose()                      │
│  • createScoped() ────────┐                              │
└───────────────────────────┴──────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────┐
│                  Scoped Container                        │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │    Parent Services + Override Services Map          │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  • Inherits parent services                              │
│  • Can override specific services                        │
│  • Can add new services                                  │
│  • Isolated from parent changes                          │
└──────────────────────────────────────────────────────────┘
```

## Scoping Scenarios

### 1. MFE Isolation

Each MFE can receive a scoped container with customized services:

```typescript
// All services imported from single package
import { createLogger, createErrorReporter } from '@mfe-toolkit/core';

// Container application creates scoped containers for each MFE
const mfeContainer = mainContainer.createScoped({
  // MFE-specific logger with prefixed output
  logger: createLogger(`MFE:${mfeName}`),
  
  // MFE-specific error reporter
  errorReporter: createErrorReporter({
    context: { mfe: mfeName }
  }),
  
  // Scoped event bus channel
  eventBus: eventBus.createChannel(`mfe:${mfeName}`)
});

// MFE receives the scoped container
mfeModule.mount(element, mfeContainer);
```

### 2. Testing

Create containers with mocked services for testing:

```typescript
describe('MyComponent', () => {
  it('should handle notifications', async () => {
    const mockNotification = {
      show: jest.fn(),
      hide: jest.fn()
    };
    
    const testContainer = container.createScoped({
      notification: mockNotification,
      auth: mockAuthService
    });
    
    // Component uses test container
    const component = new MyComponent(testContainer);
    component.showAlert();
    
    expect(mockNotification.show).toHaveBeenCalled();
  });
});
```

### 3. Multi-Tenancy

Different containers for different user contexts:

```typescript
// Create tenant-specific container
function createTenantContainer(tenantId: string, userId: string) {
  return mainContainer.createScoped({
    auth: {
      ...authService,
      tenantId,
      userId,
      permissions: getTenantPermissions(tenantId, userId)
    },
    
    api: createApiClient({
      baseUrl: getTenantApiUrl(tenantId),
      headers: { 'X-Tenant-ID': tenantId }
    }),
    
    theme: getTenantTheme(tenantId)
  });
}

// Each user session gets their own container
const userContainer = createTenantContainer('acme-corp', 'user-123');
```

### 4. Debug Mode

Enhanced services for debugging:

```typescript
if (import.meta.env.DEV) {
  const debugContainer = container.createScoped({
    logger: createLogger('debug', { 
      level: 'debug',
      showTimestamp: true,
      showCaller: true
    }),
    
    eventBus: new DebugEventBus(eventBus, {
      logAllEvents: true,
      validatePayloads: true
    }),
    
    performanceMonitor: createPerformanceMonitor()
  });
  
  // Use debug container in development
  return debugContainer;
}
```

## Service Provider Patterns

### Singleton Provider

Creates a service instance once and reuses it:

```typescript
const authServiceProvider = createSingletonProvider({
  name: 'auth',
  version: '1.0.0',
  dependencies: ['logger', 'api'],
  
  factory: (container) => {
    const logger = container.require('logger');
    const api = container.require('api');
    
    return new AuthService({ logger, api });
  },
  
  dispose: async () => {
    // Cleanup logic
  }
});
```

### Factory Provider

Creates a new instance each time:

```typescript
const modalServiceProvider = createFactoryProvider({
  name: 'modal',
  version: '1.0.0',
  dependencies: ['dom'],
  
  factory: (container) => {
    return new ModalInstance({
      container: container.get('dom')
    });
  }
});
```

### Composed Provider

Combines multiple providers:

```typescript
const uiServicesProvider = composeProviders([
  modalServiceProvider,
  notificationServiceProvider,
  tooltipServiceProvider
]);
```

## Type Safety

The ServiceMap interface enables compile-time type checking. With the single-package approach, MFEs import only types for zero runtime cost:

```typescript
// MFEs import only types - zero runtime cost
import type { Logger, EventBus, ServiceContainer } from '@mfe-toolkit/core';

// Extend ServiceMap via module augmentation
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    myCustomService: MyCustomService;
  }
}

// Type-safe access
const service = container.get('myCustomService'); // Type: MyCustomService | undefined
const required = container.require('myCustomService'); // Type: MyCustomService (throws if not found)

// MFE usage pattern
export function mountMFE(element: HTMLElement, container: ServiceContainer) {
  const logger = container.get('logger');  // Type-safe, no implementation imported
  logger?.info('MFE mounted');
}
```

## Benefits

### 1. Separation of Concerns
- Registry manages "what exists" (definition/catalog)
- Container manages "what's available here" (runtime context)
- Clear boundaries between configuration and usage

### 2. Flexibility
- Multiple containers from one registry
- Different service combinations per context
- Runtime service substitution
- Dynamic service registration

### 3. Type Safety
- ServiceMap interface for compile-time checking
- Module augmentation for extending types
- IntelliSense support in IDEs

### 4. Performance
- Lazy initialization via providers
- Tree-shakable implementations - only used services get bundled
- Shared instances where appropriate
- Lightweight container creation
- Efficient dependency resolution
- Zero runtime cost for MFEs (type-only imports)

### 5. Testability
- Easy service mocking
- Isolated test environments
- No global state pollution
- Deterministic behavior

### 6. Maintainability
- Clear service dependencies
- Automatic circular dependency detection
- Structured disposal/cleanup
- Service versioning support

## Best Practices

### 1. Always Use Providers for Complex Services

```typescript
// ✅ Good - Uses provider for lazy initialization
registry.registerProvider(createSingletonProvider({
  name: 'database',
  factory: async (container) => {
    const config = container.require('config');
    return await DatabaseClient.connect(config.dbUrl);
  }
}));

// ❌ Bad - Eager initialization
const db = await DatabaseClient.connect(config.dbUrl);
registry.register('database', db);
```

### 2. Declare Dependencies Explicitly

```typescript
// ✅ Good - Clear dependencies
const serviceProvider = {
  name: 'userService',
  dependencies: ['database', 'logger', 'cache'],
  create: (container) => {
    // Service can safely require these
  }
};

// ❌ Bad - Hidden dependencies
const serviceProvider = {
  name: 'userService',
  create: (container) => {
    const db = container.get('database'); // Might not exist!
  }
};
```

### 3. Use Scoped Containers for Isolation

```typescript
// ✅ Good - Each MFE gets isolated container
mfes.forEach(mfe => {
  const scopedContainer = container.createScoped({
    logger: createLogger(mfe.name)
  });
  mfe.mount(element, scopedContainer);
});

// ❌ Bad - All MFEs share same container
mfes.forEach(mfe => {
  mfe.mount(element, container); // No isolation
});
```

### 4. Dispose Properly

```typescript
// ✅ Good - Proper cleanup
const container = registry.createContainer();
try {
  // Use container
} finally {
  await container.dispose();
}

// ❌ Bad - Memory leak
const container = registry.createContainer();
// Never disposed!
```

## Migration Guide

If you're currently using a global service pattern, here's how to migrate:

### Before (Global Services)

```typescript
// Global pollution
window.services = {
  logger: new Logger(),
  auth: new AuthService()
};

// MFE accesses global
function mountMFE() {
  window.services.logger.info('Mounted');
}
```

### After (Service Registry)

```typescript
// No global pollution
const registry = createServiceRegistry();
registry.register('logger', new Logger());
registry.register('auth', new AuthService());

// MFE receives services via injection
function mountMFE(element: HTMLElement, container: ServiceContainer) {
  const logger = container.require('logger');
  logger.info('Mounted');
}
```

## Advanced Topics

### Custom Provider Types

Create specialized providers for your use case:

```typescript
function createCachedProvider<T>(options: CreateProviderOptions<T>, ttl: number) {
  let instance: T | undefined;
  let createdAt: number | undefined;
  
  return {
    ...options,
    create: async (container) => {
      const now = Date.now();
      if (instance && createdAt && (now - createdAt) < ttl) {
        return instance;
      }
      
      instance = await options.factory(container);
      createdAt = now;
      return instance;
    }
  };
}
```

### Service Decorators

Wrap services with additional functionality:

```typescript
function withLogging<T>(service: T, name: string, logger: Logger): T {
  return new Proxy(service as any, {
    get(target, prop) {
      const value = target[prop];
      if (typeof value === 'function') {
        return (...args: any[]) => {
          logger.debug(`${name}.${String(prop)} called`, args);
          const result = value.apply(target, args);
          logger.debug(`${name}.${String(prop)} returned`, result);
          return result;
        };
      }
      return value;
    }
  });
}

// Use in container
const debugContainer = container.createScoped({
  userService: withLogging(userService, 'UserService', logger)
});
```

### Async Service Resolution

Handle services that require async initialization:

```typescript
const registry = createServiceRegistry();

// Register async provider
registry.registerProvider({
  name: 'config',
  version: '1.0.0',
  create: async () => {
    const config = await fetch('/api/config').then(r => r.json());
    return config;
  }
});

// Initialize all async services
await registry.initialize();

// Now all services are ready
const container = registry.createContainer();
```

## Conclusion

The Service Registry architecture provides a robust foundation for managing services in microfrontend applications. By separating service definition from runtime access and enabling scoped containers, it supports advanced scenarios while maintaining type safety and preventing global pollution.

Key takeaways:
- Use Service Registry to manage service definitions
- Use Service Container for runtime access
- Leverage scoped containers for isolation
- Follow best practices for maintainable code
- Take advantage of TypeScript for type safety