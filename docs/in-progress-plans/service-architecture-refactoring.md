# Service Architecture Refactoring: Simplified Single-Package Approach

> **Updated**: January 2025 - Revised to single-package architecture

## Problem Statement

The original multi-package approach created unnecessary complexity:

1. **Too Many Packages**: Separate implementation packages increased learning curve
2. **Complex Imports**: Developers needed to know which package contained what
3. **Maintenance Overhead**: Multiple packages to version and maintain

## Solution: Simplified Architecture

All service interfaces AND tree-shakable reference implementations now live in `@mfe-toolkit/core`, providing:

1. **Low Barrier to Entry**: Single package to install
2. **Tree-Shaking**: Only used implementations get bundled
3. **Flexibility**: Containers can still provide custom implementations
4. **Type Safety**: MFEs import only types (zero runtime cost)

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

## Current Architecture (Simplified)

### Design Principles

1. **Single Package**: Everything in `@mfe-toolkit/core` for simplicity
2. **Tree-Shakable**: Reference implementations only bundled when used
3. **Generic Exports**: Use generic names (createLogger) for easy swapping
4. **Type Safety**: MFEs import only interfaces (zero runtime cost)
5. **Flexibility**: Containers can still provide custom implementations

### Package Structure

```
packages/
└── @mfe-toolkit/core/
    ├── src/
    │   ├── services/registry/types.ts  # Service interfaces
    │   ├── types/                       # Additional types
    │   │   └── error-reporter.ts        # ErrorReporter types
    │   ├── implementations/             # Tree-shakable implementations
    │   │   ├── logger/
    │   │   │   └── console-logger.ts    # ConsoleLogger class
    │   │   ├── event-bus/
    │   │   │   └── simple-event-bus.ts  # SimpleEventBus class
    │   │   ├── error-reporter/
    │   │   │   └── default-error-reporter.ts # DefaultErrorReporter
    │   │   └── index.ts                 # Re-exports with generic names
    │   └── index.ts                     # Main exports

apps/
└── container-react/
    ├── src/services/
    │   └── service-setup.ts            # Uses core implementations
    └── custom/ (optional)
        └── pino-logger.ts               # Custom implementation example
```

### Export Strategy

```typescript
// implementations/index.ts
export { createConsoleLogger as createLogger } from './logger/console-logger';
export { createSimpleEventBus as createEventBus } from './event-bus/simple-event-bus';
export { createErrorReporter as getErrorReporter } from './error-reporter/default-error-reporter';
```

## Implementation Status

### ✅ Phase 1 & 1.1: Core Services (COMPLETED - January 2025)

All core services now follow the simplified architecture with interfaces and tree-shakable implementations in `@mfe-toolkit/core`.

#### Example: Logger Service
```typescript
// Interface in @mfe-toolkit/core/src/services/registry/types.ts
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

// Implementation in @mfe-toolkit/core/src/implementations/logger/console-logger.ts
export class ConsoleLogger implements Logger {
  // Implementation details...
}

export function createConsoleLogger(prefix?: string): Logger {
  return new ConsoleLogger(prefix);
}

// Re-exported with generic name in implementations/index.ts
export { createConsoleLogger as createLogger } from './logger/console-logger';

// Container usage
import { createLogger } from '@mfe-toolkit/core'; // Tree-shakable
const logger = createLogger('MyApp');

// MFE usage
import type { Logger } from '@mfe-toolkit/core'; // Type only, zero runtime
```

Similar patterns are applied for EventBus and ErrorReporter services, with all implementations living in `@mfe-toolkit/core/src/implementations/` as tree-shakable exports.

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

### Phase 3: Container Service Setup (Simplified)

```typescript
// apps/container-react/src/services/service-setup.ts
import { 
  createServiceRegistry,
  createLogger,      // Tree-shakable from core
  createEventBus,    // Reference implementations
  createErrorReporter 
} from '@mfe-toolkit/core';

export async function setupServices() {
  const registry = createServiceRegistry();
  
  // Use reference implementations (tree-shakable)
  registry.register('logger', createLogger('Container'));
  registry.register('eventBus', createEventBus('Container'));
  registry.register('errorReporter', createErrorReporter({
    maxErrorsPerSession: 100,
    enableConsoleLog: true
  }));
  
  // Future: service packages will follow same pattern
  // registry.register('modal', createModal());
  // registry.register('notification', createNotification());
  
  return registry;
}

// Custom implementation example
import { PinoLogger } from './custom/pino-logger';

if (process.env.NODE_ENV === 'production') {
  registry.register('logger', new PinoLogger({ level: 'info' }));
}
```

## Migration Strategy (Simplified - No Breaking Changes)

### ✅ Completed
1. Move implementations to `@mfe-toolkit/core/src/implementations/`
2. Export with generic names for easy refactoring
3. Tree-shakable - only used implementations get bundled
4. MFEs already use interfaces - no changes needed

### 🚧 Next Steps (Phase 2)
1. Move Modal, Notification, Auth services to core implementations
2. Follow same tree-shakable pattern
3. Deprecate service packages (but keep for compatibility)
4. No breaking changes required

## Benefits of Simplified Architecture

### Single Package Advantage
- **Low Barrier to Entry**: One package to install (`@mfe-toolkit/core`)
- **Simple Imports**: Everything from one place
- **Easy Discovery**: All services in one package
- **Reduced Complexity**: No need to understand multiple packages

### Tree-Shaking Benefits
- **MFEs**: Import only types (zero runtime cost)
- **Containers**: Only used implementations get bundled
- **Optimized Bundles**: Automatic dead code elimination

### Flexibility Maintained
- **Custom Implementations**: Containers can still provide their own
- **Environment-Specific**: Different implementations for dev/prod
- **Easy Testing**: Mock interfaces, not implementations
- **Framework Agnostic**: Works with any framework

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

### ✅ Completed (Phase 1 & 1.1)
- Core services refactored to single package architecture
- Tree-shakable implementations in place
- Container using new architecture

### 🚧 Remaining Work (Phase 2)
- **Week 1**: Move Modal and Notification services to core
- **Week 2**: Move Auth, Authorization, Theme, Analytics to core
- **Week 3**: Update documentation and examples
- **Week 4**: Deprecate service packages (keep for compatibility)

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

### ✅ Achieved
- [x] Single package architecture implemented
- [x] Tree-shakable implementations in core
- [x] Generic export names for easy refactoring
- [x] MFEs use only interfaces (zero runtime)
- [x] Container can swap implementations
- [x] All tests pass with new architecture

### 🚧 In Progress
- [ ] Move extended services to core (Modal, Notification, etc.)
- [ ] Update documentation completely
- [ ] Create migration guide for service packages
- [ ] Verify tree-shaking in production builds