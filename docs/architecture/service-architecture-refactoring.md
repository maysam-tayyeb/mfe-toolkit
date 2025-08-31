# Service Architecture Refactoring: Interface/Implementation Separation

## Problem Statement

The current architecture violates the Dependency Inversion Principle by having service implementations in packages when they should only provide interfaces/types. This creates several issues:

1. **Tight Coupling**: MFEs are coupled to specific implementations rather than abstractions
2. **Limited Flexibility**: Container applications cannot easily swap implementations (e.g., using Pino instead of console logger)
3. **Testing Difficulties**: Hard to mock services when implementations are bundled with interfaces
4. **Package Bloat**: Service packages include implementation code that may not be needed

## Current Architecture Issues

### Services with Implementation in Core
- **Logger**: Full implementation in `@mfe-toolkit/core/src/services/logger.ts`
- **EventBus**: Full implementation in `@mfe-toolkit/core/src/services/event-bus.ts`
- **ErrorReporter**: Full implementation in `@mfe-toolkit/core/src/services/error-reporter.ts`

### Service Packages with Implementations
- `@mfe-toolkit/service-modal`: Contains `ModalServiceImpl` class
- `@mfe-toolkit/service-notification`: Contains `NotificationServiceImpl` class
- `@mfe-toolkit/service-authentication`: Contains implementation
- `@mfe-toolkit/service-authorization`: Contains implementation
- `@mfe-toolkit/service-theme`: Contains implementation
- `@mfe-toolkit/service-analytics`: Contains implementation

## Proposed Architecture

### Design Principles

1. **Dependency Inversion**: MFEs depend on interfaces, not implementations
2. **Single Responsibility**: Packages define contracts, containers provide implementations
3. **Open/Closed**: Easy to extend with new implementations without modifying packages
4. **Interface Segregation**: Small, focused interfaces for each service

### Package Structure

```
packages/
├── @mfe-toolkit/core/
│   ├── types/
│   │   ├── services.ts         # Core service interfaces only
│   │   ├── logger.ts           # Logger interface
│   │   ├── event-bus.ts        # EventBus interface
│   │   └── error-reporter.ts   # ErrorReporter interface
│   └── index.ts                # Re-export types only
│
├── @mfe-toolkit/service-modal/
│   ├── types.ts                # ModalService interface
│   ├── index.ts                # Export types
│   └── default-impl.ts         # Optional: Default implementation (separate export)
│
└── @mfe-toolkit/service-notification/
    ├── types.ts                # NotificationService interface
    ├── index.ts                # Export types
    └── default-impl.ts         # Optional: Default implementation (separate export)

apps/
└── container-react/
    └── services/
        ├── implementations/
        │   ├── logger/
        │   │   ├── console-logger.ts    # Default console implementation
        │   │   ├── pino-logger.ts       # Pino implementation
        │   │   └── winston-logger.ts    # Winston implementation
        │   ├── event-bus/
        │   │   ├── simple-event-bus.ts  # Default implementation
        │   │   └── redux-event-bus.ts   # Redux-based implementation
        │   ├── modal/
        │   │   └── modal-service.ts     # Container's modal implementation
        │   └── notification/
        │       └── notification-service.ts # Container's notification implementation
        └── service-setup.ts             # Wire up chosen implementations
```

## Implementation Plan

### Phase 1: Core Services Refactoring

#### 1.1 Logger Service
```typescript
// packages/mfe-toolkit-core/src/types/logger.ts
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// apps/container-react/src/services/implementations/logger/console-logger.ts
import type { Logger } from '@mfe-toolkit/core';

export class ConsoleLogger implements Logger {
  constructor(private prefix: string) {}
  
  debug(message: string, ...args: any[]): void {
    console.debug(`[${this.prefix}] ${message}`, ...args);
  }
  // ... other methods
}

// apps/container-react/src/services/implementations/logger/pino-logger.ts
import type { Logger } from '@mfe-toolkit/core';
import pino from 'pino';

export class PinoLogger implements Logger {
  private pino: pino.Logger;
  
  constructor(options: pino.LoggerOptions) {
    this.pino = pino(options);
  }
  
  debug(message: string, ...args: any[]): void {
    this.pino.debug({ args }, message);
  }
  // ... other methods
}
```

