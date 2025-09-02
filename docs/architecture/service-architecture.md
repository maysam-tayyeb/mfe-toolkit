# Service Architecture

## Overview

The service architecture provides a clean, type-safe way for MFEs to access container services through a simplified single-package approach. All service interfaces and tree-shakable reference implementations now live in `@mfe-toolkit/core`, providing a low barrier to entry while maintaining flexibility for custom implementations.

## Single-Package Architecture

### Design Principles

1. **Single Package**: Everything in `@mfe-toolkit/core` for simplicity
2. **Tree-Shakable**: Reference implementations only bundled when used
3. **Generic Exports**: Use generic names (createLogger, createEventBus) for easy swapping
4. **Type Safety**: MFEs import only interfaces (zero runtime cost)
5. **Flexibility**: Containers can still provide custom implementations

### Package Structure

All services are organized within `@mfe-toolkit/core`:

```
packages/mfe-toolkit-core/src/
├── services/
│   ├── types/              # ALL service interfaces
│   │   ├── logger.ts
│   │   ├── event-bus.ts
│   │   ├── error-reporter.ts
│   │   ├── modal.ts
│   │   ├── notification.ts
│   │   ├── authentication.ts
│   │   ├── authorization.ts
│   │   ├── theme.ts
│   │   └── analytics.ts
│   └── implementations/
│       ├── base/           # Base infrastructure
│       │   ├── logger/
│       │   ├── event-bus/
│       │   └── error-reporter/
│       ├── ui/             # UI services
│       │   ├── modal/
│       │   └── notification/
│       ├── auth/           # Auth services
│       │   ├── authentication/
│       │   └── authorization/
│       └── platform/       # Platform services
│           ├── theme/
│           └── analytics/
```

### Import Patterns

#### For Containers (Tree-Shakable Implementations)
```typescript
// All services from single package
import { 
  createLogger,        // Generic name for easy swapping
  createEventBus,
  createErrorReporter,
  modalServiceProvider,
  notificationServiceProvider,
  authServiceProvider,
  authorizationServiceProvider,
  themeServiceProvider,
  analyticsServiceProvider,
} from '@mfe-toolkit/core';

// Only used implementations get bundled
const logger = createLogger('Container');
const eventBus = createEventBus();
```

#### For MFEs (Type-Only Imports)
```typescript
// Import only types - zero runtime cost
import type { Logger, EventBus, ServiceContainer } from '@mfe-toolkit/core';

// Use services through container
const logger = container.get('logger');
```

### Benefits of Single-Package Approach

1. **Low Barrier to Entry**: One package to install (`@mfe-toolkit/core`)
2. **Simple Imports**: Everything from one place
3. **Easy Discovery**: All services in one package
4. **Reduced Complexity**: No need to understand multiple packages
5. **Tree-Shaking**: Automatic dead code elimination
6. **Flexibility Maintained**: Containers can still provide custom implementations

## Architecture Design

### Core Components

#### 1. Service Container (`service-container.ts`)

A single, unified service container that:
- Creates all services in one place
- Directly integrates with React contexts
- Direct method implementations
- Full TypeScript type safety

```typescript
export class UnifiedServiceContainer implements ServiceContainer {
  private services = new Map<string, unknown>();
  private contextValues: ReactContextValues | null = null;
  
  // Services read context values directly
  setContextValues(values: ReactContextValues) {
    this.contextValues = values;
  }
  
  // Direct service creation
  private getOrCreateService(name: string): unknown {
    switch (name) {
      case 'auth':
        return createAuthService(() => this.getContextValues());
      // ... other services
    }
  }
}
```

#### 2. Context Bridge (`context-bridge.tsx`)

A lightweight component that:
- Syncs React context values to service container
- Clean, functional component
- Simple useEffect-based synchronization

```typescript
export function ContextBridge({ children }: ContextBridgeProps) {
  const auth = useAuth();
  const ui = useUI();
  const serviceContainer = useServices() as UnifiedServiceContainer;

  useEffect(() => {
    serviceContainer.setContextValues({
      auth: { session: auth.session },
      ui: {
        openModal: ui.openModal,
        closeModal: ui.closeModal,
        addNotification: ui.addNotification,
      },
    });
  }, [auth.session, ui, serviceContainer]);

  return <>{children}</>;
}
```

#### 3. App Initialization (`App.tsx`)

Clean initialization pattern:
- Simple `useMemo` for container creation
- Straightforward provider hierarchy
- Clear component structure

```typescript
function App() {
  const serviceContainer = useMemo(() => createServiceContainer(), []);

  return (
    <ServiceProvider serviceContainer={serviceContainer}>
      <AuthProvider>
        <UIProvider>
          <ContextBridge>
            <RegistryProvider>
              <AppContent />
            </RegistryProvider>
          </ContextBridge>
        </UIProvider>
      </AuthProvider>
    </ServiceProvider>
  );
}
```

