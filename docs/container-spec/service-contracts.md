# Container Service Contracts

This document defines the service interface contracts that containers and MFEs must follow. Services are defined as interfaces only, with implementations provided by containers.

## Architecture Principles

1. **Interface-Only Contracts**: Service packages define only interfaces, no implementations
2. **Container Ownership**: Containers own all service implementations
3. **Dependency Inversion**: MFEs depend on abstractions, not concrete implementations
4. **Implementation Flexibility**: Containers can swap implementations without affecting MFEs

## Service Container Interface

The service container provides access to all services through a type-safe interface:

```typescript
// From @mfe-toolkit/core
interface ServiceContainer {
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
}

// Base service map - extended via module augmentation
interface ServiceMap {
  logger: Logger;
  eventBus: EventBus;
  // Extended by service packages
}
```

## Core Service Interfaces

### Logger Service

Provides structured logging with different severity levels.

```typescript
// @mfe-toolkit/core
interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
```

**Implementation Examples:**
- Console Logger (development)
- Pino Logger (production)
- Winston Logger (enterprise)
- Sentry Logger (error tracking)

**Usage Example:**

```javascript
const logger = container.get('logger');
logger?.info('MFE initialized', { mfeId: 'example', version: '1.0.0' });
logger?.error('Failed to load data', error);
```

### Event Bus Service

Enables publish-subscribe communication between MFEs.

```typescript
// @mfe-toolkit/core
interface EventBus {
  emit<T = any>(event: string, payload: T): void;
  on<T = any>(event: string, handler: (payload: EventPayload<T>) => void): () => void;
  off(event: string, handler: (payload: EventPayload<any>) => void): void;
  once<T = any>(event: string, handler: (payload: EventPayload<T>) => void): void;
}

interface EventPayload<T = any> {
  type: string;
  data: T;
  timestamp: number;
  source: string;
}
```

**Implementation Examples:**
- Simple Event Bus (default)
- Redux-based Event Bus
- RxJS Event Bus
- PostMessage Event Bus (cross-frame)

**Standard Events:**

Containers should emit these lifecycle events:

- `mfe:loaded` - When an MFE is successfully loaded
- `mfe:unloaded` - When an MFE is unmounted
- `mfe:error` - When an MFE fails to load
- `navigation:change` - When route changes
- `auth:login` - When user logs in
- `auth:logout` - When user logs out

**Usage Example:**

```javascript
const eventBus = container.get('eventBus');

// Subscribe to events
const unsubscribe = eventBus?.on('user:updated', (payload) => {
  console.log('User updated:', payload.data);
});

// Emit events
eventBus?.emit('cart:add', { productId: '123', quantity: 1 });

// Cleanup
unsubscribe?.();
```

## Extended Service Interfaces

Service packages provide interface definitions that extend the base ServiceMap:

### Authentication Service

Manages user authentication state and permissions.

```typescript
// @mfe-toolkit/service-authentication
interface AuthService {
  getSession(): Session | null;
  isAuthenticated(): boolean;
  hasPermission(permission: string): boolean;
  hasRole(role: string): boolean;
  subscribe(callback: (session: Session | null) => void): () => void;
}

interface Session {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  token?: string;
  expiresAt?: Date;
}

// Module augmentation
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    auth: AuthService;
  }
}
```

**Usage Example:**

```javascript
const auth = container.get('auth');

if (auth?.isAuthenticated()) {
  const session = auth.getSession();
  console.log(`Welcome ${session?.username}`);
}

if (auth?.hasPermission('admin.write')) {
  // Show admin features
}
```

### Modal Service

Provides programmatic modal management.

```typescript
// @mfe-toolkit/service-modal
interface ModalService<TConfig = ModalConfig> {
  open(config: TConfig): string;
  close(id?: string): void;
  closeAll(): void;
  update(id: string, config: Partial<TConfig>): void;
  isOpen(id?: string): boolean;
  subscribe(callback: (modals: any[]) => void): () => void;
}

interface ModalConfig {
  id?: string;
  title: string;
  content: any;
  closeOnEscape?: boolean;
  onClose?: () => void;
}

// Module augmentation
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    modal: ModalService;
  }
}
```