#### 1.2 EventBus Service
```typescript
// packages/mfe-toolkit-core/src/types/event-bus.ts
export interface EventPayload<T = any> {
  type: string;
  data: T;
  timestamp: number;
  source: string;
}

export interface EventBus {
  emit<T = any>(event: string, payload: T): void;
  on<T = any>(event: string, handler: (payload: EventPayload<T>) => void): () => void;
  off(event: string, handler: (payload: EventPayload<any>) => void): void;
  once<T = any>(event: string, handler: (payload: EventPayload<T>) => void): void;
}

// apps/container-react/src/services/implementations/event-bus/simple-event-bus.ts
import type { EventBus, EventPayload } from '@mfe-toolkit/core';

export class SimpleEventBus implements EventBus {
  private listeners = new Map<string, Set<Function>>();
  
  emit<T = any>(event: string, payload: T): void {
    // Implementation
  }
  // ... other methods
}
```

#### 1.3 ErrorReporter Service
```typescript
// packages/mfe-toolkit-core/src/types/error-reporter.ts
export interface ErrorReport {
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

export interface ErrorReporter {
  reportError(
    mfeName: string,
    error: Error,
    type?: ErrorReport['type'],
    context?: any
  ): ErrorReport | null;
  getErrors(): ErrorReport[];
  clearErrors(): void;
}

// apps/container-react/src/services/implementations/error-reporter/default-error-reporter.ts
import type { ErrorReporter, ErrorReport } from '@mfe-toolkit/core';

export class DefaultErrorReporter implements ErrorReporter {
  private errors: ErrorReport[] = [];
  
  reportError(/* params */): ErrorReport | null {
    // Implementation
  }
  // ... other methods
}
```

### Phase 2: Service Package Refactoring

#### 2.1 Modal Service Package
```typescript
// packages/mfe-toolkit-service-modal/src/types.ts
export interface ModalConfig {
  id?: string;
  title: string;
  content: React.ReactNode | string;
  closeOnEscape?: boolean;
  onClose?: () => void;
}

export interface ModalService<TConfig = ModalConfig> {
  open(config: TConfig): string;
  close(id?: string): void;
  closeAll(): void;
  update(id: string, config: Partial<TConfig>): void;
  isOpen(id?: string): boolean;
  subscribe(callback: (modals: any[]) => void): () => void;
}

// packages/mfe-toolkit-service-modal/src/index.ts
export type { ModalService, ModalConfig } from './types';

// packages/mfe-toolkit-service-modal/src/default-impl.ts (optional, separate export)
export { ModalServiceImpl } from './modal-service-impl';
export { createModalService } from './factory';
```

#### 2.2 Service Provider Pattern (Optional Utilities)
```typescript
// packages/mfe-toolkit-core/src/types/service-provider.ts
export interface ServiceProvider<T = any> {
  name: string;
  version: string;
  dependencies?: string[];
  create(container: ServiceContainer): T | Promise<T>;
  dispose?: () => void | Promise<void>;
}

// This becomes an optional utility, not required
export function createServiceProvider<T>(
  name: string,
  factory: () => T
): ServiceProvider<T> {
  return {
    name,
    version: '1.0.0',
    create: factory,
  };
}
```

### Phase 3: Container Service Setup

```typescript
// apps/container-react/src/services/service-setup.ts
import { createServiceRegistry } from '@mfe-toolkit/core';
import type { Logger, EventBus, ErrorReporter } from '@mfe-toolkit/core';
import type { ModalService } from '@mfe-toolkit/service-modal';
import type { NotificationService } from '@mfe-toolkit/service-notification';

// Import implementations
import { ConsoleLogger } from './implementations/logger/console-logger';
import { PinoLogger } from './implementations/logger/pino-logger';
import { SimpleEventBus } from './implementations/event-bus/simple-event-bus';
import { DefaultErrorReporter } from './implementations/error-reporter/default-error-reporter';
import { ModalServiceImpl } from './implementations/modal/modal-service';
import { NotificationServiceImpl } from './implementations/notification/notification-service';

export async function setupServices() {
  const registry = createServiceRegistry();
  
  // Choose implementations based on environment or configuration
  const useProductionLogger = process.env.NODE_ENV === 'production';
  
  // Register chosen implementations
  registry.register<Logger>('logger', 
    useProductionLogger 
      ? new PinoLogger({ level: 'info' })
      : new ConsoleLogger('Container')
  );
  
  registry.register<EventBus>('eventBus', new SimpleEventBus());
  registry.register<ErrorReporter>('errorReporter', new DefaultErrorReporter());
  registry.register<ModalService>('modal', new ModalServiceImpl());
  registry.register<NotificationService>('notification', new NotificationServiceImpl());
  
  return registry;
}
```

