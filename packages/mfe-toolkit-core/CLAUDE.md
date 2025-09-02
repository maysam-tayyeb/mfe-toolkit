# packages/mfe-toolkit-core/CLAUDE.md

This file provides guidance for working with the @mfe-toolkit/core package.

## Service Architecture

### Current State (January 2025)
All services are now consolidated in this single package following interface/implementation separation.

### Directory Structure
```
src/
├── types/              # Service interfaces
│   ├── services.ts     # Core service interfaces
│   ├── mfe.ts         # MFEModule interface
│   └── manifest.ts    # Manifest types
├── implementations/    # Tree-shakable implementations
│   ├── logger/        # Logger implementations
│   ├── event-bus/     # EventBus implementations
│   ├── modal/         # Modal implementations
│   └── ...
└── index.ts           # Public exports
```

### Service Interfaces

All service interfaces are defined in `src/types/`:
- `Logger`, `EventBus`, `ErrorReporter` (core)
- `ModalService`, `NotificationService` (UI)
- `AuthService`, `AuthzService` (auth)
- `ThemeService`, `AnalyticsService` (platform)

### Implementation Pattern

```typescript
// Interface (in types/)
export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

// Implementation (in implementations/)
export class ConsoleLogger implements Logger {
  // Implementation details
}

// Factory export
export function createLogger(config?: LoggerConfig): Logger {
  return new ConsoleLogger(config);
}
```

### Key Components

#### ServiceContainer
- Manages service instances
- Type-safe service retrieval
- No global pollution

#### EventPayload System
- Type-safe event handling
- Replaces old BaseEvent
- Used across all services

#### MFEModule Interface
Simplified interface without redundant metadata:
```typescript
export interface MFEModule {
  mount(element: HTMLElement, container: ServiceContainer): Promise<void>;
  unmount(container: ServiceContainer): Promise<void>;
}
```

### Build Utilities

The `buildMFE` utility handles:
- Automatic dependency detection
- Versioned imports (react → react@18)
- Manifest validation
- ES module output

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

Current coverage: 75+ tests passing with comprehensive coverage.

## Important Notes

- All implementations are tree-shakable
- No global/window pollution
- Full TypeScript support
- Containers provide actual implementations
- MFEs depend only on interfaces