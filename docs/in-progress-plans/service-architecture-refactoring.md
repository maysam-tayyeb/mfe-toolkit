# Service Architecture Refactoring: Simplified Single-Package Approach

> **Updated**: January 2025 - Phase 2 Complete
> **Status**: ✅ All services migrated to single-package architecture

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

## ✅ Migration Complete

### All Services Now in Core
- **Logger**: Interface + implementation in core ✅
- **EventBus**: Interface + implementation in core ✅
- **ErrorReporter**: Interface + implementation in core ✅
- **Modal**: Interface + implementation in core ✅
- **Notification**: Interface + implementation in core ✅
- **Authentication**: Interface + implementation in core ✅
- **Authorization**: Interface + implementation in core ✅
- **Theme**: Interface + implementation in core ✅
- **Analytics**: Interface + implementation in core ✅

### Service Packages Removed
All `@mfe-toolkit/service-*` packages have been completely removed

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

### ✅ Phase 2 Complete
1. All service implementations moved to core ✅
2. Tree-shakable pattern applied to all services ✅
3. Service packages completely removed ✅
4. Clean migration without backward compatibility packages ✅

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

### ✅ Completed Phases
- **Phase 1**: Core services refactored to single package architecture
- **Phase 1.1**: Simplified to tree-shakable implementations
- **Phase 2**: All extended services migrated to core
- **Phase 3**: Core infrastructure reorganization and initial type consistency
  - Created `services/types/` for Logger and EventBus
  - Reorganized to `core/` directory structure
  - Categorized implementations (core/ui/auth/platform)
- All service packages removed
- Container and MFEs using new architecture

### ✅ Phase 4: Complete Type Organization Consistency (Complete - January 2025)

### Problem Solved
Phase 4 successfully completed the type organization work:
- **Unified Service Interfaces**: All service interfaces now in `services/types/`
- **Separated Type Categories**: Clear distinction between service interfaces and domain types
- **Consistent Organization**: Service interfaces vs domain types clearly separated

### ✅ Phase 5: Simplify Directory Structure (Complete - January 2025)

### Problem Solved
Phase 4 successfully completed the type organization work:
- **Unified Service Interfaces**: All service interfaces now in `services/types/`
- **Separated Type Categories**: Clear distinction between service interfaces and domain types
- **Consistent Organization**: Service interfaces vs domain types clearly separated

### Solution Implemented
Completed the type organization by separating service interfaces from domain types:

1. **Moved all service interfaces to `services/types/`:** ✅
   - Moved error-reporter, modal, notification, authentication, authorization, theme, analytics
   - Updated all imports to use the new location

2. **Created `domain/` directory for domain types:** ✅
   - Created new `domain/` directory
   - Moved: manifest.ts, events.ts
   - Created: state.ts (extracted StateManager interface)
   - These are data/configuration types, not service interfaces

3. **Achieved structure:**
   ```
   src/
   ├── services/types/     # ALL service interfaces
   └── domain/            # Domain/data types only
   
### Phase 5 Improvements

#### Problem Solved
- **Removed redundant nesting**: `core/` subdirectory was repetitive inside mfe-toolkit-core
- **Clarified naming**: Renamed `implementations/core/` to `implementations/base/` to avoid confusion
- **Flattened structure**: Moved directories up one level for simpler navigation

#### New Structure
```
packages/mfe-toolkit-core/src/
├── registry/           (was: core/service-registry/)
├── mfe-management/     (was: core/mfe-management/)
├── utils/              (was: core/utils/)
├── domain/             (manifest, events, state types)
├── services/
│   ├── types/          (all service interfaces)
│   └── implementations/
│       ├── base/       (was: core/ - logger, event-bus, error-reporter)
│       ├── ui/         (modal, notification)
│       ├── auth/       (authentication, authorization)
│       └── platform/   (theme, analytics)
└── index.ts
   ```

### Benefits
- **Clear Separation**: Service interfaces vs domain types
- **Complete Consistency**: All services in one place
- **Better Organization**: Easy to understand and maintain
- **Follows Architecture**: Aligns with service-oriented design

## ✅ Phase 6: Unify Event Systems (Complete - January 2025)

### Problem Solved
- **Disconnected event systems**: EventBus service used simple EventPayload while domain had rich BaseEvent types
- **Missed opportunity**: Type-safe event system wasn't being utilized by EventBus
- **Inconsistency**: Two separate event type definitions with no connection

### Solution Implemented
Unified the event systems with a single, clean API:

1. **Enhanced EventBus Interface**:
   - Now exclusively uses domain BaseEvent types
   - EventPayload has been completely removed
   - Single unified API with intelligent overloads
   - Full type safety with MFEEventMap

2. **Updated Implementation**:
   - SimpleEventBus uses BaseEvent as internal format
   - Clean implementation without conversion complexity
   - Built-in debugging features
   - Better performance without format conversions

3. **Simplified Types**:
   - Only `isBaseEvent()` type guard needed
   - No conversion utilities required
   - Cleaner, simpler API surface

### Benefits
- **Type-safe events**: Full IntelliSense and compile-time checking
- **Rich event system**: Leverage predefined MFE events (lifecycle, navigation, user, state, communication)
- **Backward compatible**: Existing code continues to work
- **Migration path**: Gradual adoption of typed events
- **Better DX**: Auto-completion and type checking for events

## ✅ Phase 7: Event Bus Service Cleanup (Complete - January 2025)

### Overview
Successfully cleaned up and simplified the EventBus API to provide a single, intuitive interface that leverages the full power of our type-safe event system.

### Achieved Goals
1. **Simplified API**: ✅ Single set of methods with intelligent overloads
2. **Type Safety by Default**: ✅ Full IntelliSense and compile-time checking
3. **Migration Support**: ✅ Factory functions and type constants for easy migration
4. **Developer Tools**: ✅ Built-in debugging, logging, history, and stats
5. **Zero Breaking Changes**: ✅ Full backward compatibility maintained

### Implemented Features
- **Event Factory Functions**: `Events.mfeLoaded()`, `Events.userLogin()`, etc.
- **Event Type Constants**: `MFEEvents.LOADED`, `MFEEvents.USER_LOGIN`, etc.
- **Simplified Interface**: Single `emit()`, `on()`, `once()` with overloads
- **Debugging Features**: Event history, statistics, logging, validation
- **Clean Implementation**: Single internal format (BaseEvent)

### Implementation Details
See [event-bus-cleanup.md](./event-bus-cleanup.md) for full details

### Expected Benefits
- **Cleaner API**: One way to do things, not two
- **Better Type Safety**: Full IntelliSense and compile-time checking
- **Easier to Learn**: Simpler mental model, better documentation
- **Better Debugging**: Event history, logging, visualization
- **Smooth Migration**: Clear path from legacy to typed events

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
- [ ] Complete type organization consistency (Phase 4)
- [ ] Update documentation completely
- [ ] Create migration guide
- [ ] Verify tree-shaking in production builds