## Migration Strategy

### Step 1: Create New Interfaces (Non-Breaking)
1. Add interface-only exports alongside existing implementations
2. Mark implementation exports as deprecated
3. Update documentation

### Step 2: Container Implementation (Non-Breaking)
1. Create implementation classes in container
2. Update service setup to use container implementations
3. Test thoroughly with existing MFEs

### Step 3: Update MFEs (Gradual)
1. Update MFE imports to use interface types only
2. Remove any direct implementation dependencies
3. Test each MFE after update

### Step 4: Remove Deprecated Code (Breaking)
1. Remove implementation code from packages
2. Bump major version numbers
3. Update all dependent packages

## Benefits

### For Container Applications
- **Implementation Choice**: Use any logger (Console, Pino, Winston, etc.)
- **Custom Behavior**: Override any service with custom implementation
- **Environment-Specific**: Different implementations for dev/prod
- **Testing**: Easy to mock services

### For MFEs
- **Type Safety**: Strong typing through interfaces
- **No Implementation Lock-in**: Not tied to specific implementations
- **Smaller Bundles**: No unnecessary implementation code
- **Framework Agnostic**: Works with any framework

### For Testing
- **Easy Mocking**: Mock interfaces, not implementations
- **Isolated Testing**: Test MFEs without real services
- **Test Implementations**: Separate testing of service implementations

## Example: Using Different Logger Implementations

```typescript
// Development: Console Logger with pretty printing
if (process.env.NODE_ENV === 'development') {
  registry.register('logger', new ConsoleLogger('Dev'));
}

// Production: Pino with JSON output
if (process.env.NODE_ENV === 'production') {
  registry.register('logger', new PinoLogger({
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: { colorize: false }
    }
  }));
}

// Testing: Mock Logger
if (process.env.NODE_ENV === 'test') {
  registry.register('logger', {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  });
}
```

## Considerations

### Backward Compatibility
- Maintain deprecated exports during transition
- Use semantic versioning for breaking changes
- Provide migration guides

### Default Implementations
- Service packages can provide optional default implementations
- These are separate exports, not required
- Containers can choose to use them or provide custom ones

### Service Discovery
- MFEs declare required services in manifest
- Container validates service availability
- Runtime checks for optional services

## Timeline

1. **Week 1**: Refactor core services (Logger, EventBus, ErrorReporter)
2. **Week 2**: Refactor service packages to interface-only
3. **Week 3**: Implement container service implementations
4. **Week 4**: Test with existing MFEs, update documentation
5. **Week 5-6**: Gradual MFE migration
6. **Week 7**: Remove deprecated code, major version bump

## CLI Template Updates

The CLI templates need to be updated to reflect the new architecture where services are interfaces only:

### Current Template Issues
All templates currently import types from `@mfe-toolkit/core` and use `ServiceContainer` which works correctly. However, we should ensure:

1. **Type imports only**: Templates should only import types, never implementations
2. **Service usage**: Always check service availability before use
3. **No direct implementation dependencies**: Templates should not import service implementations

### Template Changes Required

No changes are needed for the current templates as they already:
- Import only types (`ServiceContainer`) from `@mfe-toolkit/core`
- Use `container.get('logger')` to access services (interface-based)
- Check service availability with optional chaining (`?.`)
- Don't import any implementations directly

The templates are already following best practices for the new architecture.

## Success Criteria

- [ ] All service packages export only interfaces
- [ ] Container owns all service implementations
- [ ] MFEs depend only on interfaces
- [ ] Container can swap implementations without affecting MFEs
- [ ] All tests pass with new architecture
- [ ] Documentation updated
- [ ] Migration guide published
- [ ] CLI templates verified to use only interfaces