## Service Implementation Pattern

Services are now simple functions that read from React contexts:

```typescript
function createAuthService(getContextValues: () => ReactContextValues): AuthService {
  return {
    getSession: () => {
      const { auth } = getContextValues();
      return auth.session;
    },
    isAuthenticated: () => {
      const { auth } = getContextValues();
      return auth.session?.isAuthenticated ?? false;
    },
  };
}
```

## Benefits

### 1. Code Efficiency
- Minimal code footprint
- Single service container file
- Concise implementation

### 2. Type Safety
- Full TypeScript type safety
- Complete intellisense support
- Compile-time type checking for all services

### 3. Performance
- Direct function calls
- Minimal overhead
- Fast service access

### 4. Debugging
- Clear call stacks
- Straightforward execution flow
- Easy to set breakpoints and trace execution

### 5. Maintainability
- Single place to add new services
- Clear data flow
- Easy to understand and modify

### 6. Testing
- Simple to mock services
- Clean test setup
- Predictable behavior

## Data Flow

The simplified data flow is now:

```
React Components
    ↓
React Contexts (Auth, UI)
    ↓
ContextBridge (syncs values)
    ↓
Service Container (provides services)
    ↓
MFEs (consume services)
```

## Migration Guide

### For Existing Code

Most code doesn't need to change. The service container still implements the same `ServiceContainer` interface:

```typescript
// Still works exactly the same
const logger = serviceContainer.get('logger');
const auth = serviceContainer.require('auth');
```

### For New Services

To add a new service:

1. Define the service interface in the appropriate package
2. Add the service creation in `service-container.ts`:

```typescript
case 'myNewService':
  return createMyNewService(() => this.getContextValues());
```

3. If the service needs React context data, add it to `ReactContextValues` interface

## Testing

The new architecture is easier to test:

```typescript
describe('Service Container', () => {
  let container: UnifiedServiceContainer;
  
  beforeEach(() => {
    container = createServiceContainer();
    container.setContextValues({
      auth: { session: mockSession },
      ui: { openModal: vi.fn(), /* ... */ }
    });
  });
  
  it('should provide auth service', () => {
    const auth = container.get('auth');
    expect(auth?.getSession()).toEqual(mockSession);
  });
});
```

## Recent Improvements (January 2025)

### Simplified MFEModule Interface
The `MFEModule` interface has been streamlined by removing the redundant `metadata` field. MFEs now only need to implement `mount` and `unmount` methods:

```typescript
export interface MFEModule {
  mount(element: HTMLElement, container: ServiceContainer): void | Promise<void>;
  unmount(container: ServiceContainer): void | Promise<void>;
}
```

### Unified Event System
The EventBus now uses a unified `EventPayload` type system with intelligent overloads for type safety:

```typescript
// Type-safe event emission with overloads
eventBus.emit('mfe:loaded', { mfeId: 'example' });    // Typed event
eventBus.emit('custom', { data: 'value' });           // String event
eventBus.emit(Events.mfeLoaded('example'));           // Event factory

// Type constants for consistency
import { MFEEvents, UserEvents } from '@mfe-toolkit/core';
console.log(MFEEvents.LOADED);     // 'mfe:loaded'
console.log(UserEvents.LOGIN);     // 'user:login'
```

Key changes:
- Renamed `BaseEvent` to `EventPayload` for better semantic clarity
- Single unified API with intelligent overloads
- Event factory functions: `Events.mfeLoaded()`, `Events.userLogin()`, etc.
- Event type constants: `MFEEvents.LOADED`, `UserEvents.LOGIN`, etc.
- Full backward compatibility maintained

### Service Naming Consistency
- Renamed `AuthorizationService` to `AuthzService` for consistency with common naming conventions
- All services now available from single `@mfe-toolkit/core` package with tree-shakable implementations

### Generic Export Names
Services are exported with generic names to facilitate easy swapping of implementations:

```typescript
// Generic names in core
export { createConsoleLogger as createLogger } from './logger/console-logger';
export { createSimpleEventBus as createEventBus } from './event-bus/simple-event-bus';

// Easy to swap in container
import { createLogger } from '@mfe-toolkit/core';        // Uses console logger
// OR
import { createPinoLogger as createLogger } from './custom';  // Custom implementation
```

### Comprehensive Test Coverage
- Added 100+ tests for modal and notification services
- All core services now have comprehensive test suites
- Improved confidence in service implementations

## Future Improvements

While the current architecture is much simpler, there are still opportunities for improvement:

1. **Complete notification dismiss methods** - Currently stubbed with TODOs
2. **Add error reporter to ServiceMap** - For proper typing
3. **Consider service lifecycle management** - For services that need cleanup
4. **Add service health checks** - For monitoring service availability

## Conclusion

The service architecture provides a clean, efficient, and maintainable solution for managing container services. The direct implementation pattern ensures the codebase is approachable for developers and performs efficiently at runtime.