**Usage Example:**

```javascript
const modal = container.get('modal');

const modalId = modal?.open({
  title: 'Confirm Action',
  content: 'Are you sure you want to proceed?',
  closeOnEscape: true,
  onClose: () => console.log('Modal closed'),
});

// Later, close the modal
modal?.close(modalId);
```

### Notification Service

Shows toast notifications to users.

```typescript
// @mfe-toolkit/service-notification
interface NotificationService {
  show(config: NotificationConfig): string;
  success(title: string, message?: string): string;
  error(title: string, message?: string): string;
  warning(title: string, message?: string): string;
  info(title: string, message?: string): string;
  dismiss(id: string): void;
  dismissAll(): void;
  subscribe(callback: (notifications: NotificationConfig[]) => void): () => void;
}

interface NotificationConfig {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

// Module augmentation
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    notification: NotificationService;
  }
}
```

**Usage Example:**

```javascript
const notification = container.get('notification');

// Simple notifications
notification?.success('Saved', 'Your changes have been saved');
notification?.error('Error', 'Failed to save changes');

// Advanced notification
const notifId = notification?.show({
  title: 'Processing',
  message: 'This may take a few moments',
  type: 'info',
  duration: 5000,
});

// Dismiss notification
notification?.dismiss(notifId);
```

### Error Reporter Service

Centralized error tracking and reporting.

```typescript
// @mfe-toolkit/core
interface ErrorReporter {
  reportError(
    mfeName: string,
    error: Error,
    type?: ErrorReport['type'],
    context?: any
  ): ErrorReport | null;
  getErrors(): ErrorReport[];
  clearErrors(): void;
  getSummary(): ErrorSummary;
}

interface ErrorReport {
  id: string;
  timestamp: Date;
  mfeName: string;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'load-error' | 'runtime-error' | 'network-error' | 'timeout-error';
}
```

**Implementation Examples:**
- Console Error Reporter (development)
- Sentry Error Reporter (production)
- Custom Analytics Reporter

**Usage Example:**

```javascript
const errorReporter = container.get('errorReporter');

try {
  await riskyOperation();
} catch (error) {
  errorReporter?.reportError(
    'example-mfe',
    error,
    'runtime-error',
    { action: 'riskyOperation', attemptCount: 3 }
  );
}
```

### State Manager Service

Enables cross-MFE state synchronization.

```typescript
// @mfe-toolkit/state
interface StateManager {
  get<T = any>(key: string): T | undefined;
  set<T = any>(key: string, value: T): void;
  subscribe<T = any>(key: string, callback: (value: T) => void): () => void;
  clear(): void;
}

// Module augmentation
declare module '@mfe-toolkit/core' {
  interface ServiceMap {
    stateManager?: StateManager; // Optional service
  }
}
```

**Usage Example:**

```javascript
const stateManager = container.get('stateManager');

// Set state
stateManager?.set('theme', 'dark');

// Get state
const theme = stateManager?.get('theme');

// Subscribe to changes
const unsubscribe = stateManager?.subscribe('theme', (newTheme) => {
  console.log('Theme changed to:', newTheme);
});
```

## Container Implementation Pattern

Containers provide implementations for all service interfaces:

```typescript
// apps/container-react/src/services/setup.ts
import { createServiceRegistry } from '@mfe-toolkit/core';

// Import implementations (container-owned)
import { ConsoleLogger } from './implementations/logger/console-logger';
import { PinoLogger } from './implementations/logger/pino-logger';
import { SimpleEventBus } from './implementations/event-bus/simple-event-bus';
import { DefaultErrorReporter } from './implementations/error-reporter';
import { ModalServiceImpl } from './implementations/modal';
import { NotificationServiceImpl } from './implementations/notification';

export async function setupServices() {
  const registry = createServiceRegistry();
  
  // Choose implementations based on environment
  const isProd = process.env.NODE_ENV === 'production';
  
  // Register implementations
  registry.register('logger', 
    isProd ? new PinoLogger() : new ConsoleLogger()
  );
  registry.register('eventBus', new SimpleEventBus());
  registry.register('errorReporter', new DefaultErrorReporter());
  registry.register('modal', new ModalServiceImpl());
  registry.register('notification', new NotificationServiceImpl());
  
  return registry;
}
```

## MFE Usage Pattern

MFEs use services through the container interface:

```typescript
// Any MFE
import type { MFEModule, ServiceContainer } from '@mfe-toolkit/core';

const module: MFEModule = {
  mount: async (element: HTMLElement, container: ServiceContainer) => {
    // Access services through container
    const logger = container.get('logger');
    const eventBus = container.get('eventBus');
    const modal = container.get('modal');
    
    // Services are interface-based, implementation-agnostic
    logger?.info('MFE mounted');
    
    eventBus?.on('user:login', (payload) => {
      logger?.info('User logged in', payload);
    });
    
    // Optional service handling
    if (container.has('theme')) {
      const theme = container.get('theme');
      theme?.subscribe((newTheme) => {
        // React to theme changes
      });
    }
  },
  
  unmount: async (container: ServiceContainer) => {
    container.get('logger')?.info('MFE unmounted');
  }
};

export default module;
```

## Implementation Guidelines

1. **Interface Compliance**: Implementations must match the interface exactly
2. **Error Handling**: Services should not throw errors; log them instead
3. **Performance**: Services should be lightweight and not block MFE loading
4. **Isolation**: Service state should not leak between MFEs
5. **Testing**: Provide mock implementations for testing

## Testing with Mock Services

For testing, containers can provide mock implementations:

```typescript
// test-utils/mock-services.ts
import { createServiceRegistry } from '@mfe-toolkit/core';

export function createMockServices() {
  const registry = createServiceRegistry();
  
  // Register mock implementations
  registry.register('logger', {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  });
  
  registry.register('eventBus', {
    emit: jest.fn(),
    on: jest.fn(() => jest.fn()),
    off: jest.fn(),
    once: jest.fn(),
  });
  
  registry.register('modal', {
    open: jest.fn(() => 'modal-id'),
    close: jest.fn(),
    closeAll: jest.fn(),
    update: jest.fn(),
    isOpen: jest.fn(() => false),
    subscribe: jest.fn(() => jest.fn()),
  });
  
  registry.register('notification', {
    show: jest.fn(() => 'notif-id'),
    success: jest.fn(() => 'notif-id'),
    error: jest.fn(() => 'notif-id'),
    warning: jest.fn(() => 'notif-id'),
    info: jest.fn(() => 'notif-id'),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  });
  
  return registry.createContainer();
}
```

## Best Practices

1. **Always Check Service Availability**: Use optional chaining or `has()` method
2. **Handle Missing Services Gracefully**: MFEs should work with reduced functionality
3. **Use Type Imports**: Import only types from service packages
4. **Document Required Services**: Specify in MFE manifest
5. **Version Interfaces Carefully**: Breaking interface changes require major version bumps

## Benefits of Interface-Only Architecture

### For Containers
- **Implementation Choice**: Use any implementation (Pino, Winston, Sentry, etc.)
- **Environment-Specific**: Different implementations for dev/staging/prod
- **Custom Behavior**: Easy to override or extend services
- **Testing**: Simple to provide mock implementations

### For MFEs
- **No Lock-in**: Not tied to specific implementations
- **Smaller Bundles**: No implementation code bundled
- **Type Safety**: Strong typing through interfaces
- **Framework Agnostic**: Works with any framework

### For Architecture
- **Clean Separation**: Clear boundary between contracts and implementations
- **Dependency Inversion**: MFEs depend on abstractions
- **Flexibility**: Easy to swap implementations
- **Testability**: Simple to mock